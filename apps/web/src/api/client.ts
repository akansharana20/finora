import { handleMockApi } from './mockData';

export function isDemoMode(): boolean {
  const demoEnv = (import.meta as any).env?.VITE_DEMO_MODE;
  return demoEnv === 'true' || demoEnv === '1' || demoEnv === true;
}

function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
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
  if (isDemoMode()) {
    return handleMockApi(endpoint, options);
  }

  const token = localStorage.getItem('finora_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(`${baseUrl}${formattedEndpoint}`, {
      ...options,
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
