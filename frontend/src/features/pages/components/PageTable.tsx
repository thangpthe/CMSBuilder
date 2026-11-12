// PageTable – desktop table view of pages.

import React from 'react';
import type { Page } from '../types/page.types';
import { COLORS, PageRowActions, PageTableRow } from './PageTableRow';

export interface PageTableProps extends PageRowActions {
  pages: Page[];
  /** Ids of rows with a pending mutation (dimmed + actions disabled). */
  busyIds?: string[];
  /** Dims the table while a refetch is in flight. */
  refreshing?: boolean;
}

const th: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.6,
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
  <div style={{ overflowX: 'auto', opacity: refreshing ? 0.55 : 1, transition: 'opacity .15s' }}>
    <table
      data-testid="page-table"
      aria-busy={refreshing || undefined}
      style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}
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
