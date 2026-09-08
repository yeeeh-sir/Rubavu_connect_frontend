import api from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const googleLogin = (secret) =>
  api.post('/auth/google', { credential: secret });
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
