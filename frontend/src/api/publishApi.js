const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
import { getCsrfToken } from './csrfApi';

function buildAuthHeaders(token, csrfToken) {
  const headers = {};
  if (csrfToken) headers['x-csrf-token'] = csrfToken;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

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

export async function getScheduledPublishes() {
  const token = localStorage.getItem('vf_token');
  const response = await fetch(`${API_BASE}/api/publish/scheduled`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.json();
}

export async function publishVideo(payload) {
  const token = localStorage.getItem('vf_token');
  const csrfToken = await getCsrfToken();
  const headers = buildAuthHeaders(token, csrfToken);

  const response = await fetch(`${API_BASE}/api/publish`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function uploadVideo(file, title) {
  const token = localStorage.getItem('vf_token');
  const csrfToken = await getCsrfToken();
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);

  const response = await fetch(`${API_BASE}/api/publish/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: buildAuthHeaders(token, csrfToken),
    body: formData,
  });
  return response.json();
}
