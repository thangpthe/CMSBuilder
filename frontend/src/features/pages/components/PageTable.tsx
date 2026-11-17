// PageTable – desktop table view of pages.

import React from 'react';
import type { Page } from '../types/page.types';
import { COLORS, PageTableRow } from './PageTableRow';
import type { PageRowActions } from './PageTableRow';

export interface PageTableProps extends PageRowActions {
  pages: Page[];
  /** Ids of rows with a pending mutation (dimmed + actions disabled). */
  busyIds?: string[];
  /** Dims the table while a refetch is in flight. */
  refreshing?: boolean;
}

const th: React.CSSProperties = {
  padding: '0.75rem 0.5rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: COLORS.muted,
  background: COLORS.bgSoft,
  whiteSpace: 'nowrap',
};

export const PageTable: React.FC<PageTableProps> = ({
  pages,
  busyIds = [],
  refreshing,
  ...actions
}) => (
  <div style={{ overflowX: 'auto', maxWidth: '100%', opacity: refreshing ? 0.55 : 1, transition: 'opacity .15s' }}>
    <table
      data-testid="page-table"
      aria-busy={refreshing || undefined}
      style={{ width: '100%', borderCollapse: 'collapse' }}
    >
      <thead>
        <tr>
          <th style={th}>Trang &amp; mô tả</th>
          <th style={th}>Đường dẫn tĩnh (slug)</th>
          <th style={th}>Trạng thái</th>
          <th style={th}>Tác giả &amp; cập nhật</th>
          <th style={{ ...th, textAlign: 'right' }}>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {pages.map((p) => (
          <PageTableRow key={p.id} page={p} busy={busyIds.includes(p.id)} {...actions} />
        ))}
      </tbody>
    </table>
  </div>
);

export default PageTable;
