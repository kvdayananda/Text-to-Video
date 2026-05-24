const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
import { getCsrfToken } from './csrfApi';

export async function runCopyrightScan(payload) {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`${API_BASE}/api/copyright/scan`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Copyright scan failed');
  }

  return response.json();
}
