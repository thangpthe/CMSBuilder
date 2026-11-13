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
        gap: 4,
        padding: 4,
        borderRadius: 12,
        background: compact ? 'transparent' : COLORS.bgSoft,
        overflowX: 'auto',
        flex: compact ? 1 : undefined,
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
              padding: '6px 12px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              whiteSpace: 'nowrap',
              background: active ? (compact ? COLORS.primary : '#fff') : compact ? '#fff' : 'transparent',
              color: active ? (compact ? '#fff' : COLORS.primary) : COLORS.text,
              boxShadow: active && !compact ? '0 1px 2px rgba(0,0,0,.08)' : undefined,
            }}
          >
            {t.label}
            {stats && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: 999,
                  background: active && compact ? 'rgba(255,255,255,.25)' : COLORS.primarySoft,
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
        gap: 8,
        background: compact ? '#fff' : COLORS.bgSoft,
        border: compact ? `1px solid ${COLORS.border}` : 'none',
        borderRadius: 10,
        padding: '8px 12px',
        flex: 1,
        minWidth: compact ? undefined : 260,
        maxWidth: compact ? undefined : 340,
      }}
    >
      <FiSearch size={16} color={COLORS.muted} aria-hidden />
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
          fontSize: 14,
          width: '100%',
        }}
      />
    </label>
  );

  const sortSelect = (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: COLORS.muted }}>
      <LuArrowUpDown size={15} color={COLORS.muted} aria-hidden />
      <select
        value={sort}
        aria-label="Sắp xếp"
        onChange={(e) => onSortChange(e.target.value as PageSort)}
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: '7px 8px',
          fontSize: 14,
          background: '#fff',
          cursor: 'pointer',
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
        color: '#fff',
        borderRadius: compact ? 12 : 10,
        padding: compact ? '12px 16px' : '9px 16px',
        fontSize: compact ? 16 : 14,
        fontWeight: 600,
        cursor: 'pointer',
        width: compact ? '100%' : undefined,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <FiPlus size={16} />
      <span>Tạo trang mới</span>
    </button>
  );

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {searchBox}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
        gap: 12,
        flexWrap: 'wrap',
        background: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: 10,
      }}
    >
      {tabs}
      <span style={{ flex: 1 }} />
      {searchBox}
      {sortSelect}
      {createBtn}
    </div>
  );
};

export default PageToolbar;
