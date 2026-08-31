const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const token = localStorage.getItem('finora_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
