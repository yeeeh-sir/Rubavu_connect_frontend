import api from './axios';

export const getNotifications = (page = 1, limit = 20) =>
  api.get('/notifications', { params: { page, limit } });

export const getUnreadCount = () => api.get('/notifications/unread');

export const markNotificationsRead = () => api.patch('/notifications/read');