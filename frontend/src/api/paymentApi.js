const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function getHeaders() {
  const token = localStorage.getItem('vf_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function createStripeCheckout(payload) {
  const response = await fetch(`${API_BASE}/api/payments/checkout/stripe`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function createRazorpayOrder(payload) {
  const response = await fetch(`${API_BASE}/api/payments/checkout/razorpay`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function confirmPayment(payload) {
  const response = await fetch(`${API_BASE}/api/payments/confirm`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function cancelSubscription() {
  const response = await fetch(`${API_BASE}/api/payments/cancel`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return response.json();
}
