import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check,
  Monitor,
  Smartphone,
  Tablet,
  X,
  ExternalLink,
} from 'lucide-react';

import Sidebar from '../../components/page-builder/Sidebar';
import Topbar from '../../components/page-builder/Topbar';
import BlockEditor from '../../components/page-builder/BlockEditor';
import SettingsPanel from '../../components/page-builder/SettingsPanel';
import { initialBlocks } from '../../components/page-builder/data/initialBlocks';
import pageService from '../../services/pageService';
import blockService, { type PageBlockDto } from '../../services/blockService';
import mediaService from '../../services/mediaService';
import type {
  Block,
  BlockType,
  PreviewSize,
  PageDraft,
  TextHeadingLevel,
} from '../../types/pageBuilder';
import { extractYouTubeId } from '../../utils/slugify';

import '../../components/page-builder/styles.css';

const DEFAULT_STORAGE_KEY = 'cmsbuilder-page-draft';
const DEFAULT_TITLE = 'Giới thiệu sản phẩm mới | CMSBuilder';
const DEFAULT_SLUG = 'gioi-thieu-san-pham-moi';
const DEFAULT_DESCRIPTION =
  'Khám phá các tính năng đột phá của nền tảng CMSBuilder thông minh. Tối ưu hóa quy trình quản trị nội dung, nâng cao hiệu suất và trải nghiệm người dùng.';

const makeId = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

function getDraftStorageKey(pageId: string | null, pageSlug: string | null): string {
  if (pageId) return `${DEFAULT_STORAGE_KEY}-id-${pageId}`;
  if (pageSlug) return `${DEFAULT_STORAGE_KEY}-slug-${pageSlug.replace(/^\/+/, '')}`;
  return DEFAULT_STORAGE_KEY;
}

function readDraft(key: string): PageDraft | null {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as PageDraft;
    }
  } catch {
    // Fallback
  }
  return null;
}

const VALID_HEADING_LEVELS: TextHeadingLevel[] = ['h1', 'h2', 'h3', 'p'];

function mapBackendBlockToUi(dto: PageBlockDto): Block {
  const id = `db-${dto.id}`;
  if (dto.type === 'text') {
    let content = dto.content || '';
    let body = '';
    let level: TextHeadingLevel = 'p';

    if (content.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(content) as {
          content?: unknown;
          body?: unknown;
          level?: unknown;
        };
        if (parsed && typeof parsed === 'object') {
          content = typeof parsed.content === 'string' ? parsed.content : '';
          body = typeof parsed.body === 'string' ? parsed.body : '';
          if (
            typeof parsed.level === 'string' &&
            VALID_HEADING_LEVELS.includes(parsed.level as TextHeadingLevel)
          ) {
            level = parsed.level as TextHeadingLevel;
          } else {
            level = 'h2';
          }
        }
      } catch {
        // Plain text fallback
      }
    }

    return {
      id,
      backendId: dto.id,
      type: 'text',
      label: 'Văn bản',
      content,
      body,
      level,
    };
  }

  if (dto.type === 'image') {
    return {
      id,
      backendId: dto.id,
      type: 'image',
      label: 'Hình ảnh',
      src: dto.url || '',
      alt: dto.original_filename || 'Hình ảnh minh họa',
      caption: dto.content || '',
      mediaId: dto.media_id ?? null,
    };
  }

  return {
    id,
    backendId: dto.id,
    type: 'video',
    label: 'Video',
    url: dto.content || dto.url || '',
    title: 'Video',
  };
}

function createPlaceholderPngFile(): File {
  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'image/png' });
  return new File([blob], 'placeholder-image.png', { type: 'image/png' });
}

