import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, isDemoMode } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'USER';
  firmId: string;
  firmName?: string;
  firm?: {
    id: string;
    name: string;
    companyNumber?: string;
    vatNumber?: string;
  };
  demo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('finora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('finora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      if (isDemoMode()) {
        const saved = localStorage.getItem('finora_user');
        if (saved) {
          try {
            const u = JSON.parse(saved);
            setUser({ ...u, demo: true });
          } catch (e) {
            setUser(null);
          }
        }
        setIsLoading(false);
        return;
      }

      apiFetch('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            const u = res.data;
            const fullUser = { ...u, firmName: u.firm?.name, demo: false };
            setUser(fullUser);
            localStorage.setItem('finora_user', JSON.stringify(fullUser));
          } else {
            logout();
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      const { user: loggedUser, token: authToken } = res.data;
      const fullUser = { ...loggedUser, demo: isDemoMode() || loggedUser.demo };
      setUser(fullUser);
      setToken(authToken);
      localStorage.setItem('finora_token', authToken);
      localStorage.setItem('finora_user', JSON.stringify(fullUser));
      return { success: true };
    }

    return { success: false, message: res.error?.message || 'Login failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('finora_token');
    localStorage.removeItem('finora_user');
    sessionStorage.removeItem('finora_token');
    sessionStorage.removeItem('finora_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isDemo: isDemoMode() || !!user?.demo,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
