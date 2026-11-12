// Page API service (S1-T09).
// Components/hooks must ONLY use `pageApi` from this file – never fetch directly.
//
// Switching: mock data is used by default. Set REACT_APP_USE_MOCK=false
// (CRA) or VITE_USE_MOCK=false (Vite) to use the real FastAPI client.
// To remove mocks entirely after S1-T08: delete `mockPages.data.ts`, the
// `pageMockApi` block below, and export `pageRealApi` directly.

import {
  ApiError,
  CreatePageRequest,
  IPageApi,
  Page,
  PageFilterParams,
  PageStats,
  UpdatePageRequest,
} from '../types/page.types';
import { pageRealApi, readEnv } from './pageApi.real';
import {
  buildMockPages,
  MOCK_CURRENT_USER,
  MOCK_STORAGE_KEY,
  MOCK_WEEKLY_VIEWS,
} from './mockPages.data';

export const USE_MOCK = readEnv('USE_MOCK') !== 'false';

export const DEFAULT_PAGE_LIMIT = 5;

/* ------------------------------------------------------------------ */
/* Mock implementation (localStorage-backed so data survives reload)   */
/* ------------------------------------------------------------------ */

const MOCK_LATENCY_MS = 450;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let memoryStore: Page[] | null = null;

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

function loadPages(): Page[] {
  if (memoryStore) return memoryStore;
  if (hasStorage()) {
    try {
      const raw = window.localStorage.getItem(MOCK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryStore = parsed as Page[];
          return memoryStore;
        }
      }
    } catch {
      /* corrupted storage – reseed */
    }
  }
  memoryStore = buildMockPages();
  savePages(memoryStore);
  return memoryStore;
}

function savePages(pages: Page[]): void {
  memoryStore = pages;
  if (hasStorage()) {
    try {
      window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(pages));
    } catch {
      /* quota / private mode – keep in memory only */
    }
  }
}

/** Dev helper: restore the 12 seed pages. */
export function resetMockPages(): void {
  savePages(buildMockPages());
}

/** Dev helper: force the next mock call(s) to fail (to preview the error state). */
let mockFailNext = 0;
export function failNextMockRequests(count = 1): void {
  mockFailNext = count;
}

function maybeFail(): void {
  if (mockFailNext > 0) {
    mockFailNext -= 1;
    throw new ApiError('Không thể tải dữ liệu từ máy chủ (mô phỏng lỗi).', 500);
  }
}

const normalizeSlug = (slug: string) => slug.trim().replace(/^\/+|\/+$/g, '').toLowerCase();

function computeStats(pages: Page[]): PageStats {
  const published = pages.filter((p) => p.status === 'published').length;
  return {
    totalPages: pages.length,
    publishedPages: published,
    draftPages: pages.length - published,
    weeklyViews: MOCK_WEEKLY_VIEWS,
  };
}

function assertSlugFree(pages: Page[], slug: string, exceptId?: string): void {
  const n = normalizeSlug(slug);
  if (pages.some((p) => p.id !== exceptId && normalizeSlug(p.slug) === n)) {
    throw new ApiError('Đường dẫn tĩnh (slug) đã tồn tại. Vui lòng chọn slug khác.', 409);
  }
}

function validatePayload(data: Partial<CreatePageRequest>, partial: boolean): void {
  if (!partial || data.title !== undefined) {
    const title = (data.title ?? '').trim();
    if (!title) throw new ApiError('Tiêu đề trang không được để trống.', 400);
    if (title.length > 150) throw new ApiError('Tiêu đề trang tối đa 150 ký tự.', 400);
  }
  if (data.slug !== undefined) {
    const s = normalizeSlug(data.slug);
    if (s && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
      throw new ApiError('Slug không đúng định dạng URL (chỉ gồm a-z, 0-9 và dấu "-").', 400);
    }
  }
  if (data.status !== undefined && data.status !== 'draft' && data.status !== 'published') {
    throw new ApiError('Trạng thái không hợp lệ.', 400);
  }
}

function genId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const pageMockApi: IPageApi = {
  async getPages(params: PageFilterParams = {}) {
    await delay(MOCK_LATENCY_MS);
    maybeFail();

    const { search = '', status = 'all', sort = 'newest' } = params;
    const limit = Math.max(1, Number(params.limit) || DEFAULT_PAGE_LIMIT);
    const all = loadPages();

    const q = search.trim().toLowerCase();
    let items = all.filter((p) => {
      if (status !== 'all' && p.status !== status) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    });

    items = [...items].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.updatedAt.localeCompare(b.updatedAt);
        case 'title_asc':
          return a.title.localeCompare(b.title, 'vi');
        case 'title_desc':
          return b.title.localeCompare(a.title, 'vi');
        case 'newest':
        default:
          return b.updatedAt.localeCompare(a.updatedAt);
      }
    });

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
    const start = (page - 1) * limit;

    return {
      success: true,
      data: {
        items: items.slice(start, start + limit).map((p) => ({ ...p, author: { ...p.author } })),
        pagination: { page, limit, totalItems, totalPages },
        stats: computeStats(all),
      },
    };
  },

  async createPage(data: CreatePageRequest) {
    await delay(MOCK_LATENCY_MS);
    maybeFail();
    validatePayload(data, false);
    const pages = loadPages();
    assertSlugFree(pages, data.slug);

    const now = new Date().toISOString();
    const page: Page = {
      id: genId(),
      title: data.title.trim(),
      slug: normalizeSlug(data.slug),
      description: (data.description ?? '').trim(),
      status: data.status ?? 'draft',
      author: { ...MOCK_CURRENT_USER },
      viewsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    savePages([page, ...pages]);
    return {
      success: true,
      data: page,
      message:
        page.status === 'draft'
          ? 'Đã tạo trang mới thành công (Bản nháp)'
          : 'Đã tạo trang mới thành công (Đã xuất bản)',
    };
  },

  async updatePage(id: string, data: UpdatePageRequest) {
    await delay(MOCK_LATENCY_MS);
    maybeFail();
    const pages = loadPages();
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) throw new ApiError('Không tìm thấy trang', 404);
    validatePayload(data, true);
    if (data.slug !== undefined) assertSlugFree(pages, data.slug, id);

    const prev = pages[idx];
    const updated: Page = {
      ...prev,
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.slug !== undefined && { slug: normalizeSlug(data.slug) }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.status !== undefined && { status: data.status }),
      updatedAt: new Date().toISOString(),
    };
    const next = [...pages];
    next[idx] = updated;
    savePages(next);
    return { success: true, data: updated, message: 'Cập nhật trang thành công' };
  },

  async deletePage(id: string) {
    await delay(MOCK_LATENCY_MS);
    maybeFail();
    const pages = loadPages();
    if (!pages.some((p) => p.id === id)) throw new ApiError('Trang không tồn tại', 404);
    savePages(pages.filter((p) => p.id !== id));
    return { success: true, message: 'Đã xóa trang thành công' };
  },
};

/* ------------------------------------------------------------------ */

export const pageApi: IPageApi = USE_MOCK ? pageMockApi : pageRealApi;

export default pageApi;
