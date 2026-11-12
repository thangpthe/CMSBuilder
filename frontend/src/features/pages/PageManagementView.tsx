// PageManagementView – container for the Page Management screen (S1-T09).
// Wires usePages + list components (Worker 1) with PageFormModal / DeleteConfirmModal (Worker 2).

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { pageApi } from './api/pageApi';
import { usePages } from './hooks/usePages';
import type { Page } from './types/page.types';
import { PageStatsCards } from './components/PageStatsCards';
import { PageToolbar } from './components/PageToolbar';
import { PageTable } from './components/PageTable';
import { PageCardListMobile } from './components/PageCardListMobile';
import { PagePagination } from './components/PagePagination';
import { COLORS, copyText, displaySlug } from './components/PageTableRow';
import { PageFormModal } from './components/PageFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

const MOBILE_QUERY = '(max-width: 768px)';

function useIsMobile(): boolean {
  const get = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(MOBILE_QUERY).matches
      : false;
  const [isMobile, setIsMobile] = useState(get);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, []);
  return isMobile;
}

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message: string;
}

export interface PageManagementViewProps {
  /** Override preview behaviour (default: open public URL in a new tab). */
  onPreview?: (page: Page) => void;
}

export const PageManagementView: React.FC<PageManagementViewProps> = ({ onPreview }) => {
  const isMobile = useIsMobile();
  const list = usePages();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const [deletingPage, setDeletingPage] = useState<Page | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((kind: ToastKind, title: string, message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), kind, title, message });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  /* ---------------- actions ---------------- */

  const openCreate = () => {
    setFormMode('create');
    setEditingPage(null);
    setFormOpen(true);
  };

  const openEdit = (page: Page) => {
    setFormMode('edit');
    setEditingPage(page);
    setFormOpen(true);
  };

  const handleFormSuccess = (_page: Page, message: string) => {
    setFormOpen(false);
    setEditingPage(null);
    showToast('success', 'Thao tác thành công', message);
    list.refetch();
  };

  const handleConfirmDelete = async (pageId: string) => {
    setDeleteLoading(true);
    try {
      const res = await pageApi.deletePage(pageId);
      setDeletingPage(null);
      showToast('success', 'Thao tác thành công', res.message);
      await list.refetch();
    } finally {
      setDeleteLoading(false);
    }
    // Errors propagate so DeleteConfirmModal can display them.
  };

  const handleToggleStatus = async (page: Page) => {
    const nextStatus = page.status === 'published' ? 'draft' : 'published';
    setBusyIds((ids) => [...ids, page.id]);
    try {
      await pageApi.updatePage(page.id, { status: nextStatus });
      showToast(
        'success',
        'Thao tác thành công',
        nextStatus === 'published'
          ? `Đã xuất bản "${page.title}"`
          : `Đã gỡ xuất bản "${page.title}" (chuyển về Bản nháp)`,
      );
      await list.refetch();
    } catch (err) {
      showToast('error', 'Thao tác thất bại', err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setBusyIds((ids) => ids.filter((id) => id !== page.id));
    }
  };

  const handleCopySlug = async (page: Page) => {
    const path = displaySlug(page.slug);
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
    const ok = await copyText(url);
    if (ok) showToast('info', 'Đã sao chép', url);
    else showToast('error', 'Không thể sao chép', 'Trình duyệt không cho phép truy cập clipboard.');
  };

  const handlePreview = (page: Page) => {
    if (onPreview) return onPreview(page);
    if (typeof window !== 'undefined') {
      window.open(displaySlug(page.slug), '_blank', 'noopener,noreferrer');
    }
  };

  const rowActions = {
    onEdit: openEdit,
    onDelete: (p: Page) => setDeletingPage(p),
    onPreview: handlePreview,
    onToggleStatus: handleToggleStatus,
    onCopySlug: handleCopySlug,
  };

  /* ---------------- body states ---------------- */

  const hasFilter = list.search.trim() !== '' || list.status !== 'all';

  let body: React.ReactNode;
  if (list.initialLoading) {
    body = <LoadingState rows={isMobile ? 3 : 5} />;
  } else if (list.error && list.items.length === 0) {
    body = <ErrorState message={list.error} onRetry={list.refetch} />;
  } else if (!list.loading && list.items.length === 0) {
    body = hasFilter ? (
      <EmptyState
        icon="🔎"
        title="Không tìm thấy trang phù hợp"
        description="Thử từ khóa khác hoặc bỏ bộ lọc trạng thái."
        actionLabel="Xóa bộ lọc"
        onAction={() => {
          list.setSearch('');
          list.setStatus('all');
        }}
      />
    ) : (
      <EmptyState
        icon="📭"
        title="Chưa có trang nào"
        description="Bắt đầu bằng việc tạo trang nội dung đầu tiên của bạn."
        actionLabel="＋ Tạo trang mới"
        onAction={openCreate}
      />
    );
  } else {
    body = (
      <>
        {list.error && <InlineError message={list.error} onRetry={list.refetch} />}
        {isMobile ? (
          <PageCardListMobile
            pages={list.items}
            busyIds={busyIds}
            refreshing={list.loading}
            {...rowActions}
          />
        ) : (
          <PageTable pages={list.items} busyIds={busyIds} refreshing={list.loading} {...rowActions} />
        )}
        <PagePagination
          pagination={list.pagination}
          onPageChange={list.setPage}
          disabled={list.loading}
          compact={isMobile}
        />
      </>
    );
  }

  return (
    <div
      data-testid="page-management-view"
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        color: COLORS.text,
        padding: isMobile ? 16 : 24,
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 14 : 20,
        position: 'relative',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 32, fontWeight: 700 }}>
            {isMobile ? 'Quản lý Trang' : 'Danh sách trang'}
          </h1>
          <p style={{ margin: '4px 0 0', color: COLORS.muted, fontSize: isMobile ? 13 : 15 }}>
            Quản lý, chỉnh sửa, gỡ xuất bản và chia sẻ liên kết các trang nội dung.
          </p>
        </div>
        <button
          type="button"
          onClick={() => list.refetch()}
          disabled={list.loading}
          aria-label="Tải lại danh sách"
          title="Tải lại"
          style={{
            border: 'none',
            background: COLORS.primarySoft,
            color: COLORS.primary,
            borderRadius: '50%',
            width: 38,
            height: 38,
            cursor: list.loading ? 'default' : 'pointer',
            fontSize: 18,
            flex: '0 0 auto',
          }}
        >
          ↻
        </button>
      </header>

      <PageStatsCards stats={list.stats} loading={list.initialLoading} compact={isMobile} />

      <PageToolbar
        status={list.status}
        search={list.search}
        sort={list.sort}
        stats={list.stats}
        onStatusChange={list.setStatus}
        onSearchChange={list.setSearch}
        onSortChange={list.setSort}
        onCreate={openCreate}
        compact={isMobile}
      />

      <section
        aria-label="Danh sách trang"
        style={
          isMobile
            ? undefined
            : {
                background: '#fff',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                overflow: 'hidden',
              }
        }
      >
        {body}
      </section>

      {toast && <ToastView toast={toast} onClose={() => setToast(null)} mobile={isMobile} />}

      <PageFormModal
        isOpen={formOpen}
        mode={formMode}
        initialData={editingPage}
        onClose={() => {
          setFormOpen(false);
          setEditingPage(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <DeleteConfirmModal
        isOpen={deletingPage !== null}
        page={deletingPage}
        onClose={() => {
          if (!deleteLoading) setDeletingPage(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Local presentational states                                         */
/* ------------------------------------------------------------------ */

const LoadingState: React.FC<{ rows: number }> = ({ rows }) => (
  <div data-testid="page-list-loading" role="status" aria-live="polite" style={{ padding: 16 }}>
    <span style={{ position: 'absolute', left: -9999 }}>Đang tải danh sách trang...</span>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.bgSoft }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: '45%', borderRadius: 6, background: COLORS.bgSoft }} />
          <div style={{ height: 12, width: '70%', borderRadius: 6, background: COLORS.bgSoft, marginTop: 8 }} />
        </div>
      </div>
    ))}
  </div>
);

