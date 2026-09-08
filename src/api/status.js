import api from './axios';

export const getStatuses = () => api.get('/status');

export const createStatus = (file) => {
  const formData = new FormData();
  formData.append('media', file);
  return api.post('/status', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteStatus = (id) => api.delete(`/status/${id}`);
