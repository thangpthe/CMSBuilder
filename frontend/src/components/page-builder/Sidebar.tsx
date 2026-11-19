import type { LucideIcon } from 'lucide-react';
import {
  Blocks,
  FileText,
  FolderOpen,
  PanelsTopLeft,
  Settings,
  ChevronDown,
  PanelLeftClose,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  { icon: Blocks, label: 'Trình soạn thảo', path: '/page-builder' },
  {
    icon: FileText,
    label: 'Quản lý trang',
    path: '/pages',
    matchPaths: ['/pages', '/admin/pages'],
  },
  { icon: FolderOpen, label: 'Thư viện Media', path: '/media' },
  {
    icon: PanelsTopLeft,
    label: 'Trang công khai',
    path: '/p',
    matchPaths: ['/p', '/public'],
  },
  { icon: Settings, label: 'Cài đặt hệ thống', path: '/settings' },
];

function isNavItemActive(pathname: string, item: NavItem): boolean {
  const prefixes = item.matchPaths ?? [item.path];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? 'mobile-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark">C</div>
          <span>CMSBuilder</span>
          <button
            type="button"
            className="icon-btn sidebar-close"
            onClick={onClose}
            aria-label="Đóng thanh điều hướng"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="nav-caption">QUẢN TRỊ HỆ THỐNG</div>
        <nav>
          {navItems.map((item) => {
            const { icon: Icon, label, path } = item;
            const isActive = isNavItemActive(location.pathname, item);
            return (
              <button
                key={label}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(path)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="workspace-card">
          <div className="workspace-icon">
            <Blocks size={17} />
          </div>
          <div>
            <strong>CMS Workspace</strong>
            <span>Gói miễn phí · Đã sử dụng</span>
            <div className="usage">
              <i />
            </div>
            <small>85 / 100 lượt sử dụng</small>
          </div>
          <ChevronDown size={15} />
        </div>
      </aside>
    </>
  );
}
