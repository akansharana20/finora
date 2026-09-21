import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'USER';
  membershipRole?: 'ADMIN' | 'ACCOUNTANT' | 'USER' | null;
  firmId?: string | null;
  firmName?: string;
  firm?: {
    id: string;
    name: string;
    companyNumber?: string;
    vatNumber?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeFirmId: string;
  activeFirmName: string;
  switchCompany: (firmId: string, firmName: string) => void;
  clearActiveCompany: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('finora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeFirmId, setActiveFirmId] = useState<string>(() => {
    return localStorage.getItem('finora_active_firm_id') || user?.firmId || '';
  });
  const [activeFirmName, setActiveFirmName] = useState<string>(() => {
    return localStorage.getItem('finora_active_firm_name') || user?.firmName || '';
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('finora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      apiFetch('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            const u = res.data;
            const firmName = u.firm?.name || u.firmName || '';
            const fullUser = { ...u, firmName };
            setUser(fullUser);
            if (!activeFirmId && fullUser.firmId) {
              setActiveFirmId(fullUser.firmId);
              setActiveFirmName(firmName);
              localStorage.setItem('finora_active_firm_id', fullUser.firmId);
              localStorage.setItem('finora_active_firm_name', firmName);
            }
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
      const firmName = loggedUser.firmName || loggedUser.firm?.name || '';
      const fullUser = { ...loggedUser, firmName };
      setUser(fullUser);
      setToken(authToken);
      setActiveFirmId(loggedUser.firmId || '');
      setActiveFirmName(firmName);
      localStorage.setItem('finora_token', authToken);
      localStorage.setItem('finora_user', JSON.stringify(fullUser));
      if (loggedUser.firmId) localStorage.setItem('finora_active_firm_id', loggedUser.firmId);
      localStorage.setItem('finora_active_firm_name', firmName);
      return { success: true };
    }

    return { success: false, message: res.error?.message || 'Login failed' };
  };

  const switchCompany = (firmId: string, firmName: string) => {
    setActiveFirmId(firmId);
    setActiveFirmName(firmName);
    localStorage.setItem('finora_active_firm_id', firmId);
    localStorage.setItem('finora_active_firm_name', firmName);

    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        firmId,
        firmName,
        firm: {
          id: firmId,
          name: firmName,
          companyNumber: user.firm?.companyNumber,
          vatNumber: user.firm?.vatNumber,
        },
      };
      setUser(updatedUser);
      localStorage.setItem('finora_user', JSON.stringify(updatedUser));
    }

    // Trigger storage event so listening components reload data cleanly
    window.dispatchEvent(new CustomEvent('finora_company_switched', { detail: { firmId, firmName } }));
  };

  const clearActiveCompany = () => {
    setActiveFirmId(''); setActiveFirmName('');
    localStorage.removeItem('finora_active_firm_id');
    localStorage.removeItem('finora_active_firm_name');
    window.dispatchEvent(new CustomEvent('finora_company_switched', { detail: { firmId: '', firmName: '' } }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('finora_token');
    localStorage.removeItem('finora_user');
    localStorage.removeItem('finora_active_firm_id');
    localStorage.removeItem('finora_active_firm_name');
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
        activeFirmId,
        activeFirmName,
        switchCompany,
        clearActiveCompany,
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
