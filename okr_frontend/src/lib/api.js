const deployedBaseUrl = 'https://okr-backend-bbbbfyckfmcrdfbj.canadacentral-01.azurewebsites.net';
// const deployedBaseUrl = 'https://okr-system-backend.onrender.com';
const localBaseUrl = 'http://localhost:5000';
const isPackagedElectron = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
const baseUrl = import.meta.env.VITE_API_URL || (isPackagedElectron ? deployedBaseUrl : (import.meta.env.DEV ? localBaseUrl : deployedBaseUrl));

function getToken() {
  try {
    return localStorage.getItem('authToken') || '';
  } catch {
    return '';
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeader },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    const failedChannels = parsed?.delivery?.failedChannels || parsed?.data?.failedChannels;
    const failedText = Array.isArray(failedChannels) && failedChannels.length
      ? ` (${failedChannels.map((f) => `${f.channel}: ${f.error}`).join(' | ')})`
      : '';

    const message = parsed?.error || parsed?.message || text || res.statusText;
    throw new Error(`${message}${failedText}`.trim());
  }
  return res.json();
}

export const requestOtp = (email) => request('/api/auth/request-otp', {
  method: 'POST',
  body: JSON.stringify({ email: String(email || '').trim() })
});

export const verifyOtp = (email, otp) => request('/api/auth/verify-otp', {
  method: 'POST',
  body: JSON.stringify({ email: String(email || '').trim(), otp: String(otp || '') })
});

export const login = (identifier, password) => request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ identifier: String(identifier || '').trim(), password: String(password || '') })
});

export const changePasswordApi = (oldPassword, newPassword) => request('/api/auth/change-password', {
  method: 'POST',
  body: JSON.stringify({ oldPassword: String(oldPassword || ''), newPassword: String(newPassword || '') })
});

export const forgotPassword = (identifier) => request('/api/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ identifier: String(identifier || '').trim() })
});

export const resetPassword = (token, newPassword) => request('/api/auth/reset-password', {
  method: 'POST',
  body: JSON.stringify({ token: String(token || '').trim(), newPassword: String(newPassword || '') })
});

export const getMe = () => request('/api/auth/me');
export const logoutApi = () => request('/api/auth/logout', { method: 'POST' });

export const getEmployee = (id) => request(`/api/employees/${encodeURIComponent(id)}`);
export const createEmployee = (payload) => request(`/api/employees`, { method: 'POST', body: JSON.stringify(payload) });
export const updateEmployee = (id, payload) => request(`/api/employees/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteEmployee = (id) => request(`/api/employees/${encodeURIComponent(id)}`, { method: 'DELETE' });

// lists
export const listEmployees = () => request(`/api/employees`);
export const listLevel1OKRs = () => request(`/api/level1`);
export const listLevel2OKRs = () => request(`/api/level2`);

export const listLevel3OKRs = () => request(`/api/level3`);

export const listLevel4OKRs = () => request(`/api/level4`);
export const listLevel5OKRs = () => request(`/api/level5`);

// Level2 OKR CRUD
export const createLevel2OKR = (payload) => request(`/api/level2`, { method: 'POST', body: JSON.stringify(payload) });
export const updateLevel2OKR = (id, payload) => request(`/api/level2/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });

// Level1 OKR CRUD
export const createLevel1OKR = (payload) => request(`/api/level1`, { method: 'POST', body: JSON.stringify(payload) });
export const updateLevel1OKR = (id, payload) => request(`/api/level1/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });

// Level3 OKR CRUD
export const createLevel3OKR = (payload) => request(`/api/level3`, { method: 'POST', body: JSON.stringify(payload) });
export const updateLevel3OKR = (id, payload) => request(`/api/level3/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });

// Level4 OKR CRUD
export const createLevel4OKR = (payload) => request(`/api/level4`, { method: 'POST', body: JSON.stringify(payload) });
export const updateLevel4OKR = (id, payload) => request(`/api/level4/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });

// Level5 OKR CRUD
export const createLevel5OKR = (payload) => request(`/api/level5`, { method: 'POST', body: JSON.stringify(payload) });
export const updateLevel5OKR = (id, payload) => request(`/api/level5/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });

// Level6 OKR CRUD
export const listLevel6OKRs = () => request(`/api/level6`);
export const createLevel6OKR = (payload) => request(`/api/level6`, { method: 'POST', body: JSON.stringify(payload) });
export const updateLevel6OKR = (id, payload) => request(`/api/level6/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });

// Level7 OKR CRUD
export const listLevel7OKRs = () => request(`/api/level7`);
export const createLevel7OKR = (payload) => request(`/api/level7`, { method: 'POST', body: JSON.stringify(payload) });
export const updateLevel7OKR = (id, payload) => request(`/api/level7/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });

// Performance
export const getEmployeeOKRs = (userId) => request(`/api/performance/okrs/${encodeURIComponent(userId)}`);
export const getOKRHierarchy = (level, okrCode) => request(`/api/performance/${encodeURIComponent(level)}/${encodeURIComponent(okrCode)}`);

export default { getEmployee, createEmployee, updateEmployee, deleteEmployee };

export const getSetupStatus = () => request('/api/setup');

export const getAnalyticsEmployees = () =>
  request("/api/analytics/employees");

export const searchAnalytics = (userId, year) =>
  request(
    `/api/analytics/search?userId=${encodeURIComponent(
      userId
    )}&year=${encodeURIComponent(year)}`
  );

  export const getLevel1OKR = (id) =>
    request(`/api/level1/${id}`);
  export const getLevel2OKR = (id) =>
    request(`/api/level2/${id}`);

export const getLevel3OKR = (id) =>
    request(`/api/level3/${id}`);

export const getLevel4OKR = (id) =>
    request(`/api/level4/${id}`);

export const getLevel5OKR = (id) =>
    request(`/api/level5/${id}`);

export const getLevel6OKR = (id) =>
    request(`/api/level6/${id}`);