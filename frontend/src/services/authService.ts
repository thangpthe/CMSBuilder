import apiClient from './api';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  user?: {
    id: string | number;
    email: string;
    username?: string;
  };
}

export const login = async ({ identifier, password }: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', {
    identifier,
    password,
  });

  return response.data;
};
