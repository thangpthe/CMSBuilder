// PagePagination – "Hiển thị x - y trên tổng số z trang" + page buttons.

import React from 'react';
import type { PaginationMeta } from '../types/page.types';
import { COLORS } from './PageTableRow';

export interface PagePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

/** Page numbers with ellipsis, e.g. [1, '…', 4, 5, 6, '…', 10]. */
export function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

const btn = (active: boolean, disabled?: boolean): React.CSSProperties => ({
  minWidth: 32,
  height: 32,
  borderRadius: 8,
  border: 'none',
  fontSize: 13,
  fontWeight: 600,
  cursor: disabled ? 'default' : 'pointer',
  background: active ? COLORS.primary : 'transparent',
  color: active ? '#fff' : disabled ? '#c7c9d1' : COLORS.text,
});

export const PagePagination: React.FC<PagePaginationProps> = ({
  pagination,
  onPageChange,
  disabled,
  compact,
}) => {
  const { page, limit, totalItems, totalPages } = pagination;
  if (totalItems === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalItems);
  const prevDisabled = disabled || page <= 1;
  const nextDisabled = disabled || page >= totalPages;

  return (
    <nav
      aria-label="Phân trang"
      data-testid="page-pagination"
      style={{
        display: 'flex',
        flexDirection: compact ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: compact ? '8px 0' : '12px 16px',
        fontSize: 14,
        color: COLORS.muted,
      }}
    >
      <span>
        Hiển thị <strong style={{ color: COLORS.text }}>{from} - {to}</strong> trên tổng số{' '}
        <strong style={{ color: COLORS.text }}>{totalItems}</strong> trang
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          type="button"
          aria-label="Trang trước"
          disabled={prevDisabled}
          onClick={() => onPageChange(page - 1)}
          style={btn(false, prevDisabled)}
        >
          ‹
        </button>
        {getPageNumbers(page, totalPages).map((n, i) =>
          n === '…' ? (
            <span key={`e${i}`} style={{ padding: '0 4px' }}>
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              aria-label={`Trang ${n}`}
              aria-current={n === page ? 'page' : undefined}
              disabled={disabled}
              onClick={() => n !== page && onPageChange(n)}
              style={btn(n === page, disabled && n !== page)}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Trang sau"
          disabled={nextDisabled}
          onClick={() => onPageChange(page + 1)}
          style={btn(false, nextDisabled)}
        >
          ›
        </button>
      </div>
    </nav>
  );
};

export default PagePagination;
