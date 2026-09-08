import api from './axios';

export const getConnections = (page = 1, limit = 20) =>
    api.get('/connections', { params: { page, limit } });

export const getConnectionRequests = (direction = 'received', page = 1, limit = 20) =>
    api.get('/connections/requests', { params: { direction, page, limit } });

export const getConnectionStatus = (userId) => api.get(`/connections/status/${userId}`);
export const sendConnectionRequest = (userId) => api.post(`/connections/requests/${userId}`);
export const acceptConnectionRequest = (requestId) => api.patch(`/connections/requests/${requestId}/accept`);
export const rejectConnectionRequest = (requestId) => api.patch(`/connections/requests/${requestId}/reject`);
export const cancelConnectionRequest = (requestId) => api.delete(`/connections/requests/${requestId}/cancel`);
export const removeConnection = (userId) => api.delete(`/connections/${userId}`);
