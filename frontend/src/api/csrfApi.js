const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function getCsrfToken() {
  const response = await fetch(`${API_BASE}/api/auth/csrf/token`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  return data.csrfToken;
}
