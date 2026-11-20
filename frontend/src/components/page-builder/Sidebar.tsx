import type { LucideIcon } from 'lucide-react';
import {
  Blocks,
  FileText,
  PanelsTopLeft,
  PanelLeftClose,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  matchPaths?: string[];
  systemAdminOnly?: boolean;
}

const baseNavItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Bảng điều khiển',
    path: '/dashboard',
    systemAdminOnly: true,
  },
  { icon: Blocks, label: 'Trình soạn thảo', path: '/page-builder' },
  {
    icon: FileText,
    label: 'Quản lý trang',
    path: '/pages',
    matchPaths: ['/pages', '/admin/pages'],
  },
  {
    icon: PanelsTopLeft,
    label: 'Trang công khai',
    path: '/p',
    matchPaths: ['/p', '/public'],
  },
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
  const { user, isSystemAdmin, logoutUser } = useAuth();

  const username = user?.username || user?.name || 'User';
  const avatarInitials = username.slice(0, 2).toUpperCase();

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
    onClose();
  };

  const visibleNavItems = baseNavItems.filter((item) => {
    if (item.systemAdminOnly && !isSystemAdmin) {
      return false;
    }
    return true;
  });

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

        <nav>
          {visibleNavItems.map((item) => {
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

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '16px',
            paddingBottom: '16px',
            borderTop: '1px solid var(--border-subtle, #E2E8F0)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 4px',
            }}
          >
            <div
              className="avatar"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--brand-primary-subtle, #EEF2FF)',
                color: 'var(--brand-primary, #4F46E5)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: '12px',
                flexShrink: 0,
              }}
            >
              {avatarInitials}
            </div>
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #0F172A)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {username}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="nav-item"
            onClick={handleLogout}
            style={{
              color: 'var(--status-danger-text, #E11D48)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
