const DEFAULT_BASE_URL = 'http://localhost:4000/api';

const getEnv = (key: string): string | undefined => {
  const meta = (typeof import.meta !== 'undefined' ? import.meta : {}) as any;
  const viteEnv = meta.env as Record<string, string | undefined> | undefined;
  return viteEnv?.[key] ?? process.env[key];
};

const getBaseUrl = () =>
  getEnv('NUXT_PUBLIC_API_URL') ??
  getEnv('VITE_API_URL') ??
  getEnv('NEXT_PUBLIC_API_URL') ??
  DEFAULT_BASE_URL;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cafe_token') : null;

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}
