// Page Management – shared types (S1-T09)
// Contract follows analyst spec (board #6).

export type PageStatus = 'draft' | 'published';

export type PageStatusFilter = 'all' | PageStatus;

export type PageSort = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

export interface PageAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface Page {
  id: string;
  title: string; // max 150 chars
  slug: string; // unique, e.g. "giai-phap-chuyen-doi-so" ("" or "/" for home page)
  description: string;
  status: PageStatus;
  author: PageAuthor;
  viewsCount?: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface PageStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  weeklyViews: number;
}

export interface PageFilterParams {
  search?: string;
  status?: PageStatusFilter;
  sort?: PageSort;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PageListData {
  items: Page[];
  pagination: PaginationMeta;
  stats: PageStats;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type PageListResponse = ApiResponse<PageListData>;

export interface CreatePageRequest {
  title: string;
  slug: string;
  description: string;
  status: PageStatus;
}

export type UpdatePageRequest = Partial<CreatePageRequest>;

export type PageMutationResponse = ApiResponse<Page> & { message: string };

export interface DeletePageResponse {
  success: boolean;
  message: string;
}

/** Service interface – UI only talks to this, never fetches directly. */
export interface IPageApi {
  getPages(params?: PageFilterParams): Promise<PageListResponse>;
  createPage(data: CreatePageRequest): Promise<PageMutationResponse>;
  updatePage(id: string, data: UpdatePageRequest): Promise<PageMutationResponse>;
  deletePage(id: string): Promise<DeletePageResponse>;
}

/** Error thrown by every IPageApi implementation. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
