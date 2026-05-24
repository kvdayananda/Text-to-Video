const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function generateAIVideo(payload) {
  const response = await fetch(`${API_BASE}/api/ai/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function generateAIImage(payload) {
  const response = await fetch(`${API_BASE}/api/ai/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function renderVideo(payload) {
  const response = await fetch(`${API_BASE}/api/video/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function getRenderStatus(taskId) {
  const response = await fetch(`${API_BASE}/api/video/status/${taskId}`);
  return response.json();
}
