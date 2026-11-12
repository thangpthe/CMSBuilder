// PageCardListMobile – card list for small screens.

import React from 'react';
import type { Page } from '../types/page.types';
import {
  COLORS,
  displaySlug,
  formatUpdatedAt,
  iconBtnStyle,
  PageRowActions,
  StatusBadge,
} from './PageTableRow';

export interface PageCardListMobileProps extends PageRowActions {
  pages: Page[];
  busyIds?: string[];
  refreshing?: boolean;
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
  padding: '7px 12px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
});

export const PageCardListMobile: React.FC<PageCardListMobileProps> = ({
  pages,
  busyIds = [],
  refreshing,
  onEdit,
  onDelete,
  onPreview,
  onToggleStatus,
  onCopySlug,
}) => (
  <ul
    data-testid="page-card-list"
    aria-busy={refreshing || undefined}
    style={{
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
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
            background: '#fff',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 14,
            opacity: busy ? 0.6 : 1,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div
              aria-hidden
              style={{
                flex: '0 0 38px',
                height: 38,
                borderRadius: 10,
                background: published ? COLORS.primarySoft : COLORS.draftBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              📄
            </div>
            <div
              title={page.title}
              style={{
                flex: 1,
                minWidth: 0,
                fontWeight: 600,
                fontSize: 15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {page.title}
            </div>
            <StatusBadge status={page.status} />
          </div>

          <div
            style={{
              marginTop: 10,
              background: COLORS.bgSoft,
              borderRadius: 8,
              padding: '7px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <code style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {published ? '🔗' : '🔒'} {displaySlug(page.slug)}
            </code>
            {published ? (
              <button
                type="button"
                onClick={() => onCopySlug(page)}
                style={{ ...iconBtnStyle, fontSize: 12, color: COLORS.primary, fontWeight: 600 }}
              >
                ⧉ Sao chép
              </button>
            ) : (
              <span style={{ fontSize: 12, color: COLORS.muted, fontStyle: 'italic' }}>
                Chưa công khai
              </span>
            )}
          </div>

          <div
            style={{
              marginTop: 10,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              color: COLORS.muted,
            }}
          >
            <span>
              <strong
                style={{
                  fontSize: 10,
                  background: COLORS.bgSoft,
                  borderRadius: 999,
                  padding: '2px 5px',
                  marginRight: 6,
                }}
              >
                {initials(page.author.name)}
              </strong>
              {page.author.name}
            </span>
            <span>🕒 {formatUpdatedAt(page.updatedAt).split(' • ')[0]}</span>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              disabled={busy}
              onClick={() => onEdit(page)}
              style={pillBtn(COLORS.primary, '#fff')}
            >
              ✏️ {published ? 'Sửa' : 'Tiếp tục sửa'}
            </button>
            {published ? (
              <button
                type="button"
                onClick={() => onPreview(page)}
                style={pillBtn('transparent', COLORS.text)}
              >
                👁 Xem trước
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => onToggleStatus(page)}
                style={pillBtn(COLORS.published, '#fff')}
              >
                ⬆ Xuất bản ngay
              </button>
            )}
            <span style={{ flex: 1 }} />
            {published && (
              <button
                type="button"
                disabled={busy}
                title="Gỡ xuất bản"
                aria-label={`Gỡ xuất bản ${page.title}`}
                onClick={() => onToggleStatus(page)}
                style={iconBtnStyle}
              >
                🚫
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
              🗑
            </button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default PageCardListMobile;
