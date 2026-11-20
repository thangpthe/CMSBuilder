import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, logoutApi, type User } from '../services/authService';

export type { User };

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSystemAdmin: boolean;
  isPageAdmin: boolean;
  loginUser: (token: string, user?: User) => void;
  logoutUser: () => void;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('cms_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const logoutUser = useCallback(() => {
    const currentToken = localStorage.getItem('access_token') || token;
    logoutApi(currentToken);
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('cms_user');
  }, [token]);

  const loginUser = useCallback((newToken: string, newUser?: User) => {
    setToken(newToken);
    localStorage.setItem('access_token', newToken);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('cms_user', JSON.stringify(newUser));
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const currentToken = localStorage.getItem('access_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
      localStorage.setItem('cms_user', JSON.stringify(userData));
      return userData;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        logoutUser();
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logoutUser]);

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token, refreshUser]);

  const isSystemAdmin = user?.role === 'system_admin';
  const isPageAdmin = user?.role === 'page_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isSystemAdmin,
        isPageAdmin,
        loginUser,
        logoutUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
