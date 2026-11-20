import apiClient from './api';

export type PageBlockType = 'text' | 'image' | 'video';

export interface PageBlockDto {
  id: number;
  page_id: number;
  type: PageBlockType | string;
  content: string | null;
  media_id: number | null;
  order_index: number;
  url?: string | null;
  original_filename?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at: string;
  updated_at: string;
}

export interface BlockCreatePayload {
  type?: PageBlockType;
  content?: string | null;
  media_id?: number | null;
  order_index?: number;
}

export interface BlockUpdatePayload {
  content?: string | null;
  media_id?: number | null;
  order_index?: number;
}

export interface BlockReorderResponse {
  success: boolean;
  message: string;
}

export interface BlockDeleteResponse {
  success: boolean;
  message: string;
}

export const blockService = {
  async getBlocks(pageId: number | string): Promise<PageBlockDto[]> {
    const response = await apiClient.get<PageBlockDto[]>(`/api/pages/${pageId}/blocks`);
    return response.data;
  },

  async createBlock(pageId: number | string, data: BlockCreatePayload): Promise<PageBlockDto> {
    const response = await apiClient.post<PageBlockDto>(`/api/pages/${pageId}/blocks`, data);
    return response.data;
  },

  async updateBlock(
    pageId: number | string,
    blockId: number | string,
    data: BlockUpdatePayload,
  ): Promise<PageBlockDto> {
    const response = await apiClient.put<PageBlockDto>(
      `/api/pages/${pageId}/blocks/${blockId}`,
      data,
    );
    return response.data;
  },

  async deleteBlock(
    pageId: number | string,
    blockId: number | string,
  ): Promise<BlockDeleteResponse> {
    const response = await apiClient.delete<BlockDeleteResponse>(
      `/api/pages/${pageId}/blocks/${blockId}`,
    );
    return response.data;
  },

  async reorderBlocks(
    pageId: number | string,
    blockIds: number[],
  ): Promise<BlockReorderResponse> {
    const response = await apiClient.put<BlockReorderResponse>(
      `/api/pages/${pageId}/blocks/reorder`,
      { block_ids: blockIds },
    );
    return response.data;
  },
};

export default blockService;
