const BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ppai_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
  },
  properties: {
    list: (params) => request(`/properties?${new URLSearchParams(params)}`),
    get: (id) => request(`/properties/${id}`),
  },
  deals: {
    list: (params) => request(`/deals?${new URLSearchParams(params)}`),
    get: (id) => request(`/deals/${id}`),
  },
  investors: {
    list: () => request('/investors'),
  },
  matches: {
    list: () => request('/matches'),
  },
  fees: {
    list: () => request('/fees'),
  },
  ai: {
    analyse: (data) => request('/ai/analyse', { method: 'POST', body: JSON.stringify(data) }),
    match: (data) => request('/ai/match', { method: 'POST', body: JSON.stringify(data) }),
    summarise: (data) => request('/ai/summarise', { method: 'POST', body: JSON.stringify(data) }),
  },
  kpi: {
    get: () => request('/kpi'),
  },
  payments: {
    createIntent: (data) => request('/payments/create-intent', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request('/payments'),
  },
  subscription: {
    plans: () => request('/subscription/plans'),
    upgrade: (plan) => request('/subscription/upgrade', { method: 'POST', body: JSON.stringify({ plan }) }),
  },
};
