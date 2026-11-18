import {
  Search,
  Bell,
  BookOpen,
  Menu,
  ChevronRight,
  Save,
  Eye,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface TopbarProps {
  title: string;
  onMenu: () => void;
  onPreview: () => void;
  onSave: () => void;
  onPublish: () => void;
  onSettings: () => void;
}

export default function Topbar({
  title,
  onMenu,
  onPreview,
  onSave,
  onPublish,
  onSettings,
}: TopbarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/pages');
  };

  return (
    <>
      <header className="global-header">
        <button
          type="button"
          className="icon-btn mobile-menu"
          onClick={onMenu}
          aria-label="Mở thanh điều hướng"
        >
          <Menu size={20} />
        </button>

        <div className="breadcrumb">
          <span>CMS Workspace</span>
          <ChevronRight size={14} />
          <button
            type="button"
            onClick={handleBack}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              font: 'inherit',
              fontWeight: 600,
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            Quản lý trang
          </button>
        </div>

        <div className="global-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm trang, nội dung..."
            aria-label="Tìm kiếm trang, nội dung"
          />
        </div>

        <button type="button" className="help-link">
          <BookOpen size={16} />
          <span>Trung tâm trợ giúp</span>
        </button>

        <button
          type="button"
          className="icon-btn notification"
          aria-label="Thông báo"
        >
          <Bell size={18} />
          <i />
        </button>

        <div className="profile">
          <div className="avatar">AD</div>
          <div>
            <strong>Quản trị viên</strong>
            <span>Admin · Hoạt động</span>
          </div>
        </div>
      </header>

      <header className="editor-header">
        <div className="page-heading">
          <div className="page-heading-title">
            <button
              type="button"
              className="back-arrow"
              onClick={handleBack}
              title="Quay lại danh sách trang"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ‹
            </button>
            <div>
              <h1>{title || 'Chưa đặt tiêu đề'}</h1>
              <p>
                Trang / {title || 'Bản nháp mới'} · <span className="status-dot" /> Bản nháp
              </p>
            </div>
          </div>
        </div>

        <div className="editor-actions">
          <button
            type="button"
            className="icon-btn settings-mobile"
            onClick={onSettings}
            title="Cài đặt trang"
            aria-label="Cài đặt trang"
          >
            <SlidersHorizontal size={17} />
          </button>

          <button
            type="button"
            className="outline-btn preview-btn"
            onClick={onPreview}
          >
            <Eye size={16} />
            <span>Xem trước</span>
          </button>

          <button
            type="button"
            className="outline-btn save-btn"
            onClick={onSave}
          >
            <Save size={16} />
            <span>Lưu bản nháp</span>
          </button>

          <button
            type="button"
            className="primary-btn publish-btn"
            onClick={onPublish}
          >
            <Send size={15} />
            <span>Xuất bản ngay</span>
          </button>
        </div>
      </header>
    </>
  );
}
