const BASE_URL = 'http://localhost:8080/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('driveguard_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      // Handle Spring Boot validation errors
      if (errorData.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (typeof errorData.errors === 'object') {
          errorMessage = Object.values(errorData.errors).join(', ');
        }
      }
    } catch (e) {
      errorMessage = await response.text() || response.statusText;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const api = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (data) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getDashboardSummary: () => apiCall('/dashboard/summary', {
    method: 'GET',
  }),
  getUserProfile: () => apiCall('/user/profile', {
    method: 'GET',
  }),
  updateUserProfile: (data) => apiCall('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getAlerts: () => apiCall('/alerts', {
    method: 'GET',
  }),
  getAlertById: (id) => apiCall(`/alerts/${id}`, {
    method: 'GET',
  }),
  getLiveMonitoring: () => apiCall('/monitoring/live', {
    method: 'GET',
  })
};
