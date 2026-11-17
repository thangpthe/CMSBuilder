import { useMemo, useState, useEffect, useCallback } from 'react';
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
import type {
  Block,
  BlockType,
  PreviewSize,
  PageDraft,
} from '../../types/pageBuilder';
import { extractYouTubeId } from '../../utils/slugify';

import '../../components/page-builder/styles.css';

const STORAGE_KEY = 'cmsbuilder-page-draft';

const makeId = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

export default function PageBuilderPage() {
  // Tải bản nháp từ LocalStorage nếu có
  const [blocks, setBlocks] = useState<Block[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PageDraft = JSON.parse(saved);
        if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
          return parsed.blocks;
        }
      }
    } catch {
      // Fallback
    }
    return initialBlocks;
  });

  const [selectedId, setSelectedId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PageDraft = JSON.parse(saved);
        if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
          return parsed.blocks[0].id;
        }
      }
    } catch {
      // Fallback
    }
    return initialBlocks[0]?.id ?? '';
  });

  const [title, setTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PageDraft = JSON.parse(saved);
        if (parsed.title) return parsed.title;
      }
    } catch {
      // Fallback
    }
    return 'Giới thiệu sản phẩm mới | CMSBuilder';
  });

  const [slug, setSlug] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PageDraft = JSON.parse(saved);
        if (parsed.slug) return parsed.slug;
      }
    } catch {
      // Fallback
    }
    return 'gioi-thieu-san-pham-moi';
  });

  const [description, setDescription] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PageDraft = JSON.parse(saved);
        if (parsed.description) return parsed.description;
      }
    } catch {
      // Fallback
    }
    return 'Khám phá các tính năng đột phá của nền tảng CMSBuilder thông minh. Tối ưu hóa quy trình quản trị nội dung, nâng cao hiệu suất và trải nghiệm người dùng.';
  });

  const [lastSaved, setLastSaved] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PageDraft = JSON.parse(saved);
        if (parsed.updatedAt) return parsed.updatedAt;
      }
    } catch {
      // Fallback
    }
    return null;
  });

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

  const save = useCallback((): void => {
    const timestamp = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

    const draftData: PageDraft = {
      blocks,
      title,
      slug,
      description,
      updatedAt: timestamp,
      status: 'draft',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    setLastSaved(timestamp);
    notify('Đã lưu bản nháp trên thiết bị này');
  }, [blocks, title, slug, description]);

  const publish = (): void => {
    save();
    notify('Bản nháp đã sẵn sàng — cần kết nối API để xuất bản');
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
                Bản xem trước · Chưa công khai
              </span>

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
      )}
    </div>
  );
}
