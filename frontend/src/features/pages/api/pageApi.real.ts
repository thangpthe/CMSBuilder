// Real API client for Page Management – talks to FastAPI backend (S1-T08 / S1-T10).
// Uses fetch only (no extra dependency). Enabled when USE_MOCK is false.

import { ApiError } from '../types/page.types';
import type {
  CreatePageRequest,
  DeletePageResponse,
  IPageApi,
  Page,
  PageFilterParams,
  PageListResponse,
  PageMutationResponse,
  PageSort,
  PageStatus,
  UpdatePageRequest,
} from '../types/page.types';

declare const process: { env?: Record<string, string | undefined> } | undefined;

function readEnv(name: string): string | undefined {
  try {
    // Vite
    const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    if (viteEnv && viteEnv[`VITE_${name}`] !== undefined) return viteEnv[`VITE_${name}`];
  } catch {
    /* not a Vite build */
  }
  try {
    // CRA / webpack
    if (typeof process !== 'undefined' && process?.env) {
      return process.env[`REACT_APP_${name}`];
    }
  } catch {
    /* no process.env */
  }
  return undefined;
}

export { readEnv };

const API_BASE_URL = (
  readEnv('API_URL') ||
  readEnv('API_BASE_URL') ||
  'http://127.0.0.1:8000'
).replace(/\/$/, '');

interface BackendPage {
  id: number | string;
  owner_id?: number;
  title: string;
  description?: string | null;
  slug?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

interface BackendPageListResponse {
  items: BackendPage[];
  total: number;
  skip: number;
  limit: number;
}

function mapBackendPage(bp: BackendPage): Page {
  const status: PageStatus = bp.status === 'published' ? 'published' : 'draft';
  return {
    id: String(bp.id),
    title: bp.title,
    slug: bp.slug ?? '',
    description: bp.description ?? '',
    status,
    author: {
      id: bp.owner_id != null ? String(bp.owner_id) : 'owner',
      name: bp.owner_id != null ? `User #${bp.owner_id}` : 'Admin',
    },
    createdAt: bp.created_at,
    updatedAt: bp.updated_at,
  };
}

function getAuthToken(): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null;
  } catch {
    return null;
  }
}

function handleUnauthorized(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('access_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  } catch {
    /* ignore storage/navigation errors */
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...headers,
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new ApiError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.', 0);
  }

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401);
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok || (body && body.success === false)) {
    const message =
      (body && (body.message || body.detail)) || `Yêu cầu thất bại (mã lỗi ${res.status}).`;
    throw new ApiError(typeof message === 'string' ? message : JSON.stringify(message), res.status);
  }
  return body as T;
}

function sortPages(pages: Page[], sort: PageSort = 'newest'): Page[] {
  const copy = [...pages];
  switch (sort) {
    case 'oldest':
      return copy.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    case 'title_asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    case 'title_desc':
      return copy.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
    case 'newest':
    default:
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export const pageRealApi: IPageApi = {
  async getPages(params: PageFilterParams = {}): Promise<PageListResponse> {
    const raw = await request<BackendPageListResponse>('/api/pages?skip=0&limit=100');
    const allPages = (raw.items ?? []).map(mapBackendPage);

    const stats = {
      totalPages: raw.total ?? allPages.length,
      publishedPages: allPages.filter((p) => p.status === 'published').length,
      draftPages: allPages.filter((p) => p.status === 'draft').length,
      weeklyViews: 0,
    };

    const status = params.status ?? 'all';
    const search = (params.search ?? '').trim().toLowerCase();
    const sort = params.sort ?? 'newest';
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 5);

    const filtered = allPages.filter((p) => {
      if (status !== 'all' && p.status !== status) return false;
      if (search) {
        const matchTitle = p.title.toLowerCase().includes(search);
        const matchSlug = p.slug.toLowerCase().includes(search);
        if (!matchTitle && !matchSlug) return false;
      }
      return true;
    });

    const sorted = sortPages(filtered, sort);
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const items = sorted.slice(start, start + limit);

    return {
      success: true,
      data: {
        items,
        pagination: {
          page: safePage,
          limit,
          totalItems,
          totalPages,
        },
        stats,
      },
    };
  },

  async createPage(data: CreatePageRequest): Promise<PageMutationResponse> {
    const cleanSlug = data.slug?.trim().replace(/^\/+|\/+$/g, '');
    let created = await request<BackendPage>('/api/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        ...(cleanSlug ? { slug: cleanSlug } : {}),
      }),
    });

    if (data.status === 'published') {
      created = await request<BackendPage>(
        `/api/pages/${encodeURIComponent(String(created.id))}/publish`,
        { method: 'POST' },
      );
    }

    return {
      success: true,
      data: mapBackendPage(created),
      message: 'Tạo trang mới thành công.',
    };
  },

  async updatePage(id: string, data: UpdatePageRequest): Promise<PageMutationResponse> {
    const hasMetadataChanges =
      data.title !== undefined || data.description !== undefined || data.slug !== undefined;

    if (!hasMetadataChanges && data.status === 'published') {
      const updated = await request<BackendPage>(
        `/api/pages/${encodeURIComponent(id)}/publish`,
        { method: 'POST' },
      );
      return {
        success: true,
        data: mapBackendPage(updated),
        message: 'Đã xuất bản trang thành công.',
      };
    }

    if (!hasMetadataChanges && data.status === 'draft') {
      const updated = await request<BackendPage>(
        `/api/pages/${encodeURIComponent(id)}/unpublish`,
        { method: 'POST' },
      );
      return {
        success: true,
        data: mapBackendPage(updated),
        message: 'Đã chuyển trang về bản nháp.',
      };
    }

    const updated = await request<BackendPage>(`/api/pages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      success: true,
      data: mapBackendPage(updated),
      message: 'Cập nhật trang thành công.',
    };
  },

  async deletePage(id: string): Promise<DeletePageResponse> {
    const res = await request<Partial<DeletePageResponse>>(
      `/api/pages/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
    return {
      success: res?.success ?? true,
      message: res?.message || 'Đã xóa trang thành công.',
    };
  },
};
