import api from './axios';

export const getPrivacySettings = () => api.get('/privacy');

export const updatePrivacySettings = (data) => api.put('/privacy', data);