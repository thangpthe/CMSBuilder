import apiClient from './api';
import type { PageDraft } from '../types/pageBuilder';

export interface PageResponse {
  id?: string;
  title: string;
  slug: string;
  description: string;
  blocks: unknown[];
  status: 'draft' | 'published';
  updated_at?: string;
}

export const pageService = {
  // Lấy chi tiết trang theo slug hoặc id
  async getPage(identifier: string): Promise<PageResponse> {
    const response = await apiClient.get<PageResponse>(`/api/pages/${identifier}`);
    return response.data;
  },

  // Lưu bản nháp trang
  async saveDraft(data: PageDraft): Promise<PageResponse> {
    const response = await apiClient.post<PageResponse>('/api/pages/draft', data);
    return response.data;
  },

  // Xuất bản trang
  async publishPage(data: PageDraft): Promise<PageResponse> {
    const response = await apiClient.post<PageResponse>('/api/pages/publish', data);
    return response.data;
  },
};

export default pageService;
