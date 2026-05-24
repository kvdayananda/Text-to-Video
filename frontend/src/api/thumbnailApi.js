const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function generateThumbnail(payload) {
  const response = await fetch(`${API_BASE}/api/thumbnail/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}
