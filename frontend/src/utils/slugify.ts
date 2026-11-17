/**
 * Chuyển đổi chuỗi tiếng Việt thành slug URL thân thiện với SEO
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    // Thay thế ký tự đ/Đ
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    // Tách các dấu thanh
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Thay thế ký tự đặc biệt, dấu câu, khoảng trắng bằng dấu gạch ngang
    .replace(/[^a-z0-9]+/g, '-')
    // Loại bỏ dấu gạch ngang thừa ở đầu và cuối
    .replace(/^-+|-+$/g, '');
}

/**
 * Kiểm tra xem một URL video có hợp lệ (YouTube, Vimeo hoặc URL video thông thường) hay không
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    );
  } catch {
    return false;
  }
}

/**
 * Lấy mã YouTube Video ID từ link YouTube bất kỳ
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
