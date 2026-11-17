import type { ChangeEvent } from 'react';
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
          style={{ color: '#e26c79' }}
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
        <span style={{ fontSize: '10px', color: '#8d94a4', alignSelf: 'center' }}>
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

function ImageBlockEditor({
  block,
  onUpdate,
}: {
  block: ImageBlock;
  onUpdate: (id: string, changes: Partial<ImageBlock>) => void;
}) {
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
              color: '#9ba1b0',
              fontSize: '12px',
            }}
          >
            Chưa có hình ảnh. Vui lòng nhập URL bên dưới.
          </div>
        )}
        <div className="media-overlay">Ảnh xem trước</div>
      </div>

      <label className="field-label">Đường dẫn hình ảnh (Image URL) <b>*</b></label>
      <input
        className="field-input"
        placeholder="https://example.com/image.jpg"
        value={block.src}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onUpdate(block.id, { src: e.target.value })
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
              background: '#fee8e8',
              color: '#d94343',
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
            style={{ background: '#f0f1f5', color: '#8d94a4' }}
          >
            Chưa có URL
          </span>
        )}
      </div>

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
              color: '#8b91a1',
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
