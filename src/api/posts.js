import api from './axios';

export const getPosts = (page = 1, limit = 20) =>
  api.get('/posts', { params: { page, limit } });

export const getPost = (id) => api.get(`/posts/${id}`);

export const createPost = (files = [], caption, audience = 'public', collaboratorIds = []) => {
  const formData = new FormData();
  (Array.isArray(files) ? files : [files]).filter(Boolean).forEach((file) => {
    formData.append('media', file);
  });
  if (caption) {
    formData.append('caption', caption);
  }
  formData.append('audience', audience);
  formData.append('collaborator_ids', JSON.stringify(collaboratorIds));
  return api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletePost = (id) => api.delete(`/posts/${id}`);

export const likePost = (postId) => api.post(`/posts/${postId}/like`);
export const unlikePost = (postId) => api.delete(`/posts/${postId}/like`);
export const getPostLikes = (postId, page = 1, limit = 50) =>
  api.get(`/posts/${postId}/likes`, { params: { page, limit } });

export const getComments = (postId, page = 1, limit = 20) =>
  api.get(`/posts/${postId}/comments`, { params: { page, limit } });

export const createComment = (postId, { text = '', file = null, audioDuration = null } = {}) => {
  const formData = new FormData();
  if (text.trim()) formData.append('comment_text', text.trim());
  if (file) formData.append('media', file);
  if (audioDuration) formData.append('audio_duration', String(audioDuration));
  return api.post(`/posts/${postId}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);

export const updateCollaboratorStatus = (postId, action) =>
  api.patch(`/posts/${postId}/collaborators/status`, { action });

export const removeCollaborator = (postId, userId) =>
  api.delete(`/posts/${postId}/collaborators/${userId}`);

export const getPendingCollaborations = () => api.get('/posts/collaborations/pending');

export const reportPost = (postId, reason) =>
  api.post(`/reports/posts/${postId}`, { reason });