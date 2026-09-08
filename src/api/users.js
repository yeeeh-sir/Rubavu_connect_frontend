import api from './axios';

export const searchUsers = (query, page = 1, limit = 20) =>
  api.get('/users/search', { params: { q: query, page, limit } });

export const getUserProfile = (username) => api.get(`/users/${username}`);

export const updateProfile = (data) => api.put('/users/profile', data);

export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append('profile_image', file);
  return api.post('/users/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getUserPosts = (username, page = 1, limit = 12) =>
  api.get(`/users/${username}/posts`, { params: { page, limit } });

export const followUser = (userId) => api.post(`/follows/${userId}/follow`);
export const unfollowUser = (userId) => api.delete(`/follows/${userId}/follow`);

export const getFollowers = (userId, page = 1, limit = 20) =>
  api.get(`/follows/${userId}/followers`, { params: { page, limit } });

export const getFollowing = (userId, page = 1, limit = 20) =>
  api.get(`/follows/${userId}/following`, { params: { page, limit } });
