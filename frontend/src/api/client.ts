import type { ApiResponse } from '@/types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000';

export const TOKEN_KEY = 'tw_auth_token';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { ApiError };

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  signal?: AbortSignal,
): Promise<{ success: boolean; data: T; error?: { code: string; message: string } }> {
  const url = `${BASE_URL}/api${path}`;
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let body: ApiResponse<T> & { success: boolean };
  try {
    body = (await response.json()) as ApiResponse<T> & { success: boolean };
  } catch {
    throw new ApiError(response.status, 'PARSE_ERROR', 'Invalid JSON response from server');
  }

  if (!body.success) {
    const err = (body as unknown as { error: { code: string; message: string } }).error;
    throw new ApiError(response.status, err?.code ?? 'UNKNOWN', err?.message ?? 'An error occurred');
  }

  return body;
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  ) as [string, string | number | boolean][];
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined | null>, signal?: AbortSignal) =>
    request<T>(`${path}${params ? buildQuery(params) : ''}`, { method: 'GET' }, signal),

  post: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, signal),

  patch: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, signal),

  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { method: 'DELETE' }, signal),
};
