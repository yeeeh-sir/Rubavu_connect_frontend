import api from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const googleLogin = (idToken) =>
  api.post('/auth/google', { credential: idToken });
export const changePassword = (data) => api.post('/auth/change-password', data);
export const verifyAccount = (data) => api.post('/auth/verify-account', data);
export const deleteAccount = (data) => api.post('/auth/delete-account', data);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
