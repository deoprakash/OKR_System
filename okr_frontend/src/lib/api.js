const baseUrl = import.meta.env.VITE_API_URL || 'https://okr-system-backend.onrender.com';

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

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
export const getEmployeeOKRs = (empCode) => request(`/api/performance/okrs/${encodeURIComponent(empCode)}`);
export const getOKRHierarchy = (level, okrCode) => request(`/api/performance/${encodeURIComponent(level)}/${encodeURIComponent(okrCode)}`);

export default { getEmployee, createEmployee, updateEmployee, deleteEmployee };
