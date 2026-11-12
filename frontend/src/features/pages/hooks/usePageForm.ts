import { useCallback, useEffect, useRef, useState } from 'react';
import type { CreatePageRequest, Page, PageStatus } from '../types/page.types';
import { pageApi } from '../api/pageApi';
import {
  DESCRIPTION_MAX_LENGTH,
  SLUG_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  isValidSlug,
  normalizeSlugInput,
  slugify,
} from '../utils/pageHelpers';

export type PageFormMode = 'create' | 'edit';

export interface PageFormValues {
  title: string;
  slug: string;
  description: string;
  status: PageStatus;
}

export type PageFormErrors = Partial<Record<keyof PageFormValues | 'form', string>>;

export interface UsePageFormOptions {
  mode: PageFormMode;
  initialData?: Page | null;
  /** Gọi khi submit thành công (dữ liệu trang + thông báo từ API). */
  onSuccess?: (page: Page, message: string) => void;
}

const EMPTY_VALUES: PageFormValues = {
  title: '',
  slug: '',
  description: '',
  status: 'draft',
};

function toValues(page?: Page | null): PageFormValues {
  if (!page) return { ...EMPTY_VALUES };
  return {
    title: page.title ?? '',
    // Trang chủ có thể lưu slug "" (API chuẩn hoá "/" -> ""): hiển thị lại là "/".
    slug: page.slug ? page.slug : '/',
    description: page.description ?? '',
    status: page.status ?? 'draft',
  };
}

export function validatePageForm(values: PageFormValues): PageFormErrors {
  const errors: PageFormErrors = {};
  const title = values.title.trim();
  const slug = normalizeSlugInput(values.slug);
  const description = values.description.trim();

  if (!title) errors.title = 'Tiêu đề không được để trống.';
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `Tiêu đề tối đa ${TITLE_MAX_LENGTH} ký tự.`;

  if (!slug) errors.slug = 'Đường dẫn tĩnh (slug) không được để trống.';
  else if (slug.length > SLUG_MAX_LENGTH)
    errors.slug = `Slug tối đa ${SLUG_MAX_LENGTH} ký tự.`;
  else if (!isValidSlug(slug))
    errors.slug = 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối (vd: gioi-thieu).';

  if (!description) errors.description = 'Mô tả không được để trống.';
  else if (description.length > DESCRIPTION_MAX_LENGTH)
    errors.description = `Mô tả tối đa ${DESCRIPTION_MAX_LENGTH} ký tự.`;

  if (values.status !== 'draft' && values.status !== 'published')
    errors.status = 'Trạng thái không hợp lệ.';

  return errors;
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = String((err as { message?: unknown }).message || '');
    if (msg) return msg;
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

export function usePageForm({ mode, initialData, onSuccess }: UsePageFormOptions) {
  const [values, setValues] = useState<PageFormValues>(() => toValues(initialData));
  const [errors, setErrors] = useState<PageFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PageFormValues, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Khi tạo mới, slug tự sinh theo tiêu đề cho đến khi người dùng sửa slug thủ công.
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(
    (page?: Page | null) => {
      setValues(toValues(page));
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setSlugManuallyEdited(mode === 'edit');
    },
    [mode],
  );

  const setField = useCallback(
    <K extends keyof PageFormValues>(field: K, value: PageFormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        if (field === 'title' && !slugManuallyEdited) {
          next.slug = slugify(String(value));
        }
        return next;
      });
      if (field === 'slug') setSlugManuallyEdited(true);
      setErrors((prev) => {
        if (!prev[field] && !prev.form && !(field === 'title' && prev.slug)) return prev;
        const next = { ...prev };
        delete next[field];
        delete next.form;
        if (field === 'title' && !slugManuallyEdited) delete next.slug;
        return next;
      });
    },
    [slugManuallyEdited],
  );

  const handleBlur = useCallback(
    (field: keyof PageFormValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldError = validatePageForm(values)[field];
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldError) next[field] = fieldError;
        else delete next[field];
        return next;
      });
    },
    [values],
  );

  /** Gợi ý lại slug từ tiêu đề hiện tại (nút "Tạo từ tiêu đề"). */
  const regenerateSlug = useCallback(() => {
    setValues((prev) => ({ ...prev, slug: slugify(prev.title) }));
    setSlugManuallyEdited(false);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.slug;
      return next;
    });
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    if (isSubmitting) return false;
    const validation = validatePageForm(values);
    setTouched({ title: true, slug: true, description: true, status: true });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return false;
    }

    const payload: CreatePageRequest = {
      title: values.title.trim(),
      slug: normalizeSlugInput(values.slug),
      description: values.description.trim(),
      status: values.status,
    };

    setIsSubmitting(true);
    setErrors({});
    try {
      const res =
        mode === 'edit' && initialData
          ? await pageApi.updatePage(initialData.id, payload)
          : await pageApi.createPage(payload);
      if (!mountedRef.current) return true;
      setIsSubmitting(false);
      const fallbackMsg =
        mode === 'edit'
          ? 'Cập nhật trang thành công'
          : `Đã tạo trang mới thành công (${payload.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'})`;
      onSuccess?.(res.data, res.message || fallbackMsg);
      return true;
    } catch (err) {
      if (!mountedRef.current) return false;
      const message = getErrorMessage(err);
      const status = (err as { status?: number })?.status;
      if (status === 409 || /slug/i.test(message)) {
        setErrors({ slug: message });
      } else {
        setErrors({ form: message });
      }
      setIsSubmitting(false);
      return false;
    }
  }, [isSubmitting, values, mode, initialData, onSuccess]);

  const isDirty =
    JSON.stringify(values) !== JSON.stringify(toValues(mode === 'edit' ? initialData : null));

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    slugManuallyEdited,
    setField,
    handleBlur,
    regenerateSlug,
    submit,
    reset,
  };
}

export default usePageForm;
