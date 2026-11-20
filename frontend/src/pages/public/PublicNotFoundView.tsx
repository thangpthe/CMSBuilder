import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  FileQuestion,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../../components/page-builder/styles.css';

export interface PublicNotFoundViewProps {
  reason?: 'draft' | 'not_found';
  slug?: string;
  onGoAdmin?: () => void;
  onGoHome?: () => void;
}

/**
 * 404 & Draft View synchronized with CMSBuilder UI & design system
 * Uses lucide-react icons, global-header layout, and preserves user session.
 */
export default function PublicNotFoundView({
  reason = 'draft',
  slug = '',
  onGoAdmin,
  onGoHome,
}: PublicNotFoundViewProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isSystemAdmin, logoutUser } = useAuth();
  const isDraft = reason === 'draft';

  const username = user?.username || user?.name || 'User';
  const avatarInitials = username.slice(0, 2).toUpperCase();

  const handleBack = () => {
    // Client-side router navigation preserving 100% login session & React state
    if (window.history.length > 1) {
      navigate(-1);
    } else if (isAuthenticated) {
      navigate(isSystemAdmin ? '/dashboard' : '/pages');
    } else if (onGoHome) {
      onGoHome();
    } else {
      navigate('/p');
    }
  };

  const handleHome = () => {
    if (isAuthenticated) {
      if (onGoAdmin) {
        onGoAdmin();
      } else {
        navigate(isSystemAdmin ? '/dashboard' : '/pages');
      }
    } else if (onGoHome) {
      onGoHome();
    } else {
      navigate('/p');
    }
  };

  const handleGoAdmin = () => {
    if (onGoAdmin) {
      onGoAdmin();
    } else {
      navigate(isSystemAdmin ? '/dashboard' : '/pages');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-page, #f8fafc)',
        color: 'var(--text-primary, #0f172a)',
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Global Synchronized Header */}
      <header
        className="global-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '65px',
          padding: '8px 24px',
          background: 'var(--bg-surface, #ffffff)',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
        }}
      >
        <div
          className="brand"
          onClick={handleHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleHome();
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <img src="/logo.svg" alt="CMS Builder" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            CMS Builder
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="outline-btn"
                onClick={handleGoAdmin}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '13px',
                }}
              >
                <LayoutGrid size={15} />
                <span>Trang quản trị</span>
              </button>

              <div className="profile" title={`Đang đăng nhập: ${username}`}>
                <div className="avatar">{avatarInitials}</div>
                <div>
                  <strong>{username}</strong>
                </div>
              </div>

              <button
                type="button"
                className="icon-btn logout-btn"
                onClick={handleLogout}
                title="Đăng xuất"
                aria-label="Đăng xuất"
                style={{
                  color: 'var(--status-danger-text, #e11d48)',
                  minWidth: '36px',
                  minHeight: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="primary-btn"
              onClick={handleLogin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 16px',
                fontSize: '13px',
              }}
            >
              <LogIn size={15} />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </header>

      {/* Main 404 Center Card */}
      <main
        style={{
          flex: '1 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            borderRadius: '12px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: isDraft ? 'var(--status-draft-bg, #fef3c7)' : 'var(--brand-primary-subtle, #eef2ff)',
              color: isDraft ? 'var(--status-draft-text, #92400e)' : 'var(--brand-primary, #4f46e5)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            {isDraft ? <Compass size={30} /> : <FileQuestion size={30} />}
          </div>

          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              background: isDraft ? 'var(--status-draft-bg, #fef3c7)' : 'var(--brand-primary-subtle, #eef2ff)',
              color: isDraft ? 'var(--status-draft-text, #92400e)' : 'var(--brand-primary, #4f46e5)',
              marginBottom: '12px',
            }}
          >
            {isDraft ? 'Bản nháp chưa xuất bản' : '404 · Không tìm thấy trang'}
          </span>

          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary, #0f172a)',
              margin: '0 0 8px 0',
              lineHeight: 1.3,
            }}
          >
            {isDraft ? 'Nội dung này hiện chưa được xuất bản' : 'Trang bạn tìm kiếm không tồn tại'}
          </h1>

          <p
            style={{
              fontSize: '13.5px',
              color: 'var(--text-muted, #64748b)',
              lineHeight: 1.6,
              margin: '0 auto 18px',
              maxWidth: '380px',
            }}
          >
            {isDraft
              ? 'Bài viết đang ở chế độ bản nháp riêng tư của tác giả và chưa phát hành ra cộng đồng.'
              : 'Đường dẫn có thể đã bị thay đổi, gỡ bỏ hoặc bạn đã nhập sai địa chỉ trang web.'}
          </p>

          {slug && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-subtle, #f1f5f9)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                color: 'var(--text-muted, #64748b)',
                marginBottom: '24px',
              }}
            >
              <span>Đường dẫn:</span>
              <code
                style={{
                  color: 'var(--brand-primary, #4f46e5)',
                  fontWeight: 600,
                  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
                }}
              >
                /p/{slug}
              </code>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="primary-btn"
              onClick={handleBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 18px',
                height: '40px',
                fontSize: '13px',
              }}
            >
              <ArrowLeft size={16} />
              <span>Quay lại trang trước</span>
            </button>

            <button
              type="button"
              className="outline-btn"
              onClick={handleHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 18px',
                height: '40px',
                fontSize: '13px',
              }}
            >
              <Home size={16} />
              <span>{isAuthenticated ? 'Về trang quản trị' : 'Về trang chủ'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Global Synchronized Footer */}
      <footer
        style={{
          padding: '16px 24px',
          background: 'var(--bg-surface, #ffffff)',
          borderTop: '1px solid var(--border-subtle, #e2e8f0)',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-muted, #64748b)',
        }}
      >
        <span>© 2026 CMS Builder. Bản quyền thuộc về tác giả bài viết.</span>
      </footer>
    </div>
  );
}
