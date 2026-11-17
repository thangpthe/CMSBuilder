// Mock data for Page Management (S1-T09).
// Isolated on purpose: delete this file + the mock branch in pageApi.ts
// once the real FastAPI backend (S1-T08) is wired up.

import type { Page, PageAuthor } from '../types/page.types';

export const MOCK_STORAGE_KEY = 'cmsbuilder.mock.pages.v1';
export const MOCK_WEEKLY_VIEWS = 3420;

const AUTHORS: Record<string, PageAuthor> = {
  hoangNam: { id: 'u-001', name: 'Hoàng Nam' },
  phuongLinh: { id: 'u-002', name: 'Phương Linh' },
  doTuan: { id: 'u-003', name: 'Đỗ Tuấn' },
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

interface SeedPage extends Omit<Page, 'createdAt' | 'updatedAt'> {
  /** Milliseconds before "now" for updatedAt. */
  updatedAgo: number;
  /** Milliseconds before "now" for createdAt. */
  createdAgo: number;
}

const SEED: SeedPage[] = [
  {
    id: 'p-001',
    title: 'Trang chủ – Giới thiệu Doanh nghiệp',
    slug: '/',
    description: 'Trang giới thiệu tổng quan hệ thống, sứ mệnh và giá trị cốt lõi của doanh nghiệp.',
    status: 'published',
    author: AUTHORS.hoangNam,
    viewsCount: 1250,
    updatedAgo: 14 * MIN,
    createdAgo: 30 * DAY,
  },
  {
    id: 'p-002',
    title: 'Giải pháp Chuyển đổi số Toàn diện',
    slug: 'giai-phap-chuyen-doi-so',
    description: 'Hệ sinh thái công cụ hỗ trợ quy trình vận hành và chuyển đổi số cho doanh nghiệp.',
    status: 'published',
    author: AUTHORS.phuongLinh,
    viewsCount: 640,
    updatedAgo: 1 * DAY,
    createdAgo: 28 * DAY,
  },
  {
    id: 'p-003',
    title: 'Bảng giá & Gói dịch vụ 2025',
    slug: 'bang-gia-2025',
    description: 'So sánh các phân cấp dịch vụ và chi phí theo từng gói.',
    status: 'draft',
    author: AUTHORS.hoangNam,
    viewsCount: 0,
    updatedAgo: 2 * DAY,
    createdAgo: 26 * DAY,
  },
  {
    id: 'p-004',
    title: 'Nghiên cứu Điển hình: FinTech Asia',
    slug: 'case-study-fintech-asia',
    description: 'Hành trình tối ưu tỷ lệ chuyển đổi và trải nghiệm khách hàng cùng FinTech Asia.',
    status: 'published',
    author: AUTHORS.doTuan,
    viewsCount: 410,
    updatedAgo: 3 * DAY,
    createdAgo: 24 * DAY,
  },
  {
    id: 'p-005',
    title: 'Cơ hội Nghề nghiệp & Gia nhập Đội ngũ',
    slug: 'tuyen-dung-2025',
    description: 'Thông tin tuyển dụng các vị trí Senior, Junior và thực tập sinh.',
    status: 'draft',
    author: AUTHORS.phuongLinh,
    viewsCount: 0,
    updatedAgo: 5 * DAY,
    createdAgo: 22 * DAY,
  },
  {
    id: 'p-006',
    title: 'Về chúng tôi',
    slug: 've-chung-toi',
    description: 'Câu chuyện hình thành, đội ngũ lãnh đạo và văn hóa công ty.',
    status: 'published',
    author: AUTHORS.hoangNam,
    viewsCount: 320,
    updatedAgo: 6 * DAY,
    createdAgo: 20 * DAY,
  },
  {
    id: 'p-007',
    title: 'Liên hệ & Hỗ trợ khách hàng',
    slug: 'lien-he',
    description: 'Biểu mẫu liên hệ, địa chỉ văn phòng và kênh hỗ trợ 24/7.',
    status: 'published',
    author: AUTHORS.doTuan,
    viewsCount: 290,
    updatedAgo: 7 * DAY,
    createdAgo: 18 * DAY,
  },
  {
    id: 'p-008',
    title: 'Chính sách bảo mật',
    slug: 'chinh-sach-bao-mat',
    description: 'Thông tin chi tiết về chính sách bảo mật thông tin khách hàng.',
    status: 'published',
    author: AUTHORS.phuongLinh,
    viewsCount: 150,
    updatedAgo: 9 * DAY,
    createdAgo: 16 * DAY,
  },
  {
    id: 'p-009',
    title: 'Điều khoản sử dụng',
    slug: 'dieu-khoan-su-dung',
    description: 'Các điều khoản và điều kiện khi sử dụng dịch vụ.',
    status: 'published',
    author: AUTHORS.hoangNam,
    viewsCount: 120,
    updatedAgo: 10 * DAY,
    createdAgo: 14 * DAY,
  },
  {
    id: 'p-010',
    title: 'Blog: Xu hướng công nghệ 2025',
    slug: 'blog-xu-huong-cong-nghe-2025',
    description: 'Tổng hợp các xu hướng AI, cloud và bảo mật nổi bật trong năm.',
    status: 'draft',
    author: AUTHORS.doTuan,
    viewsCount: 0,
    updatedAgo: 11 * DAY,
    createdAgo: 12 * DAY,
  },
  {
    id: 'p-011',
    title: 'Câu hỏi thường gặp (FAQ)',
    slug: 'cau-hoi-thuong-gap',
    description: 'Giải đáp các thắc mắc phổ biến về sản phẩm và thanh toán.',
    status: 'published',
    author: AUTHORS.phuongLinh,
    viewsCount: 240,
    updatedAgo: 12 * DAY,
    createdAgo: 11 * DAY + 12 * HOUR,
  },
  {
    id: 'p-012',
    title: 'Sự kiện ra mắt sản phẩm mới',
    slug: 'su-kien-ra-mat',
    description: 'Landing page đăng ký tham dự sự kiện ra mắt sản phẩm.',
    status: 'draft',
    author: AUTHORS.hoangNam,
    viewsCount: 0,
    updatedAgo: 13 * DAY,
    createdAgo: 13 * DAY,
  },
];

/** Default mock author used when creating pages in mock mode. */
export const MOCK_CURRENT_USER: PageAuthor = AUTHORS.hoangNam;

/** Builds fresh seed pages with timestamps relative to `now`. */
export function buildMockPages(now: number = Date.now()): Page[] {
  return SEED.map(({ updatedAgo, createdAgo, ...rest }) => ({
    ...rest,
    author: { ...rest.author },
    createdAt: new Date(now - createdAgo).toISOString(),
    updatedAt: new Date(now - updatedAgo).toISOString(),
  }));
}
