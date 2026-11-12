import React, { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Page } from '../types/page.types';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  page: Page | null;
  onClose: () => void;
  onConfirmDelete: (pageId: string) => Promise<void>;
  isLoading?: boolean;
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17, 24, 39, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 1100,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
    padding: 24,
    color: '#111827',
    fontFamily: 'inherit',
    textAlign: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    margin: '0 auto 12px',
    borderRadius: '50%',
    background: '#FEE2E2',
    color: '#DC2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 700,
  },
  title: { margin: '0 0 8px', fontSize: 20, fontWeight: 700 },
  text: { margin: '0 0 8px', fontSize: 14, color: '#4B5563', lineHeight: 1.5 },
  pageName: {
    margin: '12px 0',
    padding: '10px 12px',
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    wordBreak: 'break-word',
  },
  slug: { display: 'block', marginTop: 4, fontFamily: 'monospace', fontWeight: 400, color: '#6B7280' },
  warning: { margin: '0 0 16px', fontSize: 13, color: '#B91C1C', fontWeight: 600 },
  error: {
    margin: '0 0 16px',
    padding: '8px 12px',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    borderRadius: 10,
    fontSize: 13,
  },
  actions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  cancelBtn: {
    flex: '1 1 140px',
    padding: '10px 18px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  dangerBtn: {
    flex: '1 1 140px',
    padding: '10px 18px',
    borderRadius: 10,
    border: 'none',
    background: '#DC2626',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'dc-spin 0.8s linear infinite',
  },
};

const SPINNER_KEYFRAMES = '@keyframes dc-spin { to { transform: rotate(360deg); } }';

/**
 * Hộp thoại xác nhận xóa trang. Chỉ gọi `onConfirmDelete(page.id)` khi người dùng
 * bấm "Xác nhận xóa" — việc gọi API xóa do container (PageManagementView) đảm nhận.
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  page,
  onClose,
  onConfirmDelete,
  isLoading = false,
}) => {
  const uid = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loading = isLoading || internalLoading;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setInternalLoading(false);
      // Focus nút Huỷ mặc định để tránh xóa nhầm khi nhấn Enter.
      const t = setTimeout(() => cancelRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isOpen, page?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !page) return null;

  const handleConfirm = async () => {
    if (loading) return;
    setError(null);
    setInternalLoading(true);
    try {
      await onConfirmDelete(page.id);
    } catch (err) {
      if (mountedRef.current) {
        const msg =
          err && typeof err === 'object' && 'message' in err && (err as Error).message
            ? (err as Error).message
            : 'Xóa trang thất bại. Vui lòng thử lại.';
        setError(msg);
      }
    } finally {
      if (mountedRef.current) setInternalLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div style={styles.overlay} onMouseDown={handleOverlayClick} data-testid="delete-confirm-modal">
      <style>{SPINNER_KEYFRAMES}</style>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        aria-describedby={`${uid}-desc`}
        style={styles.dialog}
      >
        <div style={styles.iconWrap} aria-hidden="true">
          !
        </div>
        <h2 id={`${uid}-title`} style={styles.title}>
          Xóa trang này?
        </h2>
        <p id={`${uid}-desc`} style={styles.text}>
          Bạn sắp xóa vĩnh viễn trang sau cùng toàn bộ nội dung của nó:
        </p>
        <div style={styles.pageName}>
          {page.title}
          <span style={styles.slug}>{page.slug === '/' ? '/' : `/${page.slug}`}</span>
        </div>
        <p style={styles.warning}>Hành động này không thể hoàn tác.</p>

        {error && (
          <div role="alert" style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            style={{ ...styles.cancelBtn, opacity: loading ? 0.6 : 1 }}
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            type="button"
            style={{
              ...styles.dangerBtn,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
            onClick={handleConfirm}
            disabled={loading}
            aria-busy={loading}
          >
            {loading && <span style={styles.spinner} aria-hidden="true" />}
            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