function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { detail?: unknown } } }).response;
    const detail = resp?.data?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export default function PageBuilderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = searchParams.get('id');
  const pageSlug = searchParams.get('slug');
  const numericQueryId = pageId && /^\d+$/.test(pageId) ? Number(pageId) : null;
  const [currentPageId, setCurrentPageId] = useState<number | null>(numericQueryId);
  const initialBackendBlockIdsRef = useRef<number[]>([]);
  const storageKey = useMemo(() => getDraftStorageKey(pageId, pageSlug), [pageId, pageSlug]);

  const initialDraft = useMemo(() => readDraft(storageKey), [storageKey]);

  // Tải bản nháp từ LocalStorage nếu có
  const [blocks, setBlocks] = useState<Block[]>(() =>
    initialDraft && Array.isArray(initialDraft.blocks) && initialDraft.blocks.length > 0
      ? initialDraft.blocks
      : initialBlocks
  );

  const [selectedId, setSelectedId] = useState<string>(() =>
    initialDraft && Array.isArray(initialDraft.blocks) && initialDraft.blocks.length > 0
      ? initialDraft.blocks[0].id
      : initialBlocks[0]?.id ?? ''
  );

  const [title, setTitle] = useState<string>(() => initialDraft?.title || DEFAULT_TITLE);
  const [slug, setSlug] = useState<string>(() => initialDraft?.slug || pageSlug?.replace(/^\/+/, '') || DEFAULT_SLUG);
  const [description, setDescription] = useState<string>(() => initialDraft?.description || DEFAULT_DESCRIPTION);
  const [lastSaved, setLastSaved] = useState<string | null>(() => initialDraft?.updatedAt || null);
  const [draftStatus, setDraftStatus] = useState<'draft' | 'published'>(() => initialDraft?.status || 'draft');
  const hydratedKeyRef = useRef<string>(storageKey);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [preview, setPreview] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');

  // Khối hiện đang được chọn
  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedId),
    [blocks, selectedId]
  );

  const notify = (message: string): void => {
    setToast(message);
    const win = window as Window & { __cmsToast?: number };
    win.clearTimeout(win.__cmsToast);
    win.__cmsToast = win.setTimeout(() => setToast(''), 2600);
  };

  const updateBlock = (id: string, changes: Partial<Block>): void => {
    setBlocks((old) =>
      old.map((block) =>
        block.id === id ? ({ ...block, ...changes } as Block) : block
      )
    );
  };

  const deleteBlock = (id: string): void => {
    const remainingBlocks = blocks.filter((block) => block.id !== id);
    setBlocks(remainingBlocks);

    if (selectedId === id) {
      setSelectedId(remainingBlocks[0]?.id ?? '');
    }

    notify('Đã xóa khối nội dung');
  };

  const moveBlock = (index: number, direction: number): void => {
    setBlocks((old) => {
      const next = [...old];
      const target = index + direction;

      if (target < 0 || target >= next.length) {
        return old;
      }

      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const duplicateBlock = (block: Block): void => {
    const copy = {
      ...block,
      id: makeId(),
      backendId: undefined,
      label: `${block.label} (bản sao)`,
    } as Block;

    setBlocks((old) => {
      const index = old.findIndex((item) => item.id === block.id);
      const next = [...old];
      next.splice(index + 1, 0, copy);
      return next;
    });

    setSelectedId(copy.id);
    notify('Đã nhân bản khối nội dung');
  };

  const addBlock = (type: BlockType): void => {
    const common = {
      id: makeId(),
      type,
      label:
        type === 'text'
          ? 'Văn bản'
          : type === 'image'
            ? 'Hình ảnh'
            : 'Video',
    };

    let block: Block;

    if (type === 'text') {
      block = {
        ...common,
        type: 'text',
        content: 'Nhập tiêu đề của bạn tại đây',
        body: 'Bắt đầu viết nội dung của bạn...',
        level: 'h2',
      };
    } else if (type === 'image') {
      block = {
        ...common,
        type: 'image',
        src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',
        alt: 'Hình ảnh minh họa',
        caption: 'Thêm chú thích cho hình ảnh',
      };
    } else {
      block = {
        ...common,
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
        title: 'Video mới',
      };
    }

    setBlocks((old) => [...old, block]);
    setSelectedId(block.id);
    notify('Đã thêm khối nội dung mới');
  };

  // Đồng bộ nạp dữ liệu trang khi ?id=... hoặc ?slug=... thay đổi
  useEffect(() => {
    let active = true;
    const saved = readDraft(storageKey);

    if (numericQueryId !== null) {
      setCurrentPageId(numericQueryId);
    }

    if (hydratedKeyRef.current !== storageKey) {
      hydratedKeyRef.current = storageKey;
      if (saved && !numericQueryId && !pageSlug) {
        setBlocks(Array.isArray(saved.blocks) && saved.blocks.length > 0 ? saved.blocks : initialBlocks);
        setSelectedId(saved.blocks?.[0]?.id ?? initialBlocks[0]?.id ?? '');
        setTitle(saved.title || DEFAULT_TITLE);
        setSlug(saved.slug || DEFAULT_SLUG);
        setDescription(saved.description || DEFAULT_DESCRIPTION);
        setLastSaved(saved.updatedAt || null);
        setDraftStatus(saved.status || 'draft');
        return () => {
          active = false;
        };
      }
    }

    async function hydrateFromBackend() {
      if (numericQueryId === null && !pageSlug) return;

      try {
        let targetId = numericQueryId;
        if (targetId === null && pageSlug) {
          const listRes = await pageService.getPages(0, 100);
          if (!active) return;
          const normalizedSlug = pageSlug.replace(/^\/+/, '').toLowerCase();
          const matched = listRes.items.find(
            (p) => (p.slug || '').replace(/^\/+/, '').toLowerCase() === normalizedSlug
          );
          if (matched) {
            targetId = matched.id;
          }
        }

        if (targetId === null) return;

        const detail = await pageService.getPageById(targetId);
        if (!active) return;

        setCurrentPageId(detail.id);
        setTitle(detail.title);
        setSlug((detail.slug || '').replace(/^\/+/, ''));
        setDescription(detail.description || '');
        setDraftStatus(detail.status === 'published' ? 'published' : 'draft');

        const sortedDtos = Array.isArray(detail.blocks)
          ? [...detail.blocks].sort((a, b) => a.order_index - b.order_index || a.id - b.id)
          : [];

        initialBackendBlockIdsRef.current = sortedDtos.map((b) => b.id);

        if (sortedDtos.length > 0) {
          const mappedBlocks = sortedDtos.map(mapBackendBlockToUi);
          setBlocks(mappedBlocks);
          setSelectedId(mappedBlocks[0]?.id ?? '');
        } else if (saved && Array.isArray(saved.blocks) && saved.blocks.length > 0) {
          setBlocks(saved.blocks);
          setSelectedId(saved.blocks[0].id);
        }
      } catch {
        // Fallback to localStorage draft if backend is unreachable
        if (!active || !saved) return;
        setBlocks(Array.isArray(saved.blocks) && saved.blocks.length > 0 ? saved.blocks : initialBlocks);
        setSelectedId(saved.blocks?.[0]?.id ?? initialBlocks[0]?.id ?? '');
        setTitle(saved.title || DEFAULT_TITLE);
        setSlug(saved.slug || pageSlug?.replace(/^\/+/, '') || DEFAULT_SLUG);
        setDescription(saved.description || DEFAULT_DESCRIPTION);
      }
    }

    hydrateFromBackend();

    return () => {
      active = false;
    };
  }, [storageKey, numericQueryId, pageSlug]);

  // Tự động lưu bản nháp (bao gồm thứ tự block) vào localStorage khi có thay đổi
  useEffect(() => {
    try {
      const draftData: PageDraft = {
        blocks,
        title,
        slug,
        description,
        updatedAt: lastSaved || '',
        status: draftStatus,
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
    } catch {
      // Ignore storage quota errors
    }
  }, [blocks, title, slug, description, lastSaved, draftStatus, storageKey]);

  const syncToBackend = useCallback(async (): Promise<{ pageId: number; slug: string }> => {
    const cleanTitle = title.trim() || DEFAULT_TITLE;
    const cleanDescription = description.trim() || null;
    const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '').toLowerCase();

    let targetPageId = currentPageId;
    let savedSlug = cleanSlug;

    if (targetPageId === null) {
      const createdPage = await pageService.createPage({
        title: cleanTitle,
        description: cleanDescription,
        ...(cleanSlug ? { slug: cleanSlug } : {}),
      } as Parameters<typeof pageService.createPage>[0]);

      targetPageId = createdPage.id;
      savedSlug = (createdPage.slug || cleanSlug).replace(/^\/+/, '');
      setCurrentPageId(targetPageId);

      const nextParams: Record<string, string> = { id: String(targetPageId) };
      if (savedSlug) nextParams.slug = savedSlug;
      setSearchParams(nextParams, { replace: true });
    } else {
      const updatedPage = await pageService.updatePage(targetPageId, {
        title: cleanTitle,
        description: cleanDescription,
        ...(cleanSlug ? { slug: cleanSlug } : {}),
      });
      savedSlug = (updatedPage.slug || cleanSlug).replace(/^\/+/, '');
    }

    // Xóa các block đã bị xóa khỏi UI
    const currentBackendIds = new Set(
      blocks
        .map((b) => b.backendId)
        .filter((id): id is number => typeof id === 'number')
    );

    for (const oldId of initialBackendBlockIdsRef.current) {
      if (!currentBackendIds.has(oldId)) {
        await blockService.deleteBlock(targetPageId, oldId);
      }
    }

    // Tạo mới hoặc cập nhật từng block
    const syncedBlocks: Block[] = [];
    const syncedBackendIds: number[] = [];

    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];

      if (block.type === 'text') {
        const serializedContent = JSON.stringify({
          content: block.content,
          body: block.body,
          level: block.level,
        });

        const dto = block.backendId
          ? await blockService.updateBlock(targetPageId, block.backendId, {
              content: serializedContent,
              order_index: i,
            })
          : await blockService.createBlock(targetPageId, {
              type: 'text',
              content: serializedContent,
              order_index: i,
            });

        syncedBackendIds.push(dto.id);
        syncedBlocks.push({ ...block, backendId: dto.id });
      } else if (block.type === 'image') {
        let mediaIdToUse = block.mediaId;
        let nextSrc = block.src;

        if (!mediaIdToUse) {
          const uploaded = await mediaService.uploadImage(createPlaceholderPngFile());
          mediaIdToUse = uploaded.id;
          if (!nextSrc) {
            nextSrc = uploaded.url;
          }
        }

        const imageContent = block.caption || block.alt || null;
        const dto = block.backendId
          ? await blockService.updateBlock(targetPageId, block.backendId, {
              content: imageContent,
              media_id: mediaIdToUse,
              order_index: i,
            })
          : await blockService.createBlock(targetPageId, {
              type: 'image',
              content: imageContent,
              media_id: mediaIdToUse,
              order_index: i,
            });

        syncedBackendIds.push(dto.id);
        syncedBlocks.push({
          ...block,
          backendId: dto.id,
          mediaId: mediaIdToUse,
          src: nextSrc,
        });
      } else {
        const dto = block.backendId
          ? await blockService.updateBlock(targetPageId, block.backendId, {
              content: block.url,
              order_index: i,
            })
          : await blockService.createBlock(targetPageId, {
              type: 'video',
              content: block.url,
              order_index: i,
            });

        syncedBackendIds.push(dto.id);
        syncedBlocks.push({ ...block, backendId: dto.id });
      }
    }

    if (syncedBackendIds.length > 0) {
      await blockService.reorderBlocks(targetPageId, syncedBackendIds);
    }

    initialBackendBlockIdsRef.current = syncedBackendIds;
    setBlocks(syncedBlocks);

    return { pageId: targetPageId, slug: savedSlug };
  }, [blocks, currentPageId, description, setSearchParams, slug, title]);

  const save = useCallback(async (): Promise<void> => {
    const timestamp = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

    try {
      await syncToBackend();
      const draftData: PageDraft = {
        blocks,
        title,
        slug,
        description,
        updatedAt: timestamp,
        status: draftStatus,
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
      setLastSaved(timestamp);
      notify('Đã lưu trang và khối nội dung lên máy chủ');
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, 'Không thể lưu lên máy chủ.');
      notify(`Lỗi khi lưu: ${msg}`);
    }
  }, [blocks, description, draftStatus, slug, storageKey, syncToBackend, title]);

  const publish = async (): Promise<void> => {
    const timestamp = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

    try {
      const synced = await syncToBackend();
      const published = await pageService.publishPage(synced.pageId);
      const publishedSlug = (published.slug || synced.slug || '').replace(/^\/+/, '');

      setDraftStatus('published');
      if (publishedSlug) {
        setSlug(publishedSlug);
        setSearchParams({ id: String(synced.pageId), slug: publishedSlug }, { replace: true });
      }
      setLastSaved(timestamp);

      const draftData: PageDraft = {
        blocks,
        title,
        slug: publishedSlug || slug,
        description,
        updatedAt: timestamp,
        status: 'published',
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));

      notify('Đã xuất bản trang thành công');
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, 'Không thể xuất bản trang lên máy chủ.');
      notify(`Lỗi khi xuất bản: ${msg}`);
    }
  };

  // Đóng modal khi bấm Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (preview) setPreview(false);
        if (settingsOpen) setSettingsOpen(false);
        if (sidebarOpen) setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preview, settingsOpen, sidebarOpen]);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-area">
        <Topbar
          title={title}
          onMenu={() => setSidebarOpen(true)}
          onPreview={() => setPreview(true)}
          onSave={save}
          onPublish={publish}
          onSettings={() => setSettingsOpen((value) => !value)}
        />

        <div className="workspace">
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <span className="toolbar-label">Thêm khối nhanh:</span>
              <span className="toolbar-divider" />

              <button
                type="button"
                className="tool-tab"
                onClick={() => addBlock('text')}
              >
                T · Văn bản
              </button>

              <button
                type="button"
                className="tool-tab"
                onClick={() => addBlock('image')}
              >
                ▧ Tải lên ảnh
              </button>

              <button
                type="button"
                className="tool-tab"
                onClick={() => addBlock('video')}
              >
                ▣ Nội dung Video
              </button>
            </div>

            <div className="toolbar-right">
              {selectedBlock && (
                <span
                  style={{
                    marginRight: '12px',
                    color: '#6259d9',
                    fontWeight: 600,
                  }}
                >
                  Đang chọn: {selectedBlock.label}
                </span>
              )}
              <button
                type="button"
                className="mobile-settings-link"
                onClick={() => setSettingsOpen((value) => !value)}
              >
                Cài đặt
              </button>
              <span>{blocks.length} khối nội dung</span>
            </div>
          </div>

          <div className="editor-layout">
            <BlockEditor
              blocks={blocks}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
              onMove={moveBlock}
              onDuplicate={duplicateBlock}
              onAdd={addBlock}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />

            <SettingsPanel
              title={title}
              setTitle={setTitle}
              slug={slug}
              setSlug={setSlug}
              description={description}
              setDescription={setDescription}
              visible={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              lastSaved={lastSaved}
            />
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}

      {preview && (
        <div
          className="preview-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreview(false);
            }
          }}
        >
          <div className={`preview-modal ${previewSize}`}>
            <div className="preview-modal-header">
              <div>
                <strong>Xem trước trang</strong>
                <span>Kiểm tra giao diện trên các thiết bị trước khi xuất bản</span>
              </div>

              <div className="preview-device-controls">
                <button
                  type="button"
                  className={previewSize === 'desktop' ? 'active' : ''}
                  onClick={() => setPreviewSize('desktop')}
                  title="Xem trên máy tính"
                  aria-label="Xem trên máy tính"
                >
                  <Monitor size={17} />
                </button>

                <button
                  type="button"
                  className={previewSize === 'tablet' ? 'active' : ''}
                  onClick={() => setPreviewSize('tablet')}
                  title="Xem trên máy tính bảng"
                  aria-label="Xem trên máy tính bảng"
                >
                  <Tablet size={17} />
                </button>

                <button
                  type="button"
                  className={previewSize === 'mobile' ? 'active' : ''}
                  onClick={() => setPreviewSize('mobile')}
                  title="Xem trên điện thoại"
                  aria-label="Xem trên điện thoại"
                >
                  <Smartphone size={17} />
                </button>

                <button
                  type="button"
                  className="close-preview"
                  onClick={() => setPreview(false)}
                  title="Đóng xem trước"
                  aria-label="Đóng xem trước"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="preview-viewport">
              <article className="preview-page">
                <div className="preview-site-nav">
                  <b>
                    CMS<span>Builder</span>
                  </b>

                  <span>Trang chủ　 Giới thiệu　 Sản phẩm　 Liên hệ</span>
                </div>

                {blocks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ba1b0' }}>
                    Chưa có khối nội dung nào trong bản xem trước.
                  </div>
                ) : (
                  blocks.map((block) => (
                    <div className="preview-content" key={block.id}>
                      {block.type === 'text' ? (
                        <>
                          {block.level === 'h1' && <h1>{block.content}</h1>}
                          {block.level === 'h2' && <h2>{block.content}</h2>}
                          {block.level === 'h3' && <h3>{block.content}</h3>}
                          {block.level === 'p' && (
                            <p style={{ fontWeight: 600, fontSize: '16px' }}>
                              {block.content}
                            </p>
                          )}
                          <p>{block.body}</p>
                        </>
                      ) : block.type === 'image' ? (
                        <>
                          {block.src && (
                            <img
                              src={block.src}
                              alt={block.alt || 'Hình ảnh'}
                            />
                          )}
                          {block.caption && <small>{block.caption}</small>}
                        </>
                      ) : (
                        <div className="preview-video" style={{ padding: 0 }}>
                          {extractYouTubeId(block.url) ? (
                            <iframe
                              title={block.title || 'YouTube video'}
                              src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(
                                block.url
                              )}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                minHeight: '270px',
                              }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div
                              style={{
                                display: 'grid',
                                placeContent: 'center',
                                justifyItems: 'center',
                                height: '100%',
                                minHeight: '200px',
                              }}
                            >
                              <div className="play-button">▶</div>
                              <p style={{ marginTop: 8 }}>{block.title || 'Video'}</p>
                              {block.url && (
                                <small style={{ color: '#8d94a4' }}>
                                  {block.url}
                                </small>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}

                <footer>© 2026 CMSBuilder. All rights reserved.</footer>
              </article>
            </div>

            <div className="preview-footer">
              <span>
                <ExternalLink size={14} />
                {draftStatus === 'published' ? 'Đã xuất bản' : 'Bản xem trước · Chưa công khai'}
              </span>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {slug && (
                  <a
                    href={`/p/${slug.replace(/^\/+/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-strong, #CBD5E1)',
                      color: 'var(--text-primary, #0F172A)',
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      minHeight: '2.75rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    <ExternalLink size={14} />
                    Mở trang công khai
                  </a>
                )}

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    setPreview(false);
                    publish();
                  }}
                >
                  Xuất bản trang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
