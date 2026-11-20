import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiEdit3,
  FiEye,
  FiGrid,
  FiHeart,
  FiLayers,
  FiLink2,
  FiMaximize2,
  FiPause,
  FiPlay,
  FiSearch,
  FiSend,
  FiShare2,
  FiThumbsUp,
  FiType,
  FiX,
  FiZoomIn,
} from 'react-icons/fi';
import { pageApi, USE_MOCK } from '../../features/pages/api/pageApi';
import type { Page } from '../../features/pages/types/page.types';
import { WorkspaceHeroIllustration, VideoPreviewPoster } from './PublicIllustrations';
import PublicNotFoundView from './PublicNotFoundView';
import './PublicPage.css';

type NotFoundReason = 'draft' | 'not_found' | null;

interface RouteInfo {
  slug: string | null;
  forcedStatus: string | null;
}

interface PublicBlock {
  id: number | string;
  page_id?: number;
  type: 'text' | 'image' | 'video' | string;
  content: string | null;
  media_id?: number | null;
  order_index: number;
  url?: string | null;
  original_filename?: string | null;
}

export interface PublicPageSummary {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  published_at: string | null;
  author_name: string | null;
  blocks_count: number;
}

interface PublicPageApiResponse {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  published_at: string | null;
  author_name?: string | null;
  blocks: PublicBlock[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const DEFAULT_SAMPLE_ARTICLE: Page = {
  id: 'sample-01',
  title: 'Tái Định Hình Quy Trình Biên Tập Nội Dung Số Bằng Trải Nghiệm Khối Kéo Thả Trực Quan',
  slug: 'gioi-thieu-san-pham-sprint-1',
  description:
    'Nền tảng CMS thế hệ mới cung cấp khả năng tự do biểu đạt kiến trúc nội dung linh hoạt, tối ưu hoá điểm giao diện tĩnh thành luồng công tác xuất bản tức thời mà không cần can thiệp mã nguồn.',
  status: 'published',
  author: {
    id: 'u-001',
    name: 'Đội ngũ Phát Triển Sản Phẩm CMSBuilder',
  },
  createdAt: '2024-10-12T08:00:00.000Z',
  updatedAt: '2024-10-12T08:00:00.000Z',
};

function normalizeSlug(slug: string): string {
  return String(slug || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
}

function getRouteInfo(): RouteInfo {
  if (typeof window === 'undefined') {
    return { slug: null, forcedStatus: null };
  }
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('slug');
  const forcedStatus = params.get('status');

  if (querySlug !== null && querySlug.trim() !== '') {
    return { slug: normalizeSlug(querySlug), forcedStatus };
  }

  const pathname = window.location.pathname || '';
  const match = pathname.match(/^\/(?:p|public)\/(.+)$/i);
  if (match && match[1]) {
    return { slug: normalizeSlug(decodeURIComponent(match[1])), forcedStatus };
  }

  return { slug: null, forcedStatus };
}

function formatVietnameseDate(iso?: string | null): string {
  if (!iso) return '12 Tháng 10, 2024';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '12 Tháng 10, 2024';
  return `${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}

function getInitials(name?: string): string {
  const parts = String(name || 'CM')
    .trim()
    .split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

function toYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith('/embed/')) return rawUrl;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\/+/, '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function PublicPage() {
  const navigate = useNavigate();
  const [{ slug, forcedStatus }, setRouteInfo] = useState<RouteInfo>(() => getRouteInfo());
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvedPage, setResolvedPage] = useState<Page | null>(null);
  const [realBlocks, setRealBlocks] = useState<PublicBlock[]>([]);
  const [notFoundReason, setNotFoundReason] = useState<NotFoundReason>(null);

  // All published pages from all users
  const [allPublishedPages, setAllPublishedPages] = useState<PublicPageSummary[]>([]);
  const [showAllPagesDrawer, setShowAllPagesDrawer] = useState<boolean>(false);
  const [drawerSearch, setDrawerSearch] = useState<string>('');
  const [sectionSearch, setSectionSearch] = useState<string>('');

  // ProMax UI/UX interactive states
  const [showPreviewBar, setShowPreviewBar] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(42);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; caption?: string } | null>(null);

  // CTA Subscription
  const [email, setEmail] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
    }, 2600);
  };

  // Sync on browser back/forward navigation
  useEffect(() => {
    const onPopState = () => setRouteInfo(getRouteInfo());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Scroll listener for reading progress bar and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      setShowScrollTop(totalScroll > 380);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Esc key listener for drawer and lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(null);
        setShowAllPagesDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch page by slug and published pages list from all users
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setNotFoundReason(null);
      setRealBlocks([]);

      if (forcedStatus === 'draft') {
        if (active) {
          setResolvedPage(null);
          setNotFoundReason('draft');
          setLoading(false);
        }
        return;
      }

      // Real Backend Mode: fetch published pages across all users
      if (!USE_MOCK) {
        try {
          let pagesList: PublicPageSummary[] = [];
          try {
            const listRes = await fetch(`${API_BASE_URL}/api/public/pages?limit=50`, {
              method: 'GET',
              headers: { Accept: 'application/json' },
            });
            if (listRes.ok) {
              const listData = await listRes.json();
              pagesList = listData.items || [];
              if (active) {
                setAllPublishedPages(pagesList);
              }
            }
          } catch {
            // non-blocking
          }

          if (!active) return;

          // Determine target slug: query slug or first available published page
          const targetSlug = slug || (pagesList.length > 0 ? normalizeSlug(pagesList[0].slug) : null);

          if (!targetSlug) {
            setResolvedPage(null);
            setNotFoundReason('not_found');
            setLoading(false);
            return;
          }

          const response = await fetch(
            `${API_BASE_URL}/api/public/pages/${encodeURIComponent(targetSlug)}`,
            {
              method: 'GET',
              headers: { Accept: 'application/json' },
            }
          );

          if (!active) return;

          if (response.status === 404) {
            setResolvedPage(null);
            setNotFoundReason('not_found');
            setLoading(false);
            return;
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = (await response.json()) as PublicPageApiResponse;
          if (!active) return;

          const mappedPage: Page = {
            id: String(data.id),
            title: data.title,
            slug: data.slug,
            description: data.description || '',
            status: data.status === 'published' ? 'published' : 'draft',
            author: { id: 'author', name: data.author_name || 'Tác giả CMSBuilder' },
            createdAt: data.published_at || new Date().toISOString(),
            updatedAt: data.published_at || new Date().toISOString(),
          };

          const sortedBlocks = Array.isArray(data.blocks)
            ? [...data.blocks].sort((a, b) => a.order_index - b.order_index)
            : [];

          setResolvedPage(mappedPage);
          setRealBlocks(sortedBlocks);
          setNotFoundReason(null);
        } catch {
          if (!active) return;
          setResolvedPage(null);
          setNotFoundReason('not_found');
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      // Mock mode: lookup via pageApi.getPages()
      try {
        const res = await pageApi.getPages({ limit: 100 });
        if (!active) return;

        const items = res?.data?.items || [];
        const publishedItems = items.filter((p) => p.status === 'published');
        setAllPublishedPages(
          publishedItems.map((p) => ({
            id: Number(p.id) || 1,
            title: p.title,
            description: p.description,
            slug: p.slug,
            status: p.status,
            published_at: p.updatedAt,
            author_name: p.author?.name || 'Tác giả',
            blocks_count: 0,
          }))
        );

        const matched = slug
          ? items.find((p) => {
              const pSlug = normalizeSlug(p.slug);
              return pSlug === slug || (slug === 'home' && pSlug === '');
            })
          : publishedItems[0] || DEFAULT_SAMPLE_ARTICLE;

        if (!matched) {
          setResolvedPage(null);
          setNotFoundReason('not_found');
        } else if (matched.status === 'draft') {
          setResolvedPage(matched);
          setNotFoundReason('draft');
        } else {
          setResolvedPage(matched);
          setNotFoundReason(null);
        }
      } catch {
        if (!active) return;
        setResolvedPage(null);
        setNotFoundReason('not_found');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [slug, forcedStatus]);

  const article = resolvedPage || DEFAULT_SAMPLE_ARTICLE;

  // Dynamic reading metrics
  const readingStats = useMemo(() => {
    let words = 0;
    if (article.title) words += article.title.trim().split(/\s+/).length;
    if (article.description) words += article.description.trim().split(/\s+/).length;
    for (const b of realBlocks) {
      if (b.type === 'text' && b.content) {
        words += b.content.trim().split(/\s+/).length;
      }
    }
    const minutes = Math.max(1, Math.ceil(words / 180));
    return { words, minutes };
  }, [article, realBlocks]);

  const displayUrl = useMemo(() => {
    const s =
      article.slug && article.slug !== '/'
        ? normalizeSlug(article.slug)
        : 'gioi-thieu-san-pham-sprint-1';
    return `https://cmsbuilder.vn/p/${s}`;
  }, [article.slug]);

  // Smooth client-side navigation between published pages
  const handleNavigateSlug = (newSlug: string) => {
    const clean = normalizeSlug(newSlug);
    window.history.pushState(null, '', `/p/${clean}`);
    setRouteInfo({ slug: clean, forcedStatus: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowAllPagesDrawer(false);
    showToast(`Đang mở: /p/${clean}`);
  };

  const handleCopyUrl = async () => {
    const textToCopy = typeof window !== 'undefined' ? window.location.href : displayUrl;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
    } catch {
      /* ignore clipboard permission errors in restricted contexts */
    }
    setCopied(true);
    showToast('Đã sao chép liên kết trang vào bộ nhớ tạm!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      showToast(next ? 'Bạn đã thích bài viết này! ❤️' : 'Đã bỏ thích');
      return next;
    });
  };

  const handleToggleBookmark = () => {
    setBookmarked((prev) => {
      const next = !prev;
      showToast(next ? 'Đã lưu bài viết vào danh mục quan tâm! 🔖' : 'Đã gỡ khỏi lưu trữ');
      return next;
    });
  };

  const cycleFontSize = () => {
    setFontSize((prev) => {
      if (prev === 'normal') {
        showToast('Cỡ chữ đọc: Lớn (120%)');
        return 'large';
      }
      if (prev === 'large') {
        showToast('Cỡ chữ đọc: Cực đại (140%)');
        return 'xlarge';
      }
      showToast('Cỡ chữ đọc: Tiêu chuẩn (100%)');
      return 'normal';
    });
  };

  const handleGoAdmin = () => {
    navigate('/pages');
  };

  const handleGoBuilder = () => {
    const s = normalizeSlug(article.slug);
    const params = new URLSearchParams();
    if (article.id && article.id !== 'sample-01') params.set('id', String(article.id));
    if (s) params.set('slug', s);
    const qs = params.toString();
    navigate(qs ? `/page-builder?${qs}` : '/page-builder');
  };

  const handleGoDefaultPublic = () => {
    navigate('/p');
  };

  const handleImageClick = (url: string, filename?: string | null) => {
    setLightbox({ url, caption: filename || article.title });
  };

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    showToast('Đăng ký bản tin công nghệ thành công! 🎉');
    setEmail('');
  };

