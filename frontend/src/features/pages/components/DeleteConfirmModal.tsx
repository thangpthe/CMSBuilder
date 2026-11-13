import React, { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
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
  deleteBtn: {
    flex: '1 1 140px',
    padding: '10px 18px',
    borderRadius: 10,
    border: 'none',
    background: '#DC2626',
    color: '#fff',
    fontSize: 14,
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
