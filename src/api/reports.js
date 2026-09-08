import api from './axios';

export const reportComment = (commentId, reason) =>
  api.post(`/reports/comments/${commentId}`, { reason });