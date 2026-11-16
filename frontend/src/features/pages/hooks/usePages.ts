// usePages – list state for Page Management (search, filter, sort, pagination, stats).

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PAGE_LIMIT, pageApi } from '../api/pageApi';
import type {
  Page,
  PageSort,
  PageStats,
  PageStatusFilter,
  PaginationMeta,
} from '../types/page.types';

export interface UsePagesOptions {
  limit?: number;
  debounceMs?: number;
}

export interface UsePagesResult {
  items: Page[];
  stats: PageStats | null;
  pagination: PaginationMeta;
  /** True while any request is in flight. */
  loading: boolean;
  /** True only for the very first load (no data yet). */
  initialLoading: boolean;
  error: string | null;

  search: string;
  status: PageStatusFilter;
  sort: PageSort;
  page: number;

  setSearch: (value: string) => void;
  setStatus: (value: PageStatusFilter) => void;
  setSort: (value: PageSort) => void;
  setPage: (value: number) => void;
  refetch: () => Promise<void>;
}

const EMPTY_PAGINATION = (limit: number): PaginationMeta => ({
  page: 1,
  limit,
  totalItems: 0,
  totalPages: 1,
});

export function usePages(options: UsePagesOptions = {}): UsePagesResult {
  const limit = options.limit ?? DEFAULT_PAGE_LIMIT;
  const debounceMs = options.debounceMs ?? 300;

  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatusState] = useState<PageStatusFilter>('all');
  const [sort, setSortState] = useState<PageSort>('newest');
  const [page, setPageState] = useState(1);

  const [items, setItems] = useState<Page[]>([]);
  const [stats, setStats] = useState<PageStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION(limit));
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(t);
  }, [search, debounceMs]);

  const fetchPages = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await pageApi.getPages({
        search: debouncedSearch.trim() || undefined,
        status,
        sort,
        page,
        limit,
      });
      if (reqId !== requestIdRef.current) return; // stale response
      setItems(res.data.items);
      setStats(res.data.stats);
      setPagination(res.data.pagination);
      // Server may clamp the page (e.g. after deleting the last item on a page).
      if (res.data.pagination.page !== page) setPageState(res.data.pagination.page);
      setHasLoaded(true);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [debouncedSearch, status, sort, page, limit]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageState(1);
  }, []);
  const setStatus = useCallback((value: PageStatusFilter) => {
    setStatusState(value);
    setPageState(1);
  }, []);
  const setSort = useCallback((value: PageSort) => {
    setSortState(value);
    setPageState(1);
  }, []);
  const setPage = useCallback((value: number) => {
    setPageState(Math.max(1, value));
  }, []);

  return {
    items,
    stats,
    pagination,
    loading,
    initialLoading: loading && !hasLoaded,
    error,
    search,
    status,
    sort,
    page,
    setSearch,
    setStatus,
    setSort,
    setPage,
    refetch: fetchPages,
  };
}

export default usePages;
