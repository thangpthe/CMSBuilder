import { useEffect, useState, type ReactNode } from 'react';
import { Bell, BookOpen, ChevronRight, Menu, Search } from 'lucide-react';
import Sidebar from '../page-builder/Sidebar';
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

        {children}
      </div>
    </div>
  );
}
