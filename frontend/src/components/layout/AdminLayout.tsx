import { useEffect, useState, type ReactNode } from 'react';
import { Bell, ChevronRight, Menu, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../page-builder/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import '../page-builder/styles.css';

export interface AdminLayoutProps {
  breadcrumbLabel?: string;
  children: ReactNode;
}

export default function AdminLayout({
  breadcrumbLabel = 'Quản lý trang',
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const username = user?.username || user?.name || 'User';
  const avatarInitials = username.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-area">
        <header className="global-header">
          <button
            type="button"
            className="icon-btn mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở thanh điều hướng"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            <span>CMS Workspace</span>
            <ChevronRight size={14} />
            <strong>{breadcrumbLabel}</strong>
          </div>

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

        {children}
      </div>
    </div>
  );
}
