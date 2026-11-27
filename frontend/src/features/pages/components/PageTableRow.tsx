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
  FiLayout,
} from 'react-icons/fi';
import type { Page, PageStatus } from '../types/page.types';

/* ------------------------------------------------------------------ */
/* Shared helpers (also used by PageCardListMobile)                    */
/* ------------------------------------------------------------------ */

export const COLORS = {
  primary: 'var(--brand-primary)',
  primaryHover: 'var(--brand-primary-hover)',
  primarySoft: 'var(--brand-primary-subtle)',
  surface: 'var(--bg-surface)',
  page: 'var(--bg-page)',
  text: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  placeholder: 'var(--text-placeholder)',
  border: 'var(--border-subtle)',
  borderStrong: 'var(--border-strong)',
  bgSoft: 'var(--bg-subtle)',
  bgMuted: 'var(--bg-muted)',
  published: 'var(--status-published-text)',
  publishedBg: 'var(--status-published-bg)',
  draft: 'var(--status-draft-text)',
  draftBg: 'var(--status-draft-bg)',
  danger: 'var(--status-danger-text)',
  dangerSoft: 'var(--status-danger-bg)',
};

/** Chuẩn hoá slug lưu trữ: loại bỏ dấu "/" đầu và tiền tố "p/" nếu vô tình có. */
export function stripSlugPrefix(slug: string): string {
  return (slug ?? '').trim().replace(/^(?:\/+|p\/)+/i, '');
}

export function displaySlug(slug: string): string {
  const s = stripSlugPrefix(slug);
  return s ? `/p/${s}` : '/p';
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
        gap: '0.375rem',
        padding: '0.25rem 0.625rem',
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        color: published ? COLORS.published : COLORS.draft,
        background: published ? COLORS.publishedBg : COLORS.draftBg,
      }}
    >
      <span
        aria-hidden
        style={{
          width: '0.4375rem',
          height: '0.4375rem',
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
  onBuildContent?: (page: Page) => void;
}

export const iconBtnStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  minWidth: '2.75rem',
  minHeight: '2.75rem',
  padding: '0.5rem',
  borderRadius: '0.5rem',
  fontSize: '0.9375rem',
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
  padding: '0.75rem 0.5rem',
  borderTop: `1px solid ${COLORS.border}`,
  verticalAlign: 'middle',
  fontSize: '0.875rem',
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
  onBuildContent,
}) => {
  const [hover, setHover] = useState(false);
  const published = page.status === 'published';

  return (
    <tr
      data-testid="page-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? COLORS.bgSoft : COLORS.surface, opacity: busy ? 0.6 : 1 }}
    >
      <td style={{ ...cell, maxWidth: '16.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div
            aria-hidden
            style={{
              flex: '0 0 2.5rem',
              height: '2.5rem',
              borderRadius: '0.625rem',
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
                fontSize: '0.9375rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {page.title}
            </div>
            <div style={{ ...clamp2, color: COLORS.muted, fontSize: '0.8125rem', marginTop: '0.125rem' }}>
              {page.description || <em>Chưa có mô tả</em>}
            </div>
          </div>
        </div>
      </td>
      <td style={cell}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <code
            style={{
              background: COLORS.bgSoft,
              padding: '0.1875rem 0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.78125rem',
              whiteSpace: 'nowrap',
              maxWidth: '11rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
        {onBuildContent && (
          <button
            type="button"
            style={iconBtnStyle}
            title="Soạn nội dung"
            aria-label={`Soạn nội dung ${page.title}`}
            disabled={busy}
            onClick={() => onBuildContent(page)}
          >
            <FiLayout size={16} color={COLORS.primary} />
          </button>
        )}
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
