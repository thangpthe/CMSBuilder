/**
 * Helpers dùng chung cho module Page Management.
 * - slugify: tạo slug từ tiêu đề tiếng Việt có dấu
 * - isValidSlug: kiểm tra định dạng slug URL
 * - formatRelativeTime: hiển thị thời gian tương đối ("14 phút trước")
 * - copyToClipboard: sao chép văn bản vào clipboard
 */

export const TITLE_MAX_LENGTH = 150;
export const SLUG_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 300;

/** "Giới thiệu doanh nghiệp" -> "gioi-thieu-doanh-nghiep" */
export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '');
}

/** Slug hợp lệ: chữ thường a-z, số, gạch nối đơn; hoặc "/" cho trang chủ. */
export function isValidSlug(slug: string): boolean {
  if (slug === '/') return true;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Chuẩn hoá slug người dùng nhập tay (bỏ "/" đầu, trừ trang chủ). */
export function normalizeSlugInput(slug: string): string {
  const trimmed = (slug || '').trim();
  if (trimmed === '/') return '/';
  return trimmed.replace(/^\/+/, '');
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  const hhmm = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (diffSec < 60) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400 && date.getDate() === now.getDate()) {
    return `${Math.floor(diffSec / 3600)} giờ trước`;
  }
  const days = Math.floor(diffSec / 86400);
  if (days <= 1) return `Hôm qua • ${hhmm}`;
  if (days < 30) return `${days} ngày trước • ${hhmm}`;
  return date.toLocaleDateString('vi-VN');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
