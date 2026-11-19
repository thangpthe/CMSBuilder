import { useRef, useState, type ChangeEvent } from 'react';
import {
  AlignLeft,
  Image as ImageIcon,
  Video,
  Plus,
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Check,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import type {
  Block,
  TextBlock,
  ImageBlock,
  VideoBlock,
  BlockType,
  TextHeadingLevel,
} from '../../types/pageBuilder';
import { isValidVideoUrl, extractYouTubeId } from '../../utils/slugify';
import mediaService from '../../services/mediaService';

// ---------------------- BLOCK TOOLBAR ----------------------
interface BlockToolbarProps {
  block: Block;
  index: number;
  total: number;
  onMove: (index: number, direction: number) => void;
  onDelete: (id: string) => void;
  onDuplicate: (block: Block) => void;
}

function BlockToolbar({
  block,
  index,
  total,
  onMove,
  onDelete,
  onDuplicate,
}: BlockToolbarProps) {
  const Icon =
    block.type === 'text'
      ? AlignLeft
      : block.type === 'image'
        ? ImageIcon
        : Video;

  return (
    <div className="block-toolbar">
      <div className="block-type">
        <GripVertical size={15} />
        <Icon size={15} />
        <span>{block.label}</span>
      </div>

      <div className="block-tools">
        <button
          type="button"
          title="Di chuyển lên"
          disabled={index === 0}
          onClick={(e) => {
            e.stopPropagation();
            onMove(index, -1);
          }}
          aria-label="Di chuyển lên"
        >
          <ChevronUp size={15} />
        </button>

        <button
          type="button"
          title="Di chuyển xuống"
          disabled={index === total - 1}
          onClick={(e) => {
            e.stopPropagation();
            onMove(index, 1);
          }}
          aria-label="Di chuyển xuống"
        >
          <ChevronDown size={15} />
        </button>

        <button
          type="button"
          title="Nhân bản khối này"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(block);
          }}
          aria-label="Nhân bản khối"
        >
          <Copy size={14} />
        </button>

        <button
          type="button"
          title="Xóa khối này"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block.id);
          }}
          aria-label="Xóa khối"
          style={{ color: 'var(--status-danger-text)' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ---------------------- BLOCK CONTENT ----------------------
interface BlockContentProps {
  block: Block;
  onUpdate: (id: string, changes: Partial<Block>) => void;
}

function TextBlockEditor({
  block,
  onUpdate,
}: {
  block: TextBlock;
  onUpdate: (id: string, changes: Partial<TextBlock>) => void;
}) {
  const handleLevelChange = (level: TextHeadingLevel) => {
    onUpdate(block.id, { level });
  };

  return (
    <div className="text-block-content">
      <div className="format-toolbar">
        <button
          type="button"
          onClick={() => handleLevelChange('h1')}
          className={block.level === 'h1' ? 'selected' : ''}
          title="Tiêu đề chính (H1)"
        >
          <Heading1 size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleLevelChange('h2')}
          className={block.level === 'h2' ? 'selected' : ''}
          title="Tiêu đề phụ (H2)"
        >
          <Heading2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleLevelChange('h3')}
          className={block.level === 'h3' ? 'selected' : ''}
          title="Tiêu đề nhỏ (H3)"
        >
          <Heading3 size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleLevelChange('p')}
          className={block.level === 'p' ? 'selected' : ''}
          title="Đoạn văn (P)"
        >
          <Pilcrow size={14} />
        </button>
        <span className="format-divider" />
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', alignSelf: 'center' }}>
          Định dạng: {block.level.toUpperCase()}
        </span>
      </div>

      <textarea
        className={
          block.level === 'h1'
            ? 'heading-input'
            : block.level === 'h2'
              ? 'subheading-input'
              : 'paragraph-input'
        }
        rows={2}
        placeholder={
          block.level === 'p'
            ? 'Nhập nội dung đoạn văn...'
            : 'Nhập tiêu đề tại đây...'
        }
        value={block.content}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onUpdate(block.id, { content: e.target.value })
        }
      />

      <label className="field-label" style={{ marginTop: 8 }}>
        Nội dung chi tiết (Mô tả mở rộng)
      </label>
      <textarea
        className="body-input"
        rows={3}
        placeholder="Bắt đầu viết mô tả hoặc nội dung chi tiết của bạn..."
        value={block.body}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onUpdate(block.id, { body: e.target.value })
        }
      />
    </div>
  );
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function ImageBlockEditor({
  block,
  onUpdate,
}: {
  block: ImageBlock;
  onUpdate: (id: string, changes: Partial<ImageBlock>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidType =
      ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) ||
      ALLOWED_IMAGE_EXTENSIONS.test(file.name);
    if (!isValidType) {
      setUploadStatus({
        type: 'error',
        message: 'Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WebP hoặc GIF.',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setUploadStatus({
        type: 'error',
        message: 'Dung lượng ảnh vượt quá giới hạn 5MB. Vui lòng chọn ảnh nhỏ hơn.',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const res = await mediaService.uploadImage(file);
      onUpdate(block.id, {
        src: res.url,
        mediaId: res.id,
        alt: block.alt || res.original_filename,
      });
      setUploadStatus({
        type: 'success',
        message: `Đã tải lên: ${res.original_filename}`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Tải ảnh lên thất bại. Vui lòng thử lại.';
      setUploadStatus({
        type: 'error',
        message: msg,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="media-block-content">
      <div className="media-preview">
        {block.src ? (
          <img
            src={block.src}
            alt={block.alt || 'Ảnh xem trước'}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            Chưa có hình ảnh. Vui lòng tải ảnh lên hoặc nhập URL bên dưới.
          </div>
        )}
        <div className="media-overlay">Ảnh xem trước</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
          aria-label="Tải ảnh lên từ máy tính"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="tool-tab"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          <Upload size={14} />
          {uploading ? 'Đang tải ảnh lên...' : 'Tải ảnh lên (PNG/JPG/WebP/GIF)'}
        </button>

        {block.mediaId ? (
          <span
            className="valid-tag"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Check size={12} />
            Media ID #{block.mediaId}
          </span>
        ) : null}
      </div>

      {uploadStatus && (
        <div
          role={uploadStatus.type === 'error' ? 'alert' : 'status'}
          data-testid={uploadStatus.type === 'error' ? 'image-upload-error' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '12px',
            marginBottom: 10,
            padding: '8px 10px',
            borderRadius: 6,
            background: uploadStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: uploadStatus.type === 'success' ? '#047857' : '#b91c1c',
            border: uploadStatus.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
          }}
        >
          {uploadStatus.type === 'error' && (
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      <label className="field-label">Đường dẫn hình ảnh (Image URL) <b>*</b></label>
      <input
        className="field-input"
        placeholder="https://example.com/image.jpg"
        value={block.src}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onUpdate(block.id, { src: e.target.value, mediaId: null })
        }
      />

      <label className="field-label">Văn bản thay thế (Alt text)</label>
      <input
        className="field-input"
        placeholder="Mô tả hình ảnh cho công cụ tìm kiếm và hỗ trợ tiếp cận..."
        value={block.alt}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onUpdate(block.id, { alt: e.target.value })
        }
      />

      <label className="field-label">Chú thích ảnh</label>
      <input
        className="field-input"
        placeholder="Chú thích hiển thị dưới hình ảnh..."
        value={block.caption}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onUpdate(block.id, { caption: e.target.value })
        }
      />
    </div>
  );
}

function VideoBlockEditor({
  block,
  onUpdate,
}: {
  block: VideoBlock;
  onUpdate: (id: string, changes: Partial<VideoBlock>) => void;
}) {
  const isUrlValid = isValidVideoUrl(block.url);
  const ytId = extractYouTubeId(block.url);

  return (
    <div className="media-block-content">
      <label className="field-label">Tiêu đề video</label>
      <input
        className="field-input"
        placeholder="Nhập tiêu đề hoặc chủ đề video..."
        value={block.title}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onUpdate(block.id, { title: e.target.value })
        }
      />

      <label className="field-label">Đường dẫn video (YouTube / Vimeo / MP4)</label>
      <div className="url-input">
        <Link2 size={15} />
        <input
          placeholder="https://www.youtube.com/watch?v=..."
          value={block.url}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUpdate(block.id, { url: e.target.value })
          }
        />
        {isUrlValid ? (
          <span className="valid-tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={12} />
            {ytId ? 'YouTube' : 'URL hợp lệ'}
          </span>
        ) : block.url ? (
          <span
            className="valid-tag"
            style={{
              background: 'var(--status-danger-bg)',
              color: 'var(--status-danger-text)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <AlertTriangle size={12} />
            URL không hợp lệ
          </span>
        ) : (
          <span
            className="valid-tag"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
          >
            Chưa có URL
          </span>
        )}
      </div>

      {(!block.url.trim() || !isUrlValid) && (
        <div
          role="alert"
          data-testid="video-url-error"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '12px',
            marginTop: 6,
            marginBottom: 10,
            padding: '8px 10px',
            borderRadius: 6,
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
          }}
        >
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>Vui lòng nhập URL video hợp lệ (YouTube, Vimeo hoặc .mp4/.webm/.ogg).</span>
        </div>
      )}

      <div className="video-preview">
        {ytId ? (
          <iframe
            title={block.title || 'YouTube video'}
            src={`https://www.youtube-nocookie.com/embed/${ytId}`}
            style={{
              width: '100%',
              height: '100%',
              border: 0,
              aspectRatio: '16/9',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <div className="video-screen">
              <div className="video-brand">
                CMS<span>BUILDER</span>
              </div>
              <div className="play-button">▶</div>
              <p>{block.title || 'Video'}</p>
            </div>
            <div className="video-controls">
              <span>▶</span>
              <div className="video-progress">
                <i />
              </div>
              <span>0:00 / 0:00</span>
              <span>⛶</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BlockContent({ block, onUpdate }: BlockContentProps) {
  if (block.type === 'text') {
    return (
      <TextBlockEditor
        block={block}
        onUpdate={onUpdate as (id: string, changes: Partial<TextBlock>) => void}
      />
    );
  }

  if (block.type === 'image') {
    return (
      <ImageBlockEditor
        block={block}
        onUpdate={onUpdate as (id: string, changes: Partial<ImageBlock>) => void}
      />
    );
  }

  return (
    <VideoBlockEditor
      block={block}
      onUpdate={onUpdate as (id: string, changes: Partial<VideoBlock>) => void}
    />
  );
}

// ---------------------- MAIN BLOCK EDITOR ----------------------
export interface BlockEditorProps {
  blocks: Block[];
  onUpdate: (id: string, changes: Partial<Block>) => void;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: number) => void;
  onDuplicate: (block: Block) => void;
  onAdd: (type: BlockType) => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
}

export default function BlockEditor({
  blocks,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  onAdd,
  selectedId,
  setSelectedId,
}: BlockEditorProps) {
  return (
    <main className="canvas-column">
      <div className="canvas-topline">
        <div>
          <span className="eyebrow">ELEMENT PIPELINE</span>
          <span className="pipeline-separator">·</span>
          <span className="eyebrow">{blocks.length} KHỐI NỘI DUNG</span>
        </div>
        <span className="autosave">
          <i /> Tự động đồng bộ
        </span>
      </div>

      <div className="page-canvas">
        {blocks.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>
              Trang hiện chưa có khối nội dung nào.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '11px' }}>
              Nhấn vào các nút bên dưới để bắt đầu tạo nội dung.
            </p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <section
              key={block.id}
              data-block-id={block.id}
              className={`content-block ${
                selectedId === block.id ? 'is-selected' : ''
              }`}
              onClick={() => setSelectedId(block.id)}
              style={{
                outline:
                  selectedId === block.id
                    ? '2px solid #5548e9'
                    : '1px solid #ebebf5',
                borderRadius: '8px',
                transition: 'outline 0.15s ease',
              }}
            >
              <BlockToolbar
                block={block}
                index={index}
                total={blocks.length}
                onMove={onMove}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
              <BlockContent block={block} onUpdate={onUpdate} />
            </section>
          ))
        )}

        <div className="add-block-area">
          <div className="add-block-plus">
            <Plus size={19} />
          </div>
          <strong>+ Nhấn để chèn thêm khối nội dung mới</strong>
          <span>Hãy tạo văn bản, hình ảnh, video hoặc các thành phần tương tác khác</span>
          <div className="add-block-buttons">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd('text');
              }}
            >
              <AlignLeft size={15} /> Văn bản
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd('image');
              }}
            >
              <ImageIcon size={15} /> Hình ảnh
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd('video');
              }}
            >
              <Video size={15} /> Video
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
