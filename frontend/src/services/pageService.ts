import apiClient from './api';
import type { PageBlockDto } from './blockService';

export interface PageResponse {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  slug: string | null;
  status: 'draft' | 'published' | string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PageDetailResponse extends PageResponse {
  blocks: PageBlockDto[];
}

export interface PageListResponse {
  items: PageResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface PageCreatePayload {
  title: string;
  description?: string | null;
}

export interface PageUpdatePayload {
  title?: string;
  description?: string | null;
  slug?: string;
  status?: 'draft' | 'published';
}

export interface PageDeleteResponse {
  success: boolean;
  message: string;
}

export const pageService = {
  async getPages(skip = 0, limit = 20): Promise<PageListResponse> {
    const response = await apiClient.get<PageListResponse>('/api/pages', {
      params: { skip, limit },
    });
    return response.data;
  },

  async getPageById(pageId: number | string): Promise<PageDetailResponse> {
    const response = await apiClient.get<PageDetailResponse>(`/api/pages/${pageId}`);
    return response.data;
  },

  async createPage(data: PageCreatePayload): Promise<PageResponse> {
    const response = await apiClient.post<PageResponse>('/api/pages', data);
    return response.data;
  },

  async updatePage(pageId: number | string, data: PageUpdatePayload): Promise<PageResponse> {
    const response = await apiClient.put<PageResponse>(`/api/pages/${pageId}`, data);
    return response.data;
  },

  async deletePage(pageId: number | string): Promise<PageDeleteResponse> {
    const response = await apiClient.delete<PageDeleteResponse>(`/api/pages/${pageId}`);
    return response.data;
  },

  async publishPage(pageId: number | string): Promise<PageResponse> {
    const response = await apiClient.post<PageResponse>(`/api/pages/${pageId}/publish`);
    return response.data;
  },

  async unpublishPage(pageId: number | string): Promise<PageResponse> {
    const response = await apiClient.post<PageResponse>(`/api/pages/${pageId}/unpublish`);
    return response.data;
  },
};

export default pageService;
