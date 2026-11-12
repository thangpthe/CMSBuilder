import React, { useEffect, useId, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { Page } from '../types/page.types';
import { usePageForm } from '../hooks/usePageForm';
import type { PageFormValues } from '../hooks/usePageForm';
import {
  DESCRIPTION_MAX_LENGTH,
  SLUG_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from '../utils/pageHelpers';

export interface PageFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: Page | null;
  onClose: () => void;
  onSuccess: (page: Page, message: string) => void;
}

const COLORS = {
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  green: '#059669',
  greenBg: '#D1FAE5',
  amber: '#92400E',
  amberBg: '#FDE68A',
};

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17, 24, 39, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 1000,
  },
  dialog: {
    width: '100%',
    maxWidth: 560,
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
    fontFamily: 'inherit',
    color: COLORS.text,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px 12px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  title: { margin: 0, fontSize: 20, fontWeight: 700 },
  subtitle: { margin: '4px 0 0', fontSize: 14, color: COLORS.muted },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    fontSize: 22,
    lineHeight: 1,
    cursor: 'pointer',
    color: COLORS.muted,
    padding: 4,
  },
  body: { padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontSize: 14, fontWeight: 600 },
  required: { color: COLORS.danger, marginLeft: 2 },
  counter: { fontSize: 12, color: COLORS.muted },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    fontSize: 14,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    background: COLORS.inputBg,
    outline: 'none',
    fontFamily: 'inherit',
  },
  slugWrap: { display: 'flex', alignItems: 'stretch', gap: 8 },
  slugPrefix: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    background: '#EEF2FF',
    color: COLORS.primary,
    borderRadius: 10,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  linkBtn: {
    border: `1px solid ${COLORS.border}`,
    background: '#fff',
    borderRadius: 10,
    padding: '0 10px',
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    color: COLORS.primary,
  },
  hint: { fontSize: 12, color: COLORS.muted, margin: 0 },
  error: { fontSize: 12, color: COLORS.danger, margin: 0 },
  formError: {
    background: COLORS.dangerBg,
    color: COLORS.danger,
    border: `1px solid #FECACA`,
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
  },
  statusGroup: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  statusOption: {
    flex: '1 1 160px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    padding: '12px 24px 20px',
    borderTop: `1px solid ${COLORS.border}`,
    flexWrap: 'wrap',
  },
  secondaryBtn: {
    padding: '10px 18px',
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  primaryBtn: {
    padding: '10px 18px',
    borderRadius: 10,
    border: 'none',
    background: COLORS.primary,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  spinner: {
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pf-spin 0.8s linear infinite',
  },
};

const SPINNER_KEYFRAMES = '@keyframes pf-spin { to { transform: rotate(360deg); } }';

function inputStyle(hasError: boolean, disabled: boolean): CSSProperties {
  return {
    ...styles.input,
    borderColor: hasError ? COLORS.danger : COLORS.border,
    background: hasError ? COLORS.dangerBg : COLORS.inputBg,
    opacity: disabled ? 0.7 : 1,
  };
}

/** Form Modal dùng chung cho Tạo mới và Chỉnh sửa trang. */
export const PageFormModal: React.FC<PageFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSuccess,
}) => {
  const uid = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const {
    values,
    errors,
    isSubmitting,
    slugManuallyEdited,
    setField,
    handleBlur,
    regenerateSlug,
    submit,
    reset,
  } = usePageForm({ mode, initialData, onSuccess });

  // Reset form mỗi khi mở modal hoặc đổi trang cần sửa.
  useEffect(() => {
    if (isOpen) {
      reset(mode === 'edit' ? initialData : null);
      // focus tiêu đề sau khi render
      const t = setTimeout(() => titleRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialData?.id]);

  // Đóng bằng phím Escape (không cho đóng khi đang submit).
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const isEdit = mode === 'edit';
  const ids = {
    title: `${uid}-title`,
    slug: `${uid}-slug`,
    description: `${uid}-description`,
    heading: `${uid}-heading`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const onChange =
    (field: keyof PageFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(field, e.target.value as never);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  };

  return (
    <div style={styles.overlay} onMouseDown={handleOverlayClick} data-testid="page-form-modal">
      <style>{SPINNER_KEYFRAMES}</style>
      <div role="dialog" aria-modal="true" aria-labelledby={ids.heading} style={styles.dialog}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.header}>
            <div>
              <h2 id={ids.heading} style={styles.title}>
                {isEdit ? 'Chỉnh sửa trang' : 'Tạo trang mới'}
              </h2>
              <p style={styles.subtitle}>
                {isEdit
                  ? 'Cập nhật tiêu đề, đường dẫn tĩnh, mô tả và trạng thái của trang.'
                  : 'Nhập thông tin cơ bản. Bạn có thể soạn nội dung chi tiết sau.'}
              </p>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              style={styles.closeBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          <div style={styles.body}>
            {errors.form && (
              <div role="alert" style={styles.formError}>
                {errors.form}
              </div>
            )}

            {/* Tiêu đề */}
            <div style={styles.field}>
              <div style={styles.labelRow}>
                <label htmlFor={ids.title} style={styles.label}>
                  Tiêu đề trang<span style={styles.required}>*</span>
                </label>
                <span style={styles.counter}>
                  {values.title.length}/{TITLE_MAX_LENGTH}
                </span>
              </div>
              <input
                ref={titleRef}
                id={ids.title}
                type="text"
                value={values.title}
                onChange={onChange('title')}
                onBlur={() => handleBlur('title')}
                maxLength={TITLE_MAX_LENGTH + 20}
                placeholder="VD: Giới thiệu doanh nghiệp"
                disabled={isSubmitting}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? `${ids.title}-err` : undefined}
                style={inputStyle(!!errors.title, isSubmitting)}
              />
              {errors.title && (
                <p id={`${ids.title}-err`} style={styles.error}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Slug */}
            <div style={styles.field}>
              <div style={styles.labelRow}>
                <label htmlFor={ids.slug} style={styles.label}>
                  Đường dẫn tĩnh (slug)<span style={styles.required}>*</span>
                </label>
                <span style={styles.counter}>
                  {values.slug.length}/{SLUG_MAX_LENGTH}
                </span>
              </div>
              <div style={styles.slugWrap}>
                <span style={styles.slugPrefix}>/</span>
                <input
                  id={ids.slug}
                  type="text"
                  value={values.slug}
                  onChange={onChange('slug')}
                  onBlur={() => handleBlur('slug')}
                  placeholder="gioi-thieu-doanh-nghiep"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.slug}
                  aria-describedby={`${ids.slug}-hint`}
                  style={{ ...inputStyle(!!errors.slug, isSubmitting), fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  style={styles.linkBtn}
                  onClick={regenerateSlug}
                  disabled={isSubmitting || !values.title.trim()}
                  title="Tạo lại slug từ tiêu đề"
                >
                  Gợi ý từ tiêu đề
                </button>
              </div>
              {errors.slug ? (
                <p id={`${ids.slug}-hint`} style={styles.error}>
                  {errors.slug}
                </p>
              ) : (
                <p id={`${ids.slug}-hint`} style={styles.hint}>
                  {slugManuallyEdited
                    ? 'Slug do bạn nhập. Chỉ dùng chữ thường không dấu, số và dấu gạch nối.'
                    : 'Slug được gợi ý tự động theo tiêu đề.'}
                </p>
              )}
            </div>

            {/* Mô tả */}
            <div style={styles.field}>
              <div style={styles.labelRow}>
                <label htmlFor={ids.description} style={styles.label}>
                  Mô tả ngắn<span style={styles.required}>*</span>
                </label>
                <span
                  style={{
                    ...styles.counter,
                    color:
                      values.description.length > DESCRIPTION_MAX_LENGTH
                        ? COLORS.danger
                        : COLORS.muted,
                  }}
                >
                  {values.description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id={ids.description}
                rows={4}
                value={values.description}
                onChange={onChange('description')}
                onBlur={() => handleBlur('description')}
                placeholder="Mô tả ngắn gọn nội dung của trang..."
                disabled={isSubmitting}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? `${ids.description}-err` : undefined}
                style={{ ...inputStyle(!!errors.description, isSubmitting), resize: 'vertical' }}
              />
              {errors.description && (
                <p id={`${ids.description}-err`} style={styles.error}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Trạng thái */}
            <fieldset style={{ ...styles.field, border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ ...styles.label, marginBottom: 6 }}>Trạng thái</legend>
              <div style={styles.statusGroup} role="radiogroup">
                {(
                  [
                    { value: 'draft', label: 'Bản nháp', color: COLORS.amber, bg: COLORS.amberBg },
                    { value: 'published', label: 'Đã xuất bản', color: COLORS.green, bg: COLORS.greenBg },
                  ] as const
                ).map((opt) => {
                  const checked = values.status === opt.value;
                  return (
                    <label
                      key={opt.value}
                      style={{
                        ...styles.statusOption,
                        borderColor: checked ? opt.color : COLORS.border,
                        background: checked ? opt.bg : '#fff',
                        color: checked ? opt.color : COLORS.text,
                        fontWeight: checked ? 600 : 400,
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                    >
                      <input
                        type="radio"
                        name={`${uid}-status`}
                        value={opt.value}
                        checked={checked}
                        onChange={() => setField('status', opt.value)}
                        disabled={isSubmitting}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
              {errors.status && <p style={styles.error}>{errors.status}</p>}
            </fieldset>
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              style={{ ...styles.secondaryBtn, opacity: isSubmitting ? 0.6 : 1 }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              style={{
                ...styles.primaryBtn,
                opacity: isSubmitting ? 0.8 : 1,
                cursor: isSubmitting ? 'wait' : 'pointer',
              }}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting && <span style={styles.spinner} aria-hidden="true" />}
              {isSubmitting
                ? isEdit
                  ? 'Đang lưu...'
                  : 'Đang tạo...'
                : isEdit
                  ? 'Lưu thay đổi'
                  : 'Tạo trang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageFormModal;
