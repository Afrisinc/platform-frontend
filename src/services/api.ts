// Base API client — mocked for now, swap to real fetch/axios later
const API_BASE = "https://api.afrisinc.com/v1";

// Simulate network delay
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export async function apiGet<T>(endpoint: string): Promise<T> {
  await delay();
  // In production: return fetch(`${API_BASE}${endpoint}`).then(r => r.json())
  throw new Error(`No mock for GET ${endpoint}`);
}

export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  await delay();
  throw new Error(`No mock for POST ${endpoint}`);
}

export async function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  await delay();
  throw new Error(`No mock for PATCH ${endpoint}`);
}

export async function apiDelete(endpoint: string): Promise<void> {
  await delay();
  throw new Error(`No mock for DELETE ${endpoint}`);
}

export { API_BASE };
