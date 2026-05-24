const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
import { getCsrfToken } from './csrfApi';

export async function getVideos() {
  const response = await fetch(`${API_BASE}/api/videos`);
  return response.json();
}

export async function getPlatforms() {
  const response = await fetch(`${API_BASE}/api/platforms`);
  return response.json();
}

export async function getPublishStatus() {
  const response = await fetch(`${API_BASE}/api/publish/status`);
  return response.json();
}

export async function publishVideo(payload) {
  const token = localStorage.getItem('vf_token');
  const csrfToken = await getCsrfToken();
  const headers = {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/api/publish`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
  });
  return response.json();
}
