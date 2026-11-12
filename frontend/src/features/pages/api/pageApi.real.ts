// Real API client for Page Management – talks to FastAPI backend (S1-T08 / S1-T10).
// Uses fetch only (no extra dependency). Enabled when USE_MOCK is false.

import {
  ApiError,
  CreatePageRequest,
  DeletePageResponse,
  IPageApi,
  PageFilterParams,
  PageListResponse,
  PageMutationResponse,
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

const API_BASE_URL = (readEnv('API_BASE_URL') ?? '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      ...init,
    });
  } catch {
    throw new ApiError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.', 0);
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

function toQuery(params: PageFilterParams = {}): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export const pageRealApi: IPageApi = {
  getPages(params) {
    return request<PageListResponse>(`/api/pages${toQuery(params)}`);
  },
  createPage(data: CreatePageRequest) {
    return request<PageMutationResponse>('/api/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updatePage(id: string, data: UpdatePageRequest) {
    return request<PageMutationResponse>(`/api/pages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deletePage(id: string) {
    return request<DeletePageResponse>(`/api/pages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
