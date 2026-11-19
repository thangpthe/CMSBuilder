import type { ChangeEvent } from 'react';
import { Settings, CheckCircle2, CalendarClock, Globe, Search } from 'lucide-react';
import { generateSlug } from '../../utils/slugify';

export interface SettingsPanelProps {
  title: string;
  setTitle: (title: string) => void;
  slug: string;
  setSlug: (slug: string) => void;
  description: string;
  setDescription: (description: string) => void;
  visible: boolean;
  onClose: () => void;
  lastSaved?: string | null;
  status?: 'draft' | 'published';
}

export default function SettingsPanel({
  title,
  setTitle,
  slug,
  setSlug,
  description,
  setDescription,
  visible,
  onClose,
  lastSaved,
  status = 'draft',
}: SettingsPanelProps) {
  const isPublished = status === 'published';
  const handleAutoSlug = () => {
    const generated = generateSlug(title);
    setSlug(generated || 'trang-moi');
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép chữ thường, số, và dấu gạch ngang
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(cleaned);
  };

  return (
    <aside className={`settings-panel ${visible ? 'panel-visible' : ''}`}>
      <div className="settings-heading">
        <div>
          <Settings size={18} />
          <h2>Cài đặt trang</h2>
        </div>
        <button
          type="button"
          className="panel-close"
          onClick={onClose}
          aria-label="Đóng bảng cài đặt"
        >
          ×
        </button>
      </div>

      <div className="settings-section">
        <label className="field-label" htmlFor="page-title-input">
          Tiêu đề trang <b>*</b>
        </label>
        <input
          id="page-title-input"
          className="field-input"
          value={title}
          placeholder="Nhập tiêu đề trang..."
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="helper-text">
          Tên trang sẽ hiển thị trên thanh tiêu đề trình duyệt và kết quả tìm kiếm.
        </div>
      </div>

      <div className="settings-section">
        <div className="label-with-action">
          <label className="field-label" htmlFor="page-slug-input">
            Đường dẫn (Slug)
          </label>
          <button
            type="button"
            className="text-action"
            onClick={handleAutoSlug}
            title="Tự động tạo đường dẫn từ tiêu đề"
          >
            Tự tạo
          </button>
        </div>
        <div className="slug-input">
          <span>cmsbuilder.vn/</span>
          <input
            id="page-slug-input"
            value={slug}
            placeholder="duong-dan-trang"
            onChange={handleSlugChange}
          />
        </div>
        <div className="helper-text">Đường dẫn thân thiện với công cụ tìm kiếm (SEO).</div>
      </div>

      <div className="settings-section">
        <label className="field-label" htmlFor="page-desc-input">
          Mô tả SEO (Meta Description)
        </label>
        <textarea
          id="page-desc-input"
          className="description-input"
          rows={4}
          value={description}
          placeholder="Tóm tắt nội dung chính của trang để hiển thị trên kết quả tìm kiếm..."
          onChange={(e) => setDescription(e.target.value)}
        />
        <div
          className="char-count"
          style={{
            color: description.length > 160 ? 'var(--status-danger-text)' : undefined,
            fontWeight: description.length > 160 ? 600 : 400,
          }}
        >
          {description.length}/160 ký tự
          {description.length > 160 ? ' (Khuyến nghị ≤ 160 ký tự)' : ''}
        </div>
      </div>

      <div className="seo-preview">
        <div className="seo-label">
          <Search size={14} /> XEM TRƯỚC KẾT QUẢ TÌM KIẾM
        </div>
        <strong>{title || 'Tiêu đề trang hiển thị ở đây'}</strong>
        <span>https://cmsbuilder.vn/{slug || 'duong-dan-trang'}</span>
        <p>{description || 'Mô tả trang sẽ hiển thị tại đây khi tìm kiếm trên Google...'}</p>
      </div>

      <div className="settings-section publish-info">
        <div className="section-title">
          <CalendarClock size={16} /> Lịch sử bài viết <i />
        </div>
        <div className="history-card">
          <CheckCircle2
            size={17}
            style={{
              color: isPublished
                ? 'var(--status-published-text)'
                : 'var(--status-draft-text)',
            }}
          />
          <div>
            <strong
              style={{
                color: isPublished
                  ? 'var(--status-published-text)'
                  : 'var(--status-draft-text)',
              }}
            >
              {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
            </strong>
            <span>
              {lastSaved
                ? `Cập nhật gần nhất: ${lastSaved}`
                : isPublished
                  ? 'Đã xuất bản lên hệ thống'
                  : 'Đã lưu trên thiết bị này'}
            </span>
          </div>
        </div>
      </div>

      <div className="visibility-row">
        <Globe size={16} />
        <span>Trạng thái hiển thị</span>
        <strong
          style={{
            color: isPublished
              ? 'var(--status-published-text)'
              : 'var(--status-draft-text)',
          }}
        >
          <i
            style={{
              background: isPublished
                ? 'var(--status-published-text)'
                : 'var(--status-draft-text)',
            }}
          />{' '}
          {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
        </strong>
      </div>
    </aside>
  );
}
