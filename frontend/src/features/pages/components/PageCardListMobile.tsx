// PageCardListMobile – card list for small screens.

import React from 'react';
import {
  FiFileText,
  FiLink,
  FiLock,
  FiCopy,
  FiClock,
  FiEdit,
  FiEye,
  FiUploadCloud,
  FiSlash,
  FiTrash2,
  FiLayout,
} from 'react-icons/fi';
import type { Page } from '../types/page.types';
import {
  COLORS,
  displaySlug,
  formatUpdatedAt,
  iconBtnStyle,
  StatusBadge,
} from './PageTableRow';
import type { PageRowActions } from './PageTableRow';

export interface PageCardListMobileProps extends PageRowActions {
  pages: Page[];
  busyIds?: string[];
  refreshing?: boolean;
  columns?: 1 | 2;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

const pillBtn = (bg: string, color: string): React.CSSProperties => ({
  border: 'none',
  background: bg,
  color,
  minHeight: '2.75rem',
  minWidth: '2.75rem',
  padding: '0.5rem 0.5rem',
  borderRadius: '0.5rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
  whiteSpace: 'nowrap',
});

export const PageCardListMobile: React.FC<PageCardListMobileProps> = ({
  pages,
  busyIds = [],
  refreshing,
  columns = 1,
  onEdit,
  onDelete,
  onPreview,
  onToggleStatus,
  onCopySlug,
  onBuildContent,
}) => (
  <ul
    data-testid="page-card-list"
    aria-busy={refreshing || undefined}
    style={{
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'grid',
      gridTemplateColumns: columns === 2 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
      gap: '0.75rem',
      opacity: refreshing ? 0.55 : 1,
    }}
  >
    {pages.map((page) => {
      const published = page.status === 'published';
      const busy = busyIds.includes(page.id);
      return (
        <li
          key={page.id}
          data-testid="page-card"
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '0.875rem',
            padding: columns === 1 ? '0.75rem' : '0.875rem',
            opacity: busy ? 0.6 : 1,
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div
              aria-hidden
              style={{
                flex: '0 0 2.375rem',
                height: '2.375rem',
                borderRadius: '0.625rem',
                background: published ? COLORS.primarySoft : COLORS.draftBg,
                color: published ? COLORS.primary : COLORS.draft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiFileText size={18} />
            </div>
            <div
              title={page.title}
              style={{
                flex: '1 1 7rem',
                minWidth: '7rem',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: COLORS.text,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {page.title}
            </div>
            <StatusBadge status={page.status} />
          </div>

          <div
            style={{
              marginTop: '0.625rem',
              background: COLORS.bgSoft,
              borderRadius: '0.5rem',
              padding: '0.375rem 0.625rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0, flex: '1 1 8rem' }}>
              {published ? (
                <FiLink size={14} color={COLORS.primary} />
              ) : (
                <FiLock size={14} color={COLORS.muted} />
              )}
              <code style={{ fontSize: '0.78125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displaySlug(page.slug)}
              </code>
            </div>
            {published ? (
              <button
                type="button"
                onClick={() => onCopySlug(page)}
                style={{
                  ...iconBtnStyle,
                  fontSize: '0.75rem',
                  color: COLORS.primary,
                  fontWeight: 600,
                  gap: '0.25rem',
                  padding: '0.375rem 0.625rem',
                }}
              >
                <FiCopy size={13} />
                <span>Sao chép</span>
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: COLORS.muted, fontStyle: 'italic' }}>
                Chưa công khai
              </span>
            )}
          </div>

          <div
            style={{
              marginTop: '0.625rem',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.375rem',
              fontSize: '0.8125rem',
              color: COLORS.muted,
            }}
          >
            <span>
              <strong
                style={{
                  fontSize: '0.625rem',
                  background: COLORS.bgSoft,
                  borderRadius: 999,
                  padding: '0.125rem 0.3125rem',
                  marginRight: '0.375rem',
                }}
              >
                {initials(page.author.name)}
              </strong>
              {page.author.name}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FiClock size={12} />
              <span>{formatUpdatedAt(page.updatedAt).split(' • ')[0]}</span>
            </span>
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={busy}
              onClick={() => onEdit(page)}
              style={pillBtn(COLORS.primary, COLORS.surface)}
            >
              <FiEdit size={14} />
              <span>{published ? 'Sửa' : 'Tiếp tục sửa'}</span>
            </button>
            {published ? (
              <button
                type="button"
                onClick={() => onPreview(page)}
                style={pillBtn(COLORS.bgSoft, COLORS.text)}
              >
                <FiEye size={14} />
                <span>Xem trước</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => onToggleStatus(page)}
                style={pillBtn(COLORS.published, COLORS.surface)}
              >
                <FiUploadCloud size={14} />
                <span>Xuất bản ngay</span>
              </button>
            )}
            <span style={{ flex: 1 }} />
            {onBuildContent && (
              <button
                type="button"
                disabled={busy}
                title="Soạn nội dung"
                aria-label={`Soạn nội dung ${page.title}`}
                onClick={() => onBuildContent(page)}
                style={{ ...iconBtnStyle, color: COLORS.primary }}
              >
                <FiLayout size={16} />
              </button>
            )}
            {published && (
              <button
                type="button"
                disabled={busy}
                title="Gỡ xuất bản"
                aria-label={`Gỡ xuất bản ${page.title}`}
                onClick={() => onToggleStatus(page)}
                style={iconBtnStyle}
              >
                <FiSlash size={16} />
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              title="Xóa trang"
              aria-label={`Xóa ${page.title}`}
              onClick={() => onDelete(page)}
              style={{ ...iconBtnStyle, color: COLORS.danger }}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default PageCardListMobile;
