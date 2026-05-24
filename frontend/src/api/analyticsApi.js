const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function getHeaders() {
  const token = localStorage.getItem('vf_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function getOverview(platform = 'all', range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/overview?platform=${platform}&range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getViewsTimeseries(platform = 'all', range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/views-timeseries?platform=${platform}&range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getPlatformBreakdown(range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/platforms?range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getTopVideos(platform = 'all', range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/top-videos?platform=${platform}&range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getCTRBreakdown(range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/ctr?range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getEngagementBreakdown(range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/engagement?range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getWatchTimeBreakdown(range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/watch-time?range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getAudienceDemographics(range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/audience?range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getEngagementTimeseries(range = '30d') {
  const response = await fetch(`${API_BASE}/api/analytics/engagement-timeseries?range=${range}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export async function getPeakHours() {
  const response = await fetch(`${API_BASE}/api/analytics/peak-hours`, {
    headers: getHeaders(),
  });
  return response.json();
}

export function getExportCSVURL(platform = 'all', range = '30d') {
  return `${API_BASE}/api/analytics/export/csv?platform=${platform}&range=${range}`;
}
