function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.endsWith('/api')) {
      return trimmed;
    }
    return `${trimmed}/api`;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000/api';
    }

    return `${window.location.origin}/api`;
  }

  return 'http://localhost:4000/api';
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const activeFirmId = localStorage.getItem('finora_active_firm_id');

  // Collect client-side fraud prevention telemetry for HMRC Making Tax Digital compliance
  const tzOffset = -new Date().getTimezoneOffset();
  const tzSign = tzOffset >= 0 ? '+' : '-';
  const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const tzMins = String(Math.abs(tzOffset) % 60).padStart(2, '0');
  const clientTimezone = `UTC${tzSign}${tzHours}:${tzMins}`;

  const clientScreens = typeof window !== 'undefined' && window.screen
    ? `width=${window.screen.width}&height=${window.screen.height}&scaling-factor=${window.devicePixelRatio || 1}&colour-depth=${window.screen.colorDepth || 24}`
    : 'width=1920&height=1080&scaling-factor=1&colour-depth=24';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-client-user-agent': typeof navigator !== 'undefined' ? navigator.userAgent : 'Finora Web Client',
    'x-client-screens': clientScreens,
    'x-client-timezone': clientTimezone,
    'x-client-dnt': typeof navigator !== 'undefined' && (navigator as any).doNotTrack === '1' ? 'true' : 'false',
    ...(options.headers as Record<string, string>),
  };

  if (activeFirmId) {
    headers['x-firm-id'] = activeFirmId;
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
  };

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
      const isHmrcUpstream401 = endpoint.startsWith('/hmrc') || data.error?.message?.toLowerCase().includes('hmrc');
      if (res.status === 401 && !isHmrcUpstream401) {
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
