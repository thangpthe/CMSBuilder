import React, { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { Page } from '../types/page.types';
import { COLORS } from './PageTableRow';

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
    background: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1100,
  },
  dialog: {
    width: '100%',
    maxWidth: '27.5rem',
    maxHeight: 'calc(100dvh - 2rem)',
    overflowY: 'auto',
    boxSizing: 'border-box',
    background: COLORS.surface,
    borderRadius: '1rem',
    boxShadow: 'var(--shadow-lg)',
    padding: '1.5rem',
    color: COLORS.text,
    fontFamily: 'inherit',
    textAlign: 'center',
  },
  iconWrap: {
    width: '3.5rem',
    height: '3.5rem',
    margin: '0 auto 0.75rem',
    borderRadius: '50%',
    background: COLORS.dangerSoft,
    color: COLORS.danger,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: COLORS.text },
  text: { margin: '0 0 0.5rem', fontSize: '0.875rem', color: COLORS.textSecondary, lineHeight: 1.5 },
  pageName: {
    margin: '0.75rem 0',
    padding: '0.625rem 0.75rem',
    background: COLORS.bgSoft,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: COLORS.text,
    wordBreak: 'break-word',
  },
  slug: { display: 'block', marginTop: '0.25rem', fontFamily: 'monospace', fontWeight: 400, color: COLORS.muted },
  warning: { margin: '0 0 1rem', fontSize: '0.8125rem', color: COLORS.danger, fontWeight: 600 },
  error: {
    margin: '0 0 1rem',
    padding: '0.5rem 0.75rem',
    background: COLORS.dangerSoft,
    border: `1px solid ${COLORS.danger}`,
    color: COLORS.danger,
    borderRadius: '0.625rem',
    fontSize: '0.8125rem',
  },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' },
  cancelBtn: {
    flex: '1 1 8.75rem',
    minHeight: '2.75rem',
    minWidth: '2.75rem',
    padding: '0.625rem 1.125rem',
    borderRadius: '0.625rem',
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surface,
    color: COLORS.text,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteBtn: {
    flex: '1 1 8.75rem',
    minHeight: '2.75rem',
    minWidth: '2.75rem',
    padding: '0.625rem 1.125rem',
    borderRadius: '0.625rem',
    border: 'none',
    background: COLORS.danger,
    color: COLORS.surface,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  page,
  onClose,
  onConfirmDelete,
  isLoading: propLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  const titleId = useId();
  const descId = useId();

  const loading = propLoading || internalLoading;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setInternalLoading(false);
      const timer = setTimeout(() => cancelBtnRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, page?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !page) return null;

  const handleConfirm = async () => {
    setError(null);
    setInternalLoading(true);
    try {
      await onConfirmDelete(page.id);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'Không thể xóa trang. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        style={styles.dialog}
      >
        <div style={styles.iconWrap} aria-hidden="true">
          <FiAlertTriangle size={28} />
        </div>

        <h3 id={titleId} style={styles.title}>
          Xác nhận xóa trang?
        </h3>

        <p id={descId} style={styles.text}>
          Bạn có chắc chắn muốn xóa trang này không?
        </p>

        <div style={styles.pageName}>
          <span>{page.title}</span>
          <span style={styles.slug}>/{page.slug?.replace(/^\/+/, '')}</span>
        </div>

        <p style={styles.warning}>Hành động này không thể hoàn tác.</p>

        {error && (
          <div role="alert" style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.actions}>
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              ...styles.cancelBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              ...styles.deleteBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
