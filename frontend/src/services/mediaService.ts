import apiClient from './api';

export interface MediaUploadResponse {
  id: number;
  original_filename: string;
  stored_filename: string;
  url: string;
  mime_type: string;
  size_bytes: number;
}

export interface MediaResponse {
  id: number;
  original_filename: string;
  stored_filename: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface MediaListResponse {
  items: MediaResponse[];
  total: number;
  skip: number;
  limit: number;
}

export const mediaService = {
  async uploadImage(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<MediaUploadResponse>('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMediaList(skip = 0, limit = 20): Promise<MediaListResponse> {
    const response = await apiClient.get<MediaListResponse>('/api/media', {
      params: { skip, limit },
    });
    return response.data;
  },

  async getMediaById(mediaId: number): Promise<MediaResponse> {
    const response = await apiClient.get<MediaResponse>(`/api/media/${mediaId}`);
    return response.data;
  },
};

export default mediaService;
