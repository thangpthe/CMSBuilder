import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiCopy,
  FiEdit3,
  FiLayers,
  FiLink2,
  FiMaximize2,
  FiPause,
  FiPlay,
  FiSend,
  FiShare2,
  FiThumbsUp,
  FiX,
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

interface PublicPageApiResponse {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  published_at: string | null;
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
  const [{ slug, forcedStatus }, setRouteInfo] = useState<RouteInfo>(() => getRouteInfo());
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvedPage, setResolvedPage] = useState<Page | null>(null);
  const [realBlocks, setRealBlocks] = useState<PublicBlock[]>([]);
  const [notFoundReason, setNotFoundReason] = useState<NotFoundReason>(null);

  const [showPreviewBar, setShowPreviewBar] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  // Sync on browser back/forward navigation
  useEffect(() => {
    const onPopState = () => setRouteInfo(getRouteInfo());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Fetch page by slug (public endpoint when USE_MOCK=false, pageApi when USE_MOCK=true)
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

      if (!slug) {
        if (active) {
          setResolvedPage(DEFAULT_SAMPLE_ARTICLE);
          setNotFoundReason(null);
          setLoading(false);
        }
        return;
      }

      // Real Backend Public Endpoint: GET /api/public/pages/{slug} (no auth required)
      if (!USE_MOCK) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/public/pages/${encodeURIComponent(slug)}`,
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
            author: { id: 'author', name: 'CMSBuilder Author' },
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
        const matched = items.find((p) => {
          const pSlug = normalizeSlug(p.slug);
          return pSlug === slug || (slug === 'home' && pSlug === '');
        });

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

  const displayUrl = useMemo(() => {
    const s =
      article.slug && article.slug !== '/'
        ? normalizeSlug(article.slug)
        : 'gioi-thieu-san-pham-sprint-1';
    return `https://cmsbuilder.vn/p/${s}`;
  }, [article.slug]);

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
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoAdmin = () => {
    window.location.href = '/pages';
  };

  const handleGoBuilder = () => {
    const s = normalizeSlug(article.slug);
    const params = new URLSearchParams();
    if (article.id && article.id !== 'sample-01') params.set('id', String(article.id));
    if (s) params.set('slug', s);
    const qs = params.toString();
    window.location.href = qs ? `/page-builder?${qs}` : '/page-builder';
  };

  const handleGoLogin = () => {
    window.location.href = '/login';
  };

  const handleGoDefaultPublic = () => {
    window.location.href = '/p';
  };

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  if (loading) {
    return (
      <div className="pub-root">
        <div className="pub-loading" role="status" aria-live="polite">
          Đang tải nội dung trang công khai...
        </div>
      </div>
    );
  }

  if (notFoundReason) {
    return (
      <PublicNotFoundView
        reason={notFoundReason}
        slug={slug || ''}
        onGoAdmin={handleGoLogin}
        onGoHome={handleGoDefaultPublic}
      />
    );
  }

  return (
    <div className="pub-root">
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
            <span className="pub-brand__logo" aria-hidden="true">
              <FiLayers size={20} />
            </span>
            <span className="pub-brand__text">
              <span className="pub-brand__title">Kỷ Nguyên Số</span>
              <span className="pub-brand__sub">Bản tin đổi mới sáng tạo • Số phát hành #08</span>
            </span>
          </a>

          <nav className="pub-nav" aria-label="Điều hướng trang công khai">
            <div className="pub-nav__links-desktop">
              <a href="#overview" className="pub-nav__link">
                Tổng quan
              </a>
              <a href="#explore" className="pub-nav__link">
                Khám phá
              </a>
              <a href="#experience" className="pub-nav__link">
                Trải nghiệm
              </a>
            </div>
            <a href="#cta-signup" className="pub-btn-primary">
              Đăng ký dùng thử
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

      {/* Main Article */}
      <main className="pub-main" id="overview">
        <article className="pub-article">
          {/* Meta row */}
          <div className="pub-meta-row">
            <span className="pub-badge-feature">TIÊU ĐIỂM</span>
            <span>{formatVietnameseDate(article.updatedAt)}</span>
            <span aria-hidden="true">•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <FiClock size={14} aria-hidden="true" />
              <span>4 phút đọc</span>
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
              <div className="pub-author-name">{article.author?.name || 'Hoàng Nam'}</div>
              <div className="pub-author-role">
                Chủ biên: Hoàng Nam • Kiểm duyệt chất lượng nội dung số
              </div>
            </div>
          </div>

          {/* Real ContentBlocks from Backend API when available */}
          {realBlocks.length > 0 ? (
            <div className="pub-prose" id="explore">
              {realBlocks.map((block) => {
                if (block.type === 'text') {
                  return (
                    <p key={block.id} style={{ whiteSpace: 'pre-line' }}>
                      {block.content}
                    </p>
                  );
                }

                if (block.type === 'image' && block.url) {
                  return (
                    <figure key={block.id} className="pub-media-figure">
                      <div className="pub-media-frame">
                        <img
                          src={block.url}
                          alt={block.original_filename || article.title}
                          loading="lazy"
                        />
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
              {/* Hero Image Block */}
              <figure className="pub-media-figure">
                <div className="pub-media-frame">
                  <span className="pub-media-badge">
                    <FiCheck size={14} color="#166534" aria-hidden="true" />
                    <span>Hình ảnh thực tế phiên bản v2.4</span>
                  </span>
                  <WorkspaceHeroIllustration />
                </div>
                <figcaption className="pub-media-caption">
                  Hình 1.1: Khung không gian thiết kế chia 3 phân vùng với độ trễ phản hồi dưới 16ms trên màn hình độ phân giải Retina.
                </figcaption>
              </figure>

              {/* Editorial Prose */}
              <div className="pub-prose" id="explore">
                <p>
                  Trong kỷ nguyên mà tốc độ phân phối thông tin quyết định thành bại của chiến dịch, việc các nhóm biên tập nội dung vẫn phải phụ thuộc vào quy trình xuất bản tĩnh là một điểm nghẽn lớn. Hệ sinh thái{' '}
                  <strong>CMSBuilder Sprint 1</strong> mở ra phương pháp tiếp cận hoàn toàn mới: xem mỗi thành phần trang là một khối lego có thể tái cấu hình ngay lập tức.
                </p>
                <p>
                  Người viết không chỉ đơn thuần gõ chữ, mà còn trực tiếp điều khiển nhịp điệu đọc, kiểm thử khả năng phản hồi trên màn hình di động chỉ trong một cú chạm.
                </p>
              </div>

              {/* Quote Block */}
              <blockquote className="pub-quote-card">
                <div className="pub-quote-card__label">
                  <FiBookOpen size={14} aria-hidden="true" />
                  <span>GÓC NHÌN THIẾT KẾ</span>
                </div>
                <p className="pub-quote-card__text">
                  &ldquo;Một công cụ biên tập hoàn hảo không phải là công cụ có nhiều tính năng nhất, mà là công cụ khiến khoảng cách giữa ý tưởng và bản phát hành bằng không.&rdquo;
                </p>
                <cite className="pub-quote-card__cite">
                  — Đội ngũ Kiến trúc sư Trải nghiệm CMSBuilder
                </cite>
              </blockquote>

              <div className="pub-prose">
                <p>
                  Bên cạnh khả năng sắp đặt khối tự do, hệ thống hỗ trợ tích hợp phương tiện động chất lượng cao mà không làm giảm tốc độ render của thiết bị cầm tay.
                </p>
              </div>

              {/* Video Section (16:9 Responsive) */}
              <section className="pub-video-section" id="experience" aria-label="Video giới thiệu tính năng">
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
                    {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} style={{ marginLeft: '2px' }} />}
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
                  Video nhúng trực tiếp qua cơ chế định danh độc lập, không bị ảnh hưởng bởi thuật toán quảng cáo bên ngoài.
                </p>
              </section>
            </>
          )}

          {/* CTA Gradient Banner */}
          <section className="pub-cta-banner" id="cta-signup" aria-label="Đăng ký trải nghiệm sớm">
            <span className="pub-cta-banner__pill">Bắt đầu hành trình sáng tạo nội dung</span>
            <h2 className="pub-cta-banner__title">
              Sẵn sàng xây dựng trang công khai của riêng bạn?
            </h2>
            <p className="pub-cta-banner__desc">
              Đăng ký tham gia chương trình Trải Nghiệm Sớm Sprint 1 để nhận quyền tạo lập không giới hạn trang đích với băng thông siêu tốc.
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
                <FiArrowRight size={15} aria-hidden="true" style={{ display: 'none' }} />
              </button>
            </form>

            {subscribed && (
              <div className="pub-cta-feedback" role="status">
                Cảm ơn bạn đã đăng ký! Chúng tôi đã ghi nhận email của bạn cho Sprint 1.
              </div>
            )}
          </section>

          {/* Share Row */}
          <div className="pub-share-row">
            <span className="pub-share-label">Chia sẻ bài viết:</span>
            <div className="pub-share-buttons">
              <button
                type="button"
                className={`pub-share-btn ${liked ? 'pub-share-btn--active' : ''}`}
                onClick={() => setLiked((v) => !v)}
                aria-label="Thích bài viết"
                aria-pressed={liked}
              >
                <FiThumbsUp size={18} />
              </button>
              <button
                type="button"
                className="pub-share-btn"
                onClick={handleCopyUrl}
                aria-label="Chia sẻ bài viết"
              >
                <FiShare2 size={18} />
              </button>
              <button
                type="button"
                className="pub-share-btn"
                onClick={handleCopyUrl}
                aria-label="Sao chép liên kết bài viết"
              >
                {copied ? <FiCheck size={18} /> : <FiLink2 size={18} />}
              </button>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="pub-footer">
        <div className="pub-container pub-footer__inner">
          <div>
            <strong style={{ color: 'var(--text-primary, #0F172A)' }}>Kỷ Nguyên Số Media</strong>
            <div>© 2024 Bản quyền thuộc về tác giả bài viết. Mọi quyền được bảo lưu.</div>
          </div>
          <div className="pub-footer__links">
            <span>
              Xuất bản bởi <strong style={{ color: 'var(--text-primary, #0F172A)' }}>CMSBuilder</strong> — Nền tảng biên tập đa phương tiện
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
