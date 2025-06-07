const API_BASE_URL = 'http://localhost:8000';

// 토큰 관리 함수들
export const getToken = () => localStorage.getItem('access_token');
export const setToken = (token) => localStorage.setItem('access_token', token);
export const removeToken = () => localStorage.removeItem('access_token');
export const getCurrentUser = () => {
  const user = localStorage.getItem('current_user');
  return user ? JSON.parse(user) : null;
};
export const setCurrentUser = (user) => localStorage.setItem('current_user', JSON.stringify(user));
export const removeCurrentUser = () => localStorage.removeItem('current_user');

// API 호출 헬퍼 함수
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || 'API call failed');
  }
  
  return response.json();
};

// 인증 API
export const authAPI = {
  signup: (userData) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
};

// 테이블 API
export const tablesAPI = {
  getAll: () => apiCall('/tables'),
};

// 예약 API
export const reservationsAPI = {
  create: (reservationData) => apiCall('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservationData),
  }),
  
  getUserReservations: () => apiCall('/reservations'),
  
  cancel: (reservationId) => apiCall(`/reservations/${reservationId}`, {
    method: 'DELETE',
  }),
  
  getStatus: (date, timePeriod) => apiCall(`/reservations/status?date=${date}&time_period=${timePeriod}`),
};
