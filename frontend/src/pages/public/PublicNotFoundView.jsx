/* eslint-disable react/prop-types */
import {
  FiArrowLeft,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiLock,
  FiLogIn,
  FiAlertTriangle,
  FiShield,
  FiUser,
} from 'react-icons/fi';

/**
 * 404 / Draft / Unpublished screen (Step 2).
 * Matches `Trang 404 - Chưa Xuất Bản.png` & `Trang 404 - Mobile.png`.
 */
export default function PublicNotFoundView({ reason = 'draft', slug = '', onGoAdmin, onGoHome }) {
  const isDraft = reason === 'draft';

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleAdmin = () => {
    if (onGoAdmin) {
      onGoAdmin();
    } else {
      window.location.href = '/';
    }
  };

  const handleHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/p';
    }
  };

  return (
    <div className="pub-root">
      {/* Header matching 404 mockup */}
      <header className="pub-header">
        <div className="pub-container pub-header__inner">
          <a href="/p" className="pub-brand" onClick={(e) => { e.preventDefault(); handleHome(); }}>
            <span className="pub-brand__logo" aria-hidden="true">
              <FiFileText size={20} />
            </span>
            <span className="pub-brand__text">
              <span className="pub-brand__title">CMSBuilder</span>
            </span>
          </a>

          <nav className="pub-nav" aria-label="Điều hướng 404">
            <div className="pub-nav__links-desktop">
              <a href="/p" className="pub-nav__link" onClick={(e) => { e.preventDefault(); handleHome(); }}>
                Trang chủ
              </a>
              <a href="#help" className="pub-nav__link" onClick={(e) => e.preventDefault()}>
                Trợ giúp
              </a>
              <a href="#status" className="pub-nav__link" onClick={(e) => e.preventDefault()}>
                Trạng thái
              </a>
            </div>
            <button
              type="button"
              className="pub-btn-primary"
              style={{ borderRadius: '9999px', padding: '0 0.75rem', minWidth: '2.75rem' }}
              onClick={handleAdmin}
              aria-label="Quản trị viên"
              title="Đi tới trang quản trị"
            >
              <FiUser size={18} />
            </button>
          </nav>
        </div>
      </header>

      {/* Main 404 / Draft Center Content */}
      <main className="pub-404-wrap">
        <div className="pub-404-card">
          <div className="pub-404-icon-box" aria-hidden="true">
            <FiLock size={34} />
            <span className="pub-404-draft-badge">
              <span>●</span>
              <span>{isDraft ? 'Bản nháp' : 'Không tìm thấy'}</span>
            </span>
          </div>

          <div className="pub-404-pill">
            <span>● 404 • Chưa xuất bản hoặc không tồn tại</span>
          </div>

          <h1 className="pub-404-title">Nội dung này hiện chưa được xuất bản</h1>

          <p className="pub-404-desc">
            Bài viết hoặc trang bạn đang tìm kiếm
            {slug ? (
              <>
                {' '}
                (<strong>/{slug}</strong>)
              </>
            ) : null}{' '}
            có thể đang ở chế độ bản nháp, đã bị gỡ xuất bản bởi tác giả, hoặc đường dẫn truy cập không chính xác.
          </p>

          {/* Author & Admin Callout */}
          <div className="pub-404-admin-box">
            <div className="pub-404-admin-box__info">
              <span className="pub-404-admin-box__icon" aria-hidden="true">
                <FiShield size={20} />
              </span>
              <div>
                <div className="pub-404-admin-box__title">Dành cho người tạo nội dung &amp; Quản trị viên</div>
                <div className="pub-404-admin-box__text">
                  Nếu bạn là tác giả bài viết, vui lòng đăng nhập vào trang quản trị để kiểm tra trạng thái và nhấn &ldquo;Xuất bản&rdquo;.
                </div>
              </div>
            </div>
            <button type="button" className="pub-btn-secondary" onClick={handleAdmin}>
              <FiLogIn size={16} />
              <span>Đăng nhập quản trị</span>
            </button>
          </div>

          {/* Primary Actions */}
          <div className="pub-404-actions">
            <button type="button" className="pub-btn-primary" onClick={handleHome}>
              <FiHome size={16} />
              <span>Về trang chủ</span>
            </button>
            <button type="button" className="pub-btn-secondary" onClick={handleBack}>
              <FiArrowLeft size={16} />
              <span>Quay lại trang trước</span>
            </button>
          </div>

          {/* Suggestions */}
          <div className="pub-404-suggestions">
            <div className="pub-404-suggestions__label">GỢI Ý TÌM KIẾM THÔNG TIN</div>
            <div className="pub-404-suggestions__list">
              <a
                href="/p"
                className="pub-404-suggestions__link"
                onClick={(e) => {
                  e.preventDefault();
                  handleHome();
                }}
              >
                <FiFileText size={15} />
                <span>Danh sách bài viết mới nhất</span>
              </a>
              <a href="#help" className="pub-404-suggestions__link" onClick={(e) => e.preventDefault()}>
                <FiHelpCircle size={15} />
                <span>Trung tâm trợ giúp</span>
              </a>
              <a href="#report" className="pub-404-suggestions__link" onClick={(e) => e.preventDefault()}>
                <FiAlertTriangle size={15} />
                <span>Báo cáo liên kết hỏng</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pub-footer">
        <div className="pub-container pub-footer__inner">
          <span>© 2024 CMSBuilder. Bảo lưu mọi quyền.</span>
          <div className="pub-footer__links">
            <a href="#support" className="pub-footer__link" onClick={(e) => e.preventDefault()}>
              Trung tâm hỗ trợ
            </a>
            <a href="#status" className="pub-footer__link" onClick={(e) => e.preventDefault()}>
              Trạng thái hệ thống
            </a>
            <a href="#contact" className="pub-footer__link" onClick={(e) => e.preventDefault()}>
              Liên hệ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
