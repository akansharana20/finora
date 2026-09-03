import { handleMockApi } from './mockData';

export function isDemoMode(): boolean {
  const demoEnv = import.meta.env.VITE_DEMO_MODE;
  if (demoEnv === 'true' || demoEnv === '1') {
    return true;
  }
  try {
    const saved = localStorage.getItem('finora_user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u && (u.demo === true || u.demo === 'true')) {
        return true;
      }
    }
  } catch (e) {
    // Ignore parse error
  }
  return false;
}

function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.endsWith('/api')) {
      return trimmed;
    }
    return `${trimmed}/api`;
  }
  return 'http://localhost:4000/api';
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const activeFirmId = localStorage.getItem('finora_active_firm_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (activeFirmId) {
    headers['x-firm-id'] = activeFirmId;
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
  };

  if (isDemoMode()) {
    return handleMockApi(endpoint, mergedOptions);
  }

  const token = localStorage.getItem('finora_token');

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(`${baseUrl}${formattedEndpoint}`, {
      ...mergedOptions,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('finora_token');
        localStorage.removeItem('finora_user');
      }
      return {
        success: false,
        error: data.error || { message: data.message || 'API request failed' },
      };
    }

    return data;
  } catch (error: any) {
    console.error('API Fetch error:', error);
    const isNetworkError =
      error?.name === 'TypeError' ||
      error?.message?.toLowerCase().includes('failed to fetch') ||
      error?.message?.toLowerCase().includes('networkerror');

    return {
      success: false,
      error: {
        message: isNetworkError
          ? 'Unable to connect to Finora server. Please check that the API is running.'
          : error.message || 'Something went wrong. Please try again.',
      },
    };
  }
}
