import {
  Search,
  Bell,
  Menu,
  Save,
  Eye,
  Send,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export interface TopbarProps {
  title: string;
  status?: 'draft' | 'published';
  onMenu: () => void;
  onPreview: () => void;
  onSave: () => void;
  onPublish: () => void;
  onSettings: () => void;
}

export default function Topbar({
  title,
  status = 'draft',
  onMenu,
  onPreview,
  onSave,
  onPublish,
  onSettings,
}: TopbarProps) {
  const isPublished = status === 'published';
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const username = user?.username || user?.name || 'User';
  const avatarInitials = username.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

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

        <div className="global-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm trang, nội dung..."
            aria-label="Tìm kiếm trang, nội dung"
          />
        </div>

        

        <button
          type="button"
          className="icon-btn notification"
          aria-label="Thông báo"
        >
          <Bell size={18} />
          <i />
        </button>

        <div
          className="profile"
          title={`Đang đăng nhập: ${username}`}
        >
          <div className="avatar">{avatarInitials}</div>
          <div>
            <strong>{username}</strong>
          </div>
        </div>

        <button
          type="button"
          className="icon-btn logout-btn"
          onClick={handleLogout}
          title="Đăng xuất khỏi hệ thống"
          aria-label="Đăng xuất"
          style={{
            color: 'var(--status-danger-text, #e11d48)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            marginLeft: 4,
          }}
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
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
                minHeight: '2.75rem',
                minWidth: '2.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ‹
            </button>
            <div>
              <h1>{title || 'Chưa đặt tiêu đề'}</h1>
              <p>
                Trang / {title || 'Bản nháp mới'} ·{' '}
                <span
                  className={`status-dot ${isPublished ? 'is-published' : 'is-draft'}`}
                />{' '}
                {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
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
