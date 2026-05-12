import { get } from 'svelte/store';
import { auth } from './auth.js';
import { goto } from '$app/navigation';

export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_BASE) ||
  'http://100.125.72.24:8000';

class ApiError extends Error {
  constructor(status, detail) {
    super(typeof detail === 'string' ? detail : JSON.stringify(detail));
    this.status = status;
    this.detail = detail;
  }
}

/**
 * fetch wrapper that injects Bearer token and normalises errors.
 */
export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const state = get(auth);
  const opts = {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(state?.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...headers
    }
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);

  if (res.status === 401) {
    // token invalid/expired -> clear local state (no /auth/logout round-trip).
    auth.clear();
    if (typeof window !== 'undefined') goto('/login');
    throw new ApiError(401, 'Sesi berakhir, silakan login ulang.');
  }

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const detail = data?.detail ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, detail);
  }
  return data;
}

export { ApiError };
