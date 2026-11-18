export const APP_CONFIG = {
  APP_NAME: 'CMSBuilder',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  DEFAULT_PAGE_TITLE: 'Giới thiệu sản phẩm mới | CMSBuilder',
  DEFAULT_SLUG: 'gioi-thieu-san-pham-moi',
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    USER: 'cms_user',
    PAGE_DRAFT: 'cmsbuilder-page-draft',
  },
} as const;
