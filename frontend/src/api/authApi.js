const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
import { getCsrfToken } from './csrfApi';

async function buildHeaders() {
  const csrfToken = await getCsrfToken();
  return {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  };
}

export async function register(payload) {
  const headers = await buildHeaders();
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function login(payload) {
  const headers = await buildHeaders();
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function me() {
  const token = localStorage.getItem('vf_token');
  if (!token) return null;
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}
