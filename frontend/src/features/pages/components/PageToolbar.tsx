// PageToolbar – status tabs, search, sort and "create page" button.

import React from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { LuArrowUpDown } from 'react-icons/lu';
import type { PageSort, PageStats, PageStatusFilter } from '../types/page.types';
import { COLORS } from './PageTableRow';

export interface PageToolbarProps {
  status: PageStatusFilter;
  search: string;
  sort: PageSort;
  stats: PageStats | null;
  onStatusChange: (status: PageStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: PageSort) => void;
  onCreate: () => void;
  compact?: boolean;
}

export const SORT_OPTIONS: { value: PageSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'title_asc', label: 'Tiêu đề A → Z' },
  { value: 'title_desc', label: 'Tiêu đề Z → A' },
];

const TABS: { value: PageStatusFilter; label: string; statKey: keyof PageStats }[] = [
  { value: 'all', label: 'Tất cả', statKey: 'totalPages' },
  { value: 'published', label: 'Đã xuất bản', statKey: 'publishedPages' },
  { value: 'draft', label: 'Bản nháp', statKey: 'draftPages' },
];

export const PageToolbar: React.FC<PageToolbarProps> = ({
  status,
  search,
  sort,
  stats,
  onStatusChange,
  onSearchChange,
  onSortChange,
  onCreate,
  compact,
}) => {
  const tabs = (
    <div
      role="tablist"
      aria-label="Lọc theo trạng thái"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.25rem',
        padding: '0.25rem',
        borderRadius: '0.75rem',
        background: compact ? 'transparent' : COLORS.bgSoft,
        flex: compact ? '1 1 100%' : '0 1 auto',
        minWidth: 0,
      }}
    >
      {TABS.map((t) => {
        const active = status === t.value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onStatusChange(t.value)}
            style={{
              border: 'none',
              cursor: 'pointer',
              minHeight: '2.75rem',
              minWidth: '2.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.625rem',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 500,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: active ? (compact ? COLORS.primary : COLORS.surface) : compact ? COLORS.surface : 'transparent',
              color: active ? (compact ? COLORS.surface : COLORS.primary) : COLORS.text,
              boxShadow: active && !compact ? 'var(--shadow-sm)' : undefined,
            }}
          >
            {t.label}
            {stats && (
              <span
                style={{
                  marginLeft: '0.375rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.0625rem 0.4375rem',
                  borderRadius: 999,
                  background: active && compact ? COLORS.surface : COLORS.primarySoft,
                  color: COLORS.primary,
                }}
              >
                {stats[t.statKey]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const searchBox = (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: compact ? COLORS.surface : COLORS.bgSoft,
        border: compact ? `1px solid ${COLORS.border}` : 'none',
        borderRadius: '0.625rem',
        padding: '0 0.75rem',
        minHeight: '2.75rem',
        flex: compact ? '0 0 auto' : '1 1 13rem',
        minWidth: 0,
        maxWidth: compact ? '100%' : '21.25rem',
        width: compact ? '100%' : undefined,
        boxSizing: 'border-box',
      }}
    >
      <FiSearch size={16} color={COLORS.muted} aria-hidden style={{ flexShrink: 0 }} />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm theo tiêu đề hoặc slug..."
        aria-label="Tìm kiếm trang"
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: COLORS.text,
          fontSize: '0.875rem',
          minHeight: '2.75rem',
          width: '100%',
          minWidth: 0,
        }}
      />
    </label>
  );

  const sortSelect = (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: '0.875rem',
        color: COLORS.muted,
        flex: compact ? '1 1 auto' : '0 0 auto',
        minWidth: 0,
      }}
    >
      <LuArrowUpDown size={15} color={COLORS.muted} aria-hidden style={{ flexShrink: 0 }} />
      <select
        value={sort}
        aria-label="Sắp xếp"
        onChange={(e) => onSortChange(e.target.value as PageSort)}
        style={{
          border: `1px solid ${COLORS.borderStrong}`,
          borderRadius: '0.5rem',
          minHeight: '2.75rem',
          padding: '0.5rem 0.625rem',
          fontSize: '0.875rem',
          color: COLORS.text,
          background: COLORS.surface,
          cursor: 'pointer',
          width: compact ? '100%' : undefined,
          maxWidth: '100%',
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  const createBtn = (
    <button
      type="button"
      onClick={onCreate}
      data-testid="create-page-btn"
      style={{
        border: 'none',
        background: COLORS.primary,
        color: COLORS.surface,
        borderRadius: compact ? '0.75rem' : '0.625rem',
        minHeight: '2.75rem',
        minWidth: '2.75rem',
        padding: compact ? '0.75rem 1rem' : '0.625rem 1rem',
        fontSize: compact ? '1rem' : '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        width: compact ? '100%' : undefined,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.375rem',
      }}
    >
      <FiPlus size={16} />
      <span>Tạo trang mới</span>
    </button>
  );

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {searchBox}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          {tabs}
          {sortSelect}
        </div>
        {createBtn}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap',
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '0.875rem',
        padding: '0.625rem',
      }}
    >
      {tabs}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', flex: '1 1 22rem', justifyContent: 'flex-end', minWidth: 0 }}>
        {searchBox}
        {sortSelect}
        {createBtn}
      </div>
    </div>
  );
};

export default PageToolbar;
