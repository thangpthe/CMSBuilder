import apiClient from './api';

export interface User {
  id: string | number;
  email?: string | null;
  username: string;
  role: string;
  name?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  user?: User;
}

export const login = async ({ identifier, password }: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', {
    identifier,
    password,
  });

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/auth/me');
  return response.data;
};

export const logoutApi = async (token?: string | null): Promise<void> => {
  try {
    const authToken = token || localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    await apiClient.post('/api/auth/logout', null, { headers });
  } catch {
    // Neu logout server fail, van xoa token client
  }
};


export function getDefaultRouteForRole(role?: string): string {
  switch (role) {
    case 'system_admin':
      return '/dashboard';
    case 'page_admin':
      return '/pages';
    default:
      return '/pages';
  }
}
