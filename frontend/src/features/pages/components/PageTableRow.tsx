// PageTableRow – one desktop row + shared list helpers (status badge, time, copy slug).

import React, { useState } from 'react';
import {
  FiFileText,
  FiCopy,
  FiEdit,
  FiEye,
  FiTrash2,
  FiUploadCloud,
  FiSlash,
  FiUser,
} from 'react-icons/fi';
import type { Page, PageStatus } from '../types/page.types';

/* ------------------------------------------------------------------ */
/* Shared helpers (also used by PageCardListMobile)                    */
/* ------------------------------------------------------------------ */

export const COLORS = {
  primary: '#4f46e5',
  primarySoft: '#eef2ff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  bgSoft: '#f5f6fb',
  published: '#047857',
  publishedBg: '#d1fae5',
  draft: '#92400e',
  draftBg: '#f3e2c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
};

export function displaySlug(slug: string): string {
  const s = slug.replace(/^\/+/, '');
  return `/${s}`;
}

export function formatUpdatedAt(iso: string, now: number = Date.now()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Math.max(0, now - d.getTime());
  const min = Math.floor(diff / 60000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const time = `${hh}:${mm}`;
  if (min < 1) return 'Vừa xong';
  if (min < 60) return `${min} phút trước • ${time}`;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 86400000;
  if (d.getTime() >= startOfToday.getTime()) return `Hôm nay • ${time}`;
  if (d.getTime() >= startOfToday.getTime() - dayMs) return `Hôm qua • ${time}`;
  const days = Math.ceil((startOfToday.getTime() - d.getTime()) / dayMs);
  if (days <= 30) return `${days} ngày trước • ${time}`;
  return `${d.toLocaleDateString('vi-VN')} • ${time}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export const StatusBadge: React.FC<{ status: PageStatus }> = ({ status }) => {
  const published = status === 'published';
  return (
    <span
      data-testid="page-status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        color: published ? COLORS.published : COLORS.draft,
        background: published ? COLORS.publishedBg : COLORS.draftBg,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: published ? COLORS.published : COLORS.draft,
        }}
      />
      {published ? 'Đã xuất bản' : 'Bản nháp'}
    </span>
  );
};

export interface PageRowActions {
  onEdit: (page: Page) => void;
  onDelete: (page: Page) => void;
  onPreview: (page: Page) => void;
  onToggleStatus: (page: Page) => void;
  onCopySlug: (page: Page) => void;
}

export const iconBtnStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: 6,
  borderRadius: 8,
  fontSize: 15,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: COLORS.text,
  transition: 'background 0.15s ease',
};

/* ------------------------------------------------------------------ */
/* Row                                                                 */
/* ------------------------------------------------------------------ */

export interface PageTableRowProps extends PageRowActions {
  page: Page;
  busy?: boolean;
}

const cell: React.CSSProperties = {
  padding: '14px 16px',
  borderTop: `1px solid ${COLORS.border}`,
  verticalAlign: 'middle',
  fontSize: 14,
  color: COLORS.text,
};

const clamp2: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export const PageTableRow: React.FC<PageTableRowProps> = ({
  page,
  busy,
  onEdit,
  onDelete,
  onPreview,
  onToggleStatus,
  onCopySlug,
}) => {
  const [hover, setHover] = useState(false);
  const published = page.status === 'published';

  return (
    <tr
      data-testid="page-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? '#fafbff' : '#fff', opacity: busy ? 0.6 : 1 }}
    >
      <td style={{ ...cell, maxWidth: 340 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            aria-hidden
            style={{
              flex: '0 0 40px',
              height: 40,
              borderRadius: 10,
              background: COLORS.primarySoft,
              color: COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiFileText size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              title={page.title}
              style={{
                fontWeight: 600,
                fontSize: 15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {page.title}
            </div>
            <div style={{ ...clamp2, color: COLORS.muted, fontSize: 13, marginTop: 2 }}>
              {page.description || <em>Chưa có mô tả</em>}
            </div>
          </div>
        </div>
      </td>
      <td style={cell}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <code
            style={{
              background: COLORS.bgSoft,
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 12.5,
              whiteSpace: 'nowrap',
            }}
          >
            {displaySlug(page.slug)}
          </code>
          <button
            type="button"
            style={iconBtnStyle}
            title="Sao chép đường dẫn"
            aria-label={`Sao chép đường dẫn ${displaySlug(page.slug)}`}
            onClick={() => onCopySlug(page)}
          >
            <FiCopy size={14} color={COLORS.muted} />
          </button>
        </div>
      </td>
      <td style={cell}>
        <StatusBadge status={page.status} />
      </td>
      <td style={cell}>
        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiUser size={14} color={COLORS.muted} />
          <span>{page.author.name}</span>
        </div>
        <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>
          {formatUpdatedAt(page.updatedAt)}
        </div>
      </td>
      <td style={{ ...cell, whiteSpace: 'nowrap', textAlign: 'right' }}>
        <button
          type="button"
          style={iconBtnStyle}
          title="Chỉnh sửa"
          aria-label={`Chỉnh sửa ${page.title}`}
          disabled={busy}
          onClick={() => onEdit(page)}
        >
          <FiEdit size={16} color={COLORS.muted} />
        </button>
        <button
          type="button"
          style={iconBtnStyle}
          title="Xem trước"
          aria-label={`Xem trước ${page.title}`}
          onClick={() => onPreview(page)}
        >
          <FiEye size={16} color={COLORS.muted} />
        </button>
        <button
          type="button"
          style={iconBtnStyle}
          title={published ? 'Gỡ xuất bản' : 'Xuất bản ngay'}
          aria-label={`${published ? 'Gỡ xuất bản' : 'Xuất bản'} ${page.title}`}
          disabled={busy}
          onClick={() => onToggleStatus(page)}
        >
          {published ? (
            <FiSlash size={16} color={COLORS.muted} />
          ) : (
            <FiUploadCloud size={16} color={COLORS.primary} />
          )}
        </button>
        <button
          type="button"
          style={{ ...iconBtnStyle, color: COLORS.danger }}
          title="Xóa trang"
          aria-label={`Xóa ${page.title}`}
          disabled={busy}
          onClick={() => onDelete(page)}
        >
          <FiTrash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default PageTableRow;
