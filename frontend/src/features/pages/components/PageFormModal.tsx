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
import { COLORS } from './PageTableRow';

export interface PageFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: Page | null;
  onClose: () => void;
  onSuccess: (page: Page, message: string) => void;
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
    zIndex: 1000,
  },
  dialog: {
    width: '100%',
    maxWidth: '35rem',
    maxHeight: 'calc(100dvh - 2rem)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: COLORS.surface,
    borderRadius: '1rem',
    boxShadow: 'var(--shadow-lg)',
    fontFamily: 'inherit',
    color: COLORS.text,
  },
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '1rem 1.25rem 0.75rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 700, color: COLORS.text },
  subtitle: { margin: '0.25rem 0 0', fontSize: '0.875rem', color: COLORS.muted },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    fontSize: '1.375rem',
    lineHeight: 1,
    cursor: 'pointer',
    color: COLORS.muted,
    minWidth: '2.75rem',
    minHeight: '2.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.5rem',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' },
  label: { fontSize: '0.875rem', fontWeight: 600, color: COLORS.text },
  required: { color: COLORS.danger, marginLeft: '0.125rem' },
  counter: { fontSize: '0.75rem', color: COLORS.muted },
  input: {
    width: '100%',
    minHeight: '2.75rem',
    boxSizing: 'border-box',
    padding: '0.625rem 0.75rem',
    fontSize: '0.875rem',
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '0.625rem',
    background: COLORS.bgSoft,
    outline: 'none',
    fontFamily: 'inherit',
  },
  slugWrap: { display: 'flex', alignItems: 'stretch', gap: '0.5rem', flexWrap: 'wrap' },
  slugPrefix: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '2.75rem',
    padding: '0 0.625rem',
    background: COLORS.primarySoft,
    color: COLORS.primary,
    borderRadius: '0.625rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  },
  linkBtn: {
    border: `1px solid ${COLORS.borderStrong}`,
    background: COLORS.surface,
    borderRadius: '0.625rem',
    minHeight: '2.75rem',
    padding: '0 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    color: COLORS.primary,
  },
  hint: { fontSize: '0.75rem', color: COLORS.muted, margin: 0 },
  error: { fontSize: '0.75rem', color: COLORS.danger, margin: 0 },
  formError: {
    background: COLORS.dangerSoft,
    color: COLORS.danger,
    border: `1px solid ${COLORS.danger}`,
    borderRadius: '0.625rem',
    padding: '0.625rem 0.75rem',
    fontSize: '0.875rem',
  },
  statusGroup: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  statusOption: {
    flex: '1 1 10rem',
    minHeight: '2.75rem',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.75rem',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '0.625rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  footer: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '0.75rem 1.25rem 1rem',
    borderTop: `1px solid ${COLORS.border}`,
    background: COLORS.surface,
    flexWrap: 'wrap',
  },
  secondaryBtn: {
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
  primaryBtn: {
    minHeight: '2.75rem',
    minWidth: '2.75rem',
    padding: '0.625rem 1.125rem',
    borderRadius: '0.625rem',
    border: 'none',
    background: COLORS.primary,
    color: COLORS.surface,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinner: {
    width: '0.875rem',
    height: '0.875rem',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: COLORS.surface,
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
    background: hasError ? COLORS.dangerSoft : COLORS.bgSoft,
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
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        >
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
                  style={{ ...inputStyle(!!errors.slug, isSubmitting), fontFamily: 'monospace', flex: '1 1 10rem', minWidth: 0 }}
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
                    { value: 'draft', label: 'Bản nháp', color: COLORS.draft, bg: COLORS.draftBg },
                    { value: 'published', label: 'Đã xuất bản', color: COLORS.published, bg: COLORS.publishedBg },
                  ] as const
                ).map((opt) => {
                  const checked = values.status === opt.value;
                  return (
                    <label
                      key={opt.value}
                      style={{
                        ...styles.statusOption,
                        borderColor: checked ? opt.color : COLORS.border,
                        background: checked ? opt.bg : COLORS.surface,
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
