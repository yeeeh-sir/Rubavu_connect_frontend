import api from './axios';

export const getOverview = () => api.get('/admin/overview');

export const listUsers = (params = {}) => api.get('/admin/users', { params });
export const getUserDetail = (id) => api.get(`/admin/users/${id}`);
export const updateUserStatus = (id, is_active, reason) =>
  api.patch(`/admin/users/${id}/status`, { is_active, reason });
export const updateUserVerification = (id, is_verified) =>
  api.patch(`/admin/users/${id}/verify`, { is_verified });
export const updateUserEmail = (id, email) =>
  api.patch(`/admin/users/${id}/email`, { email });

export const listPosts = (params = {}) => api.get('/admin/posts', { params });
export const hidePost = (id, reason) => api.patch(`/admin/posts/${id}/hide`, { reason });
export const restorePost = (id) => api.patch(`/admin/posts/${id}/restore`);
export const adminDeletePost = (id) => api.delete(`/admin/posts/${id}`);

export const listComments = (params = {}) => api.get('/admin/comments', { params });
export const adminDeleteComment = (id) => api.delete(`/admin/comments/${id}`);

export const listStatuses = (params = {}) => api.get('/admin/statuses', { params });
export const adminDeleteStatus = (id) => api.delete(`/admin/statuses/${id}`);

export const listMedia = (params = {}) => api.get('/admin/media', { params });

export const listReports = (params = {}) => api.get('/admin/reports', { params });
export const getReportDetail = (type, id) => api.get(`/admin/reports/${type}/${id}`);
export const updateReportStatus = (type, id, status, note) =>
  api.patch(`/admin/reports/${type}/${id}/status`, { status, note });
export const assignReport = (type, id, assignee_id) =>
  api.post(`/admin/reports/${type}/${id}/assign`, { assignee_id });
export const addReportNote = (type, id, note) =>
  api.post(`/admin/reports/${type}/${id}/notes`, { note });

export const getAnalytics = (params = {}) => api.get('/admin/analytics', { params });
export const exportAnalyticsCsv = async (report, params = {}) => {
  const res = await api.get('/admin/analytics/export', {
    params: { report, ...params },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rubavu-${report}-${params.from || 'all'}-to-${params.to || 'now'}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const getAdminSettings = () => api.get('/admin/settings');
export const updateAdminSettings = (settings) => api.put('/admin/settings', settings);

export const getAuditLogs = (params = {}) => api.get('/admin/audit', { params });
export const getRoles = () => api.get('/admin/roles');
export const getNotificationsOverview = () => api.get('/admin/notifications');
export const listConnections = (params = {}) => api.get('/admin/connections', { params });
export const adminRemoveConnection = (id) => api.delete(`/admin/connections/${id}`);
export const listBlocks = (params = {}) => api.get('/admin/safety/blocks', { params });
export const adminRemoveBlock = (id) => api.delete(`/admin/safety/blocks/${id}`);
export const listLiveSessions = (params = {}) => api.get('/admin/live', { params });
export const adminEndLive = (id) => api.post(`/admin/live/${id}/end`);
export const getConversation = (userIdA, userIdB) =>
  api.get(`/admin/messages/${userIdA}/${userIdB}`);
