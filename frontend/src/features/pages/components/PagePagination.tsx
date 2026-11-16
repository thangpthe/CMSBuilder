// PagePagination – "Hiển thị x - y trên tổng số z trang" + page buttons.

import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  minWidth: '2.75rem',
  minHeight: '2.75rem',
  padding: '0 0.5rem',
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: disabled ? 'default' : 'pointer',
  background: active ? COLORS.primary : 'transparent',
  color: active ? COLORS.surface : disabled ? COLORS.placeholder : COLORS.text,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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
        gap: '0.625rem',
        padding: compact ? '0.5rem 0.75rem' : '0.75rem 1rem',
        fontSize: '0.875rem',
        color: COLORS.muted,
      }}
    >
      <span>
        Hiển thị <strong style={{ color: COLORS.text }}>{from} - {to}</strong> trên tổng số{' '}
        <strong style={{ color: COLORS.text }}>{totalItems}</strong> trang
      </span>
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          aria-label="Trang trước"
          disabled={prevDisabled}
          onClick={() => onPageChange(page - 1)}
          style={btn(false, prevDisabled)}
        >
          <FiChevronLeft size={16} />
        </button>
        {getPageNumbers(page, totalPages).map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={p}
              type="button"
              aria-current={p === page ? 'page' : undefined}
              disabled={disabled}
              onClick={() => onPageChange(p)}
              style={btn(p === page, disabled)}
            >
              {p}
            </button>
          ) : (
            <span
              key={`dots-${idx}`}
              style={{
                width: 24,
                textAlign: 'center',
                color: COLORS.muted,
                userSelect: 'none',
              }}
            >
              …
            </span>
          )
        )}
        <button
          type="button"
          aria-label="Trang sau"
          disabled={nextDisabled}
          onClick={() => onPageChange(page + 1)}
          style={btn(false, nextDisabled)}
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export default PagePagination;
