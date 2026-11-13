// PageManagementView – container for the Page Management screen (S1-T09).
// Wires usePages + list components (Worker 1) with PageFormModal / DeleteConfirmModal (Worker 2).

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiFileText,
  FiSearch,
} from 'react-icons/fi';
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

  const markBusy = (id: string, busy: boolean) =>
    setBusyIds((prev) => (busy ? [...prev, id] : prev.filter((x) => x !== id)));

  // Handlers
  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingPage(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (page: Page) => {
    setFormMode('edit');
    setEditingPage(page);
    setFormOpen(true);
  };

  const handleFormSuccess = (page: Page, message: string) => {
    setFormOpen(false);
    setEditingPage(null);
    list.refetch();
    showToast('success', formMode === 'create' ? 'Đã tạo trang mới' : 'Đã cập nhật trang', message || page.title);
  };

  const handleOpenDelete = (page: Page) => setDeletingPage(page);

  const handleConfirmDelete = async (pageId: string) => {
    setDeleteLoading(true);
    try {
      const res = await pageApi.deletePage(pageId);
      setDeletingPage(null);
      list.refetch();
      showToast('success', 'Đã xóa trang', res.message || 'Trang đã được xóa khỏi hệ thống.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa trang. Vui lòng thử lại.';
      showToast('error', 'Xóa thất bại', msg);
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (page: Page) => {
    const nextStatus = page.status === 'published' ? 'draft' : 'published';
    markBusy(page.id, true);
    try {
      const res = await pageApi.updatePage(page.id, { status: nextStatus });
      list.refetch();
      showToast(
        'success',
        nextStatus === 'published' ? 'Đã xuất bản' : 'Đã chuyển thành bản nháp',
        `Trang "${res.data.title}" ${nextStatus === 'published' ? 'đã được công khai' : 'đã chuyển về bản nháp'}.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đổi trạng thái trang.';
      showToast('error', 'Lỗi trạng thái', msg);
    } finally {
      markBusy(page.id, false);
    }
  };

  const handleCopySlug = async (page: Page) => {
    const url = displaySlug(page.slug);
    const ok = await copyText(url);
    if (ok) showToast('info', 'Đã sao chép đường dẫn', url);
    else showToast('error', 'Lỗi sao chép', 'Không thể sao chép vào bộ nhớ tạm.');
  };

  const handlePreview = (page: Page) => {
    if (onPreview) onPreview(page);
    else {
      const url = `/p${displaySlug(page.slug)}`;
      if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const rowActions = {
    onEdit: handleOpenEdit,
    onDelete: handleOpenDelete,
    onPreview: handlePreview,
    onToggleStatus: handleToggleStatus,
    onCopySlug: handleCopySlug,
  };

  const hasFilter = Boolean(list.search.trim()) || list.status !== 'all';
  const showInitialLoading = list.initialLoading && list.items.length === 0;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '16px 12px 64px' : '24px 24px 48px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: COLORS.text,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
          Danh sách trang
        </h1>
        <p style={{ margin: '4px 0 0', color: COLORS.muted, fontSize: isMobile ? 13 : 14 }}>
          Quản lý, chỉnh sửa, gỡ xuất bản và chia sẻ liên kết các trang nội dung.
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ marginBottom: 16 }}>
        <PageStatsCards stats={list.stats} loading={list.loading} compact={isMobile} />
      </div>

      {/* Toolbar */}
      <div style={{ marginBottom: 16 }}>
        <PageToolbar
          status={list.status}
          search={list.search}
          sort={list.sort}
          stats={list.stats}
          onStatusChange={list.setStatus}
          onSearchChange={list.setSearch}
          onSortChange={list.setSort}
          onCreate={handleOpenCreate}
          compact={isMobile}
        />
      </div>

      {/* Main content body: loading / error / empty / list */}
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
        {showInitialLoading && <LoadingSkeleton compact={isMobile} />}

        {!showInitialLoading && list.error && (
          <ErrorState message={list.error} onRetry={list.refetch} />
        )}

        {!showInitialLoading && !list.error && list.items.length === 0 && (
          hasFilter ? (
            <EmptyState
              icon={<FiSearch size={36} color={COLORS.muted} />}
              title="Không tìm thấy trang phù hợp"
              description="Thử đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái."
              actionLabel="Xóa bộ lọc"
              onAction={() => {
                list.setSearch('');
                list.setStatus('all');
              }}
            />
          ) : (
            <EmptyState
              icon={<FiFileText size={36} color={COLORS.muted} />}
              title="Chưa có trang nội dung nào"
              description="Hãy bắt đầu tạo trang đầu tiên để xuất bản nội dung của bạn."
              actionLabel="＋ Tạo trang mới"
              onAction={handleOpenCreate}
            />
          )
        )}

        {!showInitialLoading && !list.error && list.items.length > 0 && (
          <>
            {list.loading && <InlineRefreshBar />}
            {isMobile ? (
              <div style={{ padding: 12 }}>
                <PageCardListMobile
                  pages={list.items}
                  busyIds={busyIds}
                  refreshing={list.loading}
                  {...rowActions}
                />
              </div>
            ) : (
              <PageTable
                pages={list.items}
                busyIds={busyIds}
                refreshing={list.loading}
                {...rowActions}
              />
            )}
            <PagePagination
              pagination={list.pagination}
              onPageChange={list.setPage}
              disabled={list.loading}
              compact={isMobile}
            />
          </>
        )}
      </div>

      {/* Modals */}
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
        isOpen={Boolean(deletingPage)}
        page={deletingPage}
        isLoading={deleteLoading}
        onClose={() => !deleteLoading && setDeletingPage(null)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Toast */}
      {toast && <ToastView toast={toast} onClose={() => setToast(null)} mobile={isMobile} />}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Subviews: LoadingSkeleton, ErrorState, EmptyState, ToastView        */
/* ------------------------------------------------------------------ */

const centerBox: React.CSSProperties = {
  padding: '60px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
};

const actionBtn: React.CSSProperties = {
  marginTop: 6,
  border: 'none',
  background: COLORS.primary,
  color: '#fff',
  borderRadius: 10,
  padding: '9px 18px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const LoadingSkeleton: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div style={{ padding: compact ? 12 : 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        style={{
          height: compact ? 90 : 54,
          borderRadius: 10,
          background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    ))}
  </div>
);

const InlineRefreshBar: React.FC = () => (
  <div
    style={{
      height: 2,
      background: COLORS.primarySoft,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        height: '100%',
        width: '40%',
        background: COLORS.primary,
        animation: 'indeterminate 1.2s infinite ease-in-out',
      }}
    />
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div data-testid="page-list-error" style={centerBox}>
    <FiAlertCircle size={40} color={COLORS.danger} />
    <div style={{ fontWeight: 700, fontSize: 17, color: COLORS.danger }}>Không thể tải danh sách trang</div>
    <div style={{ color: COLORS.muted, fontSize: 14, maxWidth: 440 }}>{message}</div>
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
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => (
  <div data-testid="page-list-empty" style={centerBox}>
    <div>{icon}</div>
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
  const icon =
    toast.kind === 'success' ? (
      <FiCheckCircle size={18} color={color} />
    ) : toast.kind === 'error' ? (
      <FiAlertCircle size={18} color={color} />
    ) : (
      <FiInfo size={18} color={color} />
    );

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
      <span aria-hidden style={{ display: 'inline-flex', marginTop: 2 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{toast.title}</div>
        <div style={{ fontSize: 13, color: COLORS.muted, wordBreak: 'break-word' }}>{toast.message}</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: COLORS.muted, display: 'inline-flex' }}
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

export default PageManagementView;
