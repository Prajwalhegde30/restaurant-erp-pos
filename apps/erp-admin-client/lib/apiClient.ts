/**
 * Unified API Client for the Admin Dashboard
 * Assumes a JWT is available (e.g. from localStorage or a wrapper hook).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

import { getToken, clearToken } from './auth';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Generate a Correlation ID for this request
  headers.set('X-Correlation-ID', crypto.randomUUID());

  // Handle Idempotency-Key for POST/PUT requests
  if (options.method === 'POST' || options.method === 'PUT') {
    if (!headers.has('Idempotency-Key')) {
      headers.set('Idempotency-Key', crypto.randomUUID());
    }
  }

  // Retrieve the JWT from cookies (or auth lib)
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error?.message || errorMsg;
    } catch {
      // JSON parse failed
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
