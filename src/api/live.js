import api from './axios';

export const getActiveLives = (page = 1, limit = 20) =>
  api.get('/live', { params: { page, limit } });

export const startLive = (data) => api.post('/live', data);

export const joinLive = (liveId) => api.post(`/live/${liveId}/join`);
export const leaveLive = (liveId) => api.post(`/live/${liveId}/leave`);
export const endLive = (liveId) => api.post(`/live/${liveId}/end`);

export const getLiveViewers = (liveId) => api.get(`/live/${liveId}/viewers`);
export const getLiveComments = (liveId, page = 1, limit = 50) =>
  api.get(`/live/${liveId}/comments`, { params: { page, limit } });

export const reportLive = (liveId, reason) =>
  api.post(`/reports/live/${liveId}`, { reason });