  // Filtered pages for Community Explorer section
  const filteredSectionPages = useMemo(() => {
    if (!sectionSearch.trim()) return allPublishedPages;
    const q = sectionSearch.toLowerCase();
    return allPublishedPages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.author_name && p.author_name.toLowerCase().includes(q)) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [allPublishedPages, sectionSearch]);

  // Filtered pages for Drawer
  const filteredDrawerPages = useMemo(() => {
    if (!drawerSearch.trim()) return allPublishedPages;
    const q = drawerSearch.toLowerCase();
    return allPublishedPages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.author_name && p.author_name.toLowerCase().includes(q)) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [allPublishedPages, drawerSearch]);

  if (loading) {
    return (
      <div className="pub-root">
        <div className="pub-loading" role="status" aria-live="polite">
          <span className="pub-preview-status__dot" style={{ marginRight: '0.75rem' }} />
          Đang tải dữ liệu trang công khai từ máy chủ...
        </div>
      </div>
    );
  }

  if (notFoundReason) {
    return (
      <PublicNotFoundView
        reason={notFoundReason}
        slug={slug || ''}
        onGoAdmin={handleGoAdmin}
        onGoHome={handleGoDefaultPublic}
      />
    );
  }

  return (
    <div className="pub-root">
      {/* ProMax Reading Progress Bar */}
      <div
        className="pub-reading-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Toast Notification Container */}
      {toast && (
        <div className="pub-toast" role="status" aria-live="polite">
          <FiCheckCircle size={16} color="#34D399" />
          <span>{toast}</span>
        </div>
      )}

      {/* Floating Action Companion Dock (Desktop / Tablet) */}
      <aside className="pub-floating-dock" aria-label="Thanh công cụ đọc nhanh">
        <button
          type="button"
          className={`pub-floating-dock__btn ${liked ? 'pub-floating-dock__btn--active' : ''}`}
          onClick={handleToggleLike}
          aria-label={liked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
        >
          <FiHeart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span className="pub-dock-tooltip">{liked ? 'Đã thích' : 'Thích bài viết'}</span>
        </button>

        <button
          type="button"
          className={`pub-floating-dock__btn ${bookmarked ? 'pub-floating-dock__btn--bookmarked' : ''}`}
          onClick={handleToggleBookmark}
          aria-label={bookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        >
          <FiBookOpen size={18} />
          <span className="pub-dock-tooltip">{bookmarked ? 'Đã lưu' : 'Lưu trữ'}</span>
        </button>

        <button
          type="button"
          className="pub-floating-dock__btn"
          onClick={handleCopyUrl}
          aria-label="Sao chép đường dẫn"
        >
          {copied ? <FiCheck size={18} color="#10B981" /> : <FiCopy size={18} />}
          <span className="pub-dock-tooltip">Sao chép liên kết</span>
        </button>

        <button
          type="button"
          className="pub-floating-dock__btn"
          onClick={cycleFontSize}
          aria-label="Điều chỉnh cỡ chữ"
        >
          <FiType size={18} />
          <span className="pub-dock-tooltip">Cỡ chữ: {fontSize}</span>
        </button>

        <button
          type="button"
          className="pub-floating-dock__btn"
          onClick={() => setShowAllPagesDrawer(true)}
          aria-label="Mở danh sách tất cả trang"
        >
          <FiGrid size={18} />
          <span className="pub-dock-tooltip">Tất cả trang ({allPublishedPages.length})</span>
        </button>
      </aside>

      {/* Scroll to Top Floating Button */}
      {showScrollTop && (
        <button
          type="button"
          className="pub-scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
        >
          <FiArrowUp size={18} />
        </button>
      )}

      {/* Desktop Admin Preview Bar */}
      {showPreviewBar && (
        <div className="pub-preview-bar" role="region" aria-label="Thanh xem trước quản trị">
          <div className="pub-container pub-preview-bar__inner">
            <div className="pub-preview-bar__left">
              <span className="pub-preview-status">
                <span className="pub-preview-status__dot" aria-hidden="true" />
                <span>Chính thức</span>
              </span>
              <span aria-hidden="true" style={{ color: '#64748B' }}>
                •
              </span>
              <span className="pub-preview-url" title={displayUrl}>
                {displayUrl}
              </span>
            </div>

            <div className="pub-preview-bar__actions">
              <button
                type="button"
                className="pub-btn-admin-back"
                onClick={() => setShowAllPagesDrawer(true)}
                title="Khám phá các trang đã xuất bản từ toàn bộ người dùng"
              >
                <FiGrid size={15} />
                <span>Kho bài viết ({allPublishedPages.length})</span>
              </button>

              <button type="button" className="pub-btn-copy" onClick={handleCopyUrl}>
                {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép URL'}</span>
              </button>

              <button type="button" className="pub-btn-admin-back" onClick={handleGoBuilder}>
                <FiEdit3 size={15} />
                <span>Chỉnh sửa</span>
              </button>

              <button type="button" className="pub-btn-admin-back" onClick={handleGoAdmin}>
                <FiArrowLeft size={15} />
                <span>Quản trị</span>
              </button>

              <button
                type="button"
                className="pub-btn-icon-dark"
                onClick={() => setShowPreviewBar(false)}
                aria-label="Ẩn thanh xem trước"
                title="Ẩn thanh xem trước"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Site Header */}
      <header className="pub-header">
        <div className="pub-container pub-header__inner">
          <a
            href="/p"
            className="pub-brand"
            onClick={(e) => {
              e.preventDefault();
              handleGoDefaultPublic();
            }}
          >
           <img src="/logo.svg" alt="CMS Builder" style={{ width: '28px', height: '28px' }} />
            <span className="pub-brand__text">
              <span className="pub-brand__title">CMSBuilder</span>
              <span className="pub-brand__sub"></span>
            </span>
          </a>

          <nav className="pub-nav" aria-label="Điều hướng trang công khai">
            <div className="pub-nav__links-desktop">
              <button
                type="button"
                className="pub-nav__link pub-nav__link-btn"
                onClick={() => setShowAllPagesDrawer(true)}
              >
                <FiGrid size={15} />
                <span>Khám phá trang ({allPublishedPages.length})</span>
              </button>
              <a href="#overview" className="pub-nav__link">
                Nội dung
              </a>
              <a href="#community-pages" className="pub-nav__link">
                Cộng đồng
              </a>
            </div>

            {/* Font Size Mode Switcher */}
            <div className="pub-font-control" title="Chỉnh cỡ chữ hiển thị">
              <button
                type="button"
                className={`pub-font-btn ${fontSize === 'normal' ? 'pub-font-btn--active' : ''}`}
                onClick={() => setFontSize('normal')}
              >
                A
              </button>
              <button
                type="button"
                className={`pub-font-btn ${fontSize === 'large' ? 'pub-font-btn--active' : ''}`}
                onClick={() => setFontSize('large')}
              >
                A+
              </button>
              <button
                type="button"
                className={`pub-font-btn ${fontSize === 'xlarge' ? 'pub-font-btn--active' : ''}`}
                onClick={() => setFontSize('xlarge')}
              >
                A++
              </button>
            </div>

            <a href="#cta-signup" className="pub-btn-primary">
              Đăng ký nhận tin
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile Compact Status Strip (< 768px) */}
      <div className="pub-mobile-status-strip" aria-label="Thông tin trang công khai">
        <span className="pub-mobile-status-pill">
          <span>●</span>
          <span>Công khai</span>
        </span>
        <div className="pub-mobile-url-pill" title={displayUrl}>
          <FiLink2 size={13} aria-hidden="true" />
          <span>{displayUrl.replace('https://', '')}</span>
        </div>
        <button
          type="button"
          className="pub-mobile-icon-btn"
          onClick={() => setShowAllPagesDrawer(true)}
          aria-label="Danh sách trang"
          title="Danh sách trang"
        >
          <FiGrid size={16} />
        </button>
        <button
          type="button"
          className="pub-mobile-icon-btn"
          onClick={handleCopyUrl}
          aria-label="Sao chép đường dẫn"
          title="Sao chép đường dẫn"
        >
          {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
        </button>
        <button
          type="button"
          className="pub-mobile-icon-btn pub-mobile-icon-btn--primary"
          onClick={handleGoAdmin}
          aria-label="Quay về trang quản trị"
          title="Quay về trang quản trị"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      {/* Main Article Container */}
      <main className="pub-main" id="overview">
        <article className="pub-article">
          {/* Meta row */}
          <div className="pub-meta-row">
            <span className="pub-badge-feature">TIÊU ĐIỂM</span>
            <span>{formatVietnameseDate(article.updatedAt)}</span>
            <span aria-hidden="true">•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <FiClock size={14} aria-hidden="true" />
              <span>{readingStats.minutes} phút đọc (~{readingStats.words} từ)</span>
            </span>
            <span aria-hidden="true">•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <FiEye size={14} aria-hidden="true" />
            </span>
          </div>

          {/* Title */}
          <h1 className="pub-article__title">{article.title}</h1>

          {/* Lead */}
          <p className="pub-article__lead">
            {article.description || DEFAULT_SAMPLE_ARTICLE.description}
          </p>

          {/* Author Card */}
          <div className="pub-author-card">
            <div className="pub-author-avatar" aria-hidden="true">
              {getInitials(article.author?.name)}
            </div>
            <div className="pub-author-info">
              <div className="pub-author-name">
                {article.author?.name || 'Tác giả CMSBuilder'}
                <span className="pub-author-verified" title="Tác giả được xác thực trên CMSBuilder">
                  <FiCheckCircle size={14} />
                  <span>Xác thực</span>
                </span>
              </div>
              <div className="pub-author-role">
                Xuất bản chính thức trên hệ sinh thái CMSBuilder • Cập nhật {formatVietnameseDate(article.updatedAt)}
              </div>
            </div>
          </div>

          {/* Real ContentBlocks from Backend API when available */}
          {realBlocks.length > 0 ? (
            <div className={`pub-prose pub-font-${fontSize}`} id="explore">
              {realBlocks.map((block) => {
                if (block.type === 'text') {
                  const raw = block.content || '';
                  let parsed: { content?: string; body?: string; level?: string } | null = null;
                  if (raw.trim().startsWith('{')) {
                    try {
                      const obj = JSON.parse(raw);
                      if (
                        obj &&
                        typeof obj === 'object' &&
                        ('content' in obj || 'body' in obj || 'level' in obj)
                      ) {
                        parsed = obj;
                      }
                    } catch {
                      parsed = null;
                    }
                  }

                  if (parsed) {
                    const headingText = typeof parsed.content === 'string' ? parsed.content : '';
                    const bodyText = typeof parsed.body === 'string' ? parsed.body : '';
                    const level = parsed.level;
                    return (
                      <div key={block.id}>
                        {headingText && (
                          <div className="pub-heading-wrap">
                            {level === 'h1' && <h1>{headingText}</h1>}
                            {level === 'h2' && <h2>{headingText}</h2>}
                            {level === 'h3' && <h3>{headingText}</h3>}
                            {(level === 'p' || !['h1', 'h2', 'h3'].includes(String(level))) && (
                              <p style={{ fontWeight: 600 }}>{headingText}</p>
                            )}
                            <a
                              href={`#b-${block.id}`}
                              id={`b-${block.id}`}
                              className="pub-heading-anchor"
                              title="Liên kết đến mục này"
                            >
                              #
                            </a>
                          </div>
                        )}
                        {bodyText && <p style={{ whiteSpace: 'pre-line' }}>{bodyText}</p>}
                      </div>
                    );
                  }

                  return (
                    <p key={block.id} style={{ whiteSpace: 'pre-line' }}>
                      {raw}
                    </p>
                  );
                }

                if (block.type === 'image' && block.url) {
                  return (
                    <figure key={block.id} className="pub-media-figure">
                      <div
                        className="pub-media-frame pub-media-frame--interactive"
                        onClick={() => handleImageClick(block.url!, block.original_filename)}
                        title="Nhấp để phóng to ảnh"
                      >
                        <img
                          src={block.url}
                          alt={block.original_filename || article.title}
                          loading="lazy"
                        />
                        <div className="pub-media-zoom-hint">
                          <FiZoomIn size={14} />
                          <span>Phóng to</span>
                        </div>
                      </div>
                      {block.original_filename && (
                        <figcaption className="pub-media-caption">
                          {block.original_filename}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                if (block.type === 'video') {
                  const videoSrc = block.url || block.content || '';
                  const embedUrl = videoSrc ? toYouTubeEmbedUrl(videoSrc) : null;
                  return (
                    <section key={block.id} className="pub-video-section">
                      <div className="pub-video-player">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={`Video ${block.id}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : videoSrc ? (
                          <video src={videoSrc} controls />
                        ) : (
                          <VideoPreviewPoster isPlaying={isPlaying} />
                        )}
                      </div>
                    </section>
                  );
                }

                return null;
              })}
            </div>
          ) : (
            <>
              {/* Fallback Hero Image Block */}
              <figure className="pub-media-figure">
                <div className="pub-media-frame">
                  <span className="pub-media-badge">
                    <FiCheck size={14} color="#166534" aria-hidden="true" />
                    <span>Hình ảnh thực tế phiên bản v2.4</span>
                  </span>
                  <WorkspaceHeroIllustration />
                </div>
                <figcaption className="pub-media-caption">
                  Hình 1.1: Khung không gian thiết kế chia 3 phân vùng với độ trễ phản hồi dưới 16ms
                  trên màn hình độ phân giải Retina.
                </figcaption>
              </figure>

              {/* Fallback Editorial Prose */}
              <div className={`pub-prose pub-font-${fontSize}`} id="explore">
                <p>
                  Trong kỷ nguyên mà tốc độ phân phối thông tin quyết định thành bại của chiến dịch,
                  việc các nhóm biên tập nội dung vẫn phải phụ thuộc vào quy trình xuất bản tĩnh là
                  một điểm nghẽn lớn. Hệ sinh thái <strong>CMSBuilder Sprint 1</strong> mở ra phương
                  pháp tiếp cận hoàn toàn mới: xem mỗi thành phần trang là một khối lego có thể tái cấu
                  hình ngay lập tức.
                </p>
                <p>
                  Người viết không chỉ đơn thuần gõ chữ, mà còn trực tiếp điều khiển nhịp điệu đọc,
                  kiểm thử khả năng phản hồi trên màn hình di động chỉ trong một cú chạm.
                </p>
              </div>

              {/* Quote Block */}
              <blockquote className="pub-quote-card">
                <div className="pub-quote-card__label">
                  <FiBookOpen size={14} aria-hidden="true" />
                  <span>GÓC NHÌN THIẾT KẾ</span>
                </div>
                <p className="pub-quote-card__text">
                  &ldquo;Một công cụ biên tập hoàn hảo không phải là công cụ có nhiều tính năng nhất,
                  mà là công cụ khiến khoảng cách giữa ý tưởng và bản phát hành bằng không.&rdquo;
                </p>
                <cite className="pub-quote-card__cite">
                  — Đội ngũ Kiến trúc sư Trải nghiệm CMSBuilder
                </cite>
              </blockquote>

              <div className={`pub-prose pub-font-${fontSize}`}>
                <p>
                  Bên cạnh khả năng sắp đặt khối tự do, hệ thống hỗ trợ tích hợp phương tiện động chất
                  lượng cao mà không làm giảm tốc độ render của thiết bị cầm tay.
                </p>
              </div>

              {/* Video Section */}
              <section
                className="pub-video-section"
                id="experience"
                aria-label="Video giới thiệu tính năng"
              >
                <div className="pub-video-header">
                  <div>
                    <div className="pub-video-eyebrow">XEM TRƯỚC TÍNH NĂNG</div>
                    <h2 className="pub-video-title">Băng ghi hình thực tế: Trình biên tập hoạt động</h2>
                  </div>
                  <span className="pub-video-badge">HD 1080p • 02:45</span>
                </div>

                <div className="pub-video-player">
                  <VideoPreviewPoster isPlaying={isPlaying} />
                  <button
                    type="button"
                    className="pub-video-play-btn"
                    onClick={() => setIsPlaying((prev) => !prev)}
                    aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
                  >
                    {isPlaying ? (
                      <FiPause size={24} />
                    ) : (
                      <FiPlay size={24} style={{ marginLeft: '2px' }} />
                    )}
                  </button>
                  <div className="pub-video-controls">
                    <span>{isPlaying ? '01:12 / 02:45' : '00:54 / 02:45'}</span>
                    <div className="pub-video-progress" aria-hidden="true">
                      <div
                        className="pub-video-progress__fill"
                        style={{ width: isPlaying ? '44%' : '33%' }}
                      />
                    </div>
                    <FiMaximize2 size={15} aria-hidden="true" />
                  </div>
                </div>

                <p className="pub-media-caption">
                  Video nhúng trực tiếp qua cơ chế định danh độc lập, không bị ảnh hưởng bởi thuật
                  toán quảng cáo bên ngoài.
                </p>
              </section>
            </>
          )}

          {/* Social Share & Reaction Strip */}
          <div className="pub-share-row">
            <span className="pub-share-label">Tương tác bài viết:</span>
            <div className="pub-share-buttons">
              <button
                type="button"
                className={`pub-share-btn ${liked ? 'pub-share-btn--active' : ''}`}
                onClick={handleToggleLike}
                aria-label="Thích bài viết"
                aria-pressed={liked}
              >
                <FiThumbsUp size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, marginLeft: '0.375rem' }}>
                  {likeCount}
                </span>
              </button>
              <button
                type="button"
                className={`pub-share-btn ${bookmarked ? 'pub-share-btn--active' : ''}`}
                onClick={handleToggleBookmark}
                aria-label="Lưu bài viết"
              >
                <FiBookOpen size={18} />
              </button>
              <button
                type="button"
                className="pub-share-btn"
                onClick={handleCopyUrl}
                aria-label="Sao chép liên kết bài viết"
              >
                {copied ? <FiCheck size={18} /> : <FiShare2 size={18} />}
              </button>
            </div>
          </div>

          {/* ProMax Community Explorer: "Khám phá các bài viết đã xuất bản từ cộng đồng" */}
          <section className="pub-other-pages-section" id="community-pages">
            <div className="pub-other-pages__header">
              <div className="pub-other-pages__title-row">
                <div className="pub-other-pages__heading-wrap">
                  <FiBookOpen size={22} color="var(--brand-primary, #4F46E5)" />
                  <h2 className="pub-other-pages__heading">
                    Khám phá bài viết từ cộng đồng CMSBuilder ({allPublishedPages.length})
                  </h2>
                </div>

                {/* Quick filter search */}
                <div className="pub-other-pages__search-bar">
                  <FiSearch size={15} color="#94A3B8" />
                  <input
                    type="text"
                    className="pub-other-pages__search-input"
                    placeholder="Tìm bài viết, tác giả..."
                    value={sectionSearch}
                    onChange={(e) => setSectionSearch(e.target.value)}
                  />
                  {sectionSearch && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => setSectionSearch('')}
                    >
                      <FiX size={14} color="#94A3B8" />
                    </button>
                  )}
                </div>
              </div>
              <p className="pub-other-pages__desc">
                Tuyển tập những ấn phẩm và trang đích được xuất bản chính thức bởi toàn thể người dùng trên hệ thống.
              </p>
            </div>

            {filteredSectionPages.length > 0 ? (
              <div className="pub-other-pages__grid">
                {filteredSectionPages.map((p) => {
                  const isCurrent = normalizeSlug(p.slug) === normalizeSlug(article.slug);
                  return (
                    <div
                      key={p.id}
                      className={`pub-page-card ${isCurrent ? 'pub-page-card--current' : ''}`}
                      onClick={() => handleNavigateSlug(p.slug)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleNavigateSlug(p.slug);
                        }
                      }}
                    >
                      <div className="pub-page-card__badges">
                        <span className="pub-page-card__status">
                          <span className="pub-preview-status__dot" /> Xuất bản
                        </span>
                        {isCurrent ? (
                          <span className="pub-page-card__badge-current">
                            <FiCheck size={11} /> Đang xem
                          </span>
                        ) : (
                          <span className="pub-page-card__blocks-count">
                            {p.blocks_count} khối
                          </span>
                        )}
                      </div>

                      <h3 className="pub-page-card__title">{p.title}</h3>
                      <p className="pub-page-card__desc">
                        {p.description || 'Không có tóm tắt nội dung bổ sung.'}
                      </p>

                      <div className="pub-page-card__footer">
                        <span className="pub-page-card__author" title={p.author_name || 'Tác giả'}>
                          ✍️ {p.author_name || 'Tác giả CMSBuilder'}
                        </span>
                        <span className="pub-page-card__link">
                          Đọc tiếp <FiArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="pub-drawer__empty">
                Không tìm thấy bài viết nào phù hợp với từ khóa &ldquo;{sectionSearch}&rdquo;.
              </div>
            )}
          </section>

          {/* CTA Gradient Banner */}
          <section className="pub-cta-banner" id="cta-signup" aria-label="Đăng ký trải nghiệm sớm">
            <span className="pub-cta-banner__pill">Bắt đầu hành trình sáng tạo nội dung</span>
            <h2 className="pub-cta-banner__title">
              Sẵn sàng xây dựng trang công khai của riêng bạn?
            </h2>
            <p className="pub-cta-banner__desc">
              Đăng ký tham gia hệ sinh thái CMSBuilder để tự do tạo lập không giới hạn trang đích với băng thông siêu tốc và trải nghiệm trực quan.
            </p>

            <form className="pub-cta-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="pub-cta-input"
                placeholder="Nhập địa chỉ email của bạn..."
                aria-label="Địa chỉ email đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="pub-cta-submit">
                <span>Tham gia ngay</span>
                <FiSend size={15} aria-hidden="true" />
              </button>
            </form>

            {subscribed && (
              <div className="pub-cta-feedback" role="status">
                Cảm ơn bạn đã đăng ký! Chúng tôi đã ghi nhận email của bạn.
              </div>
            )}
          </section>
        </article>
      </main>

      {/* ProMax Slide-out Drawer: All Published Pages Explorer */}
      {showAllPagesDrawer && (
        <div className="pub-drawer-overlay" onClick={() => setShowAllPagesDrawer(false)}>
          <div className="pub-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pub-drawer__header">
              <div className="pub-drawer__title-wrap">
                <FiLayers size={22} color="var(--brand-primary, #4F46E5)" />
                <h3>Kho bài viết công khai</h3>
                <span className="pub-drawer__count-badge">
                  {allPublishedPages.length} bài
                </span>
              </div>
              <button
                type="button"
                className="pub-btn-icon-dark"
                onClick={() => setShowAllPagesDrawer(false)}
                aria-label="Đóng bảng khám phá"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="pub-drawer__search">
              <FiSearch size={16} color="#94A3B8" />
              <input
                type="text"
                className="pub-drawer__search-input"
                placeholder="Tìm bài viết, tiêu đề hoặc tác giả..."
                value={drawerSearch}
                onChange={(e) => setDrawerSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="pub-drawer__list">
              {filteredDrawerPages.length > 0 ? (
                filteredDrawerPages.map((item) => {
                  const isCurrent = normalizeSlug(item.slug) === normalizeSlug(article.slug);
                  return (
                    <div
                      key={item.id}
                      className={`pub-drawer__item ${isCurrent ? 'pub-drawer__item--active' : ''}`}
                      onClick={() => handleNavigateSlug(item.slug)}
                    >
                      <div className="pub-page-card__badges">
                        <span className="pub-page-card__status">
                          <span className="pub-preview-status__dot" /> Xuất bản
                        </span>
                        {isCurrent && (
                          <span className="pub-page-card__badge-current">Đang đọc</span>
                        )}
                        <span className="pub-page-card__blocks-count">
                          {item.blocks_count} khối nội dung
                        </span>
                      </div>

                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--text-primary, #0F172A)',
                          margin: '0 0 0.375rem 0',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.title}
                      </h4>

                      {item.description && (
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary, #475569)',
                            margin: '0 0 0.75rem 0',
                            lineHeight: 1.5,
                          }}
                        >
                          {item.description}
                        </p>
                      )}

                      <div className="pub-page-card__footer">
                        <span style={{ color: 'var(--text-muted, #64748B)' }}>
                          ✍️ {item.author_name || 'Tác giả CMSBuilder'}
                        </span>
                        <span className="pub-page-card__link">
                          Xem bài <FiArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="pub-drawer__empty">
                  Không tìm thấy bài viết nào khớp với &ldquo;{drawerSearch}&rdquo;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ProMax Lightbox Modal */}
      {lightbox && (
        <div className="pub-lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="pub-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pub-lightbox-close"
              onClick={() => setLightbox(null)}
              aria-label="Đóng ảnh"
            >
              <FiX size={20} />
            </button>
            <img src={lightbox.url} alt={lightbox.caption || 'Hình ảnh phóng to'} className="pub-lightbox-img" />
            {lightbox.caption && (
              <div className="pub-lightbox-caption">{lightbox.caption}</div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pub-footer">
        <div className="pub-container pub-footer__inner">
          <div>
            <strong style={{ color: 'var(--text-primary, #0F172A)' }}>CMSBuilder</strong>
            <div>© 2026 Bản quyền thuộc về tác giả bài viết. Mọi quyền được bảo lưu.</div>
          </div>
          <div className="pub-footer__links">
            <span>
              Xuất bản bởi <strong style={{ color: 'var(--text-primary, #0F172A)' }}>CMSBuilder</strong> — Nền tảng biên tập đa phương tiện thế hệ mới
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