const centerBox: React.CSSProperties = {
  padding: '40px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  background: '#fff',
  borderRadius: 14,
};

const actionBtn: React.CSSProperties = {
  marginTop: 8,
  border: 'none',
  background: COLORS.primary,
  color: '#fff',
  borderRadius: 10,
  padding: '9px 16px',
  fontWeight: 600,
  cursor: 'pointer',
};

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div data-testid="page-list-error" role="alert" style={centerBox}>
    <div style={{ fontSize: 36 }}>⚠️</div>
    <div style={{ fontWeight: 700, fontSize: 17 }}>Không thể tải danh sách trang</div>
    <div style={{ color: COLORS.muted, fontSize: 14 }}>{message}</div>
    <button type="button" onClick={onRetry} style={actionBtn}>
      Thử lại
    </button>
  </div>
);

const InlineError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div
    role="alert"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      padding: '10px 16px',
      background: COLORS.dangerSoft,
      color: COLORS.danger,
      fontSize: 14,
    }}
  >
    <span>⚠️ {message}</span>
    <button
      type="button"
      onClick={onRetry}
      style={{ border: 'none', background: 'transparent', color: COLORS.danger, fontWeight: 700, cursor: 'pointer' }}
    >
      Thử lại
    </button>
  </div>
);

const EmptyState: React.FC<{
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => (
  <div data-testid="page-list-empty" style={centerBox}>
    <div style={{ fontSize: 36 }}>{icon}</div>
    <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
    <div style={{ color: COLORS.muted, fontSize: 14 }}>{description}</div>
    <button type="button" onClick={onAction} style={actionBtn}>
      {actionLabel}
    </button>
  </div>
);

const ToastView: React.FC<{ toast: Toast; onClose: () => void; mobile: boolean }> = ({
  toast,
  onClose,
  mobile,
}) => {
  const color =
    toast.kind === 'success' ? COLORS.published : toast.kind === 'error' ? COLORS.danger : COLORS.primary;
  const icon = toast.kind === 'success' ? '✅' : toast.kind === 'error' ? '⛔' : 'ℹ️';
  return (
    <div
      role={toast.kind === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      data-testid="page-toast"
      style={{
        position: 'fixed',
        top: mobile ? 12 : 24,
        right: mobile ? 12 : 24,
        left: mobile ? 12 : undefined,
        zIndex: 900,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        background: '#fff',
        borderRadius: 12,
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 10px 30px rgba(17,24,39,.15)',
        padding: '12px 14px',
        minWidth: mobile ? undefined : 320,
        maxWidth: 420,
      }}
    >
      <span aria-hidden style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{toast.title}</div>
        <div style={{ fontSize: 13, color: COLORS.muted, wordBreak: 'break-word' }}>{toast.message}</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: COLORS.muted }}
      >
        ✕
      </button>
    </div>
  );
};

export default PageManagementView;
