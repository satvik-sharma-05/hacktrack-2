import http from './http';

export const getMe = async () => {
  const { data } = await http.get('/auth/me');
  return data;
};

export const logoutApi = async () => {
  const { data } = await http.post('/auth/logout');
  return data;
};

// Frontend just redirects for OAuth
export const loginGoogleUrl = () => (import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000') + '/api/auth/google';
export const loginGithubUrl = () => (import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000') + '/api/auth/github';
