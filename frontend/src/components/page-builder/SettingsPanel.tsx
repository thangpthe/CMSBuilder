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

    

    </aside>
  );
}
