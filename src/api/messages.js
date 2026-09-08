import api from './axios';

export const getConversations = () => api.get('/messages/conversations');

export const getMessages = (userId, page = 1, limit = 50) =>
  api.get(`/messages/${userId}`, { params: { page, limit } });

export const sendTextMessage = (receiverId, messageText) =>
  api.post('/messages', { receiver_id: receiverId, message_text: messageText, message_type: 'text' });

export const sendMediaMessage = (receiverId, file, type) => {
  const formData = new FormData();
  formData.append('media', file);
  formData.append('receiver_id', receiverId);
  formData.append('message_type', type || (file.type.startsWith('audio/') ? 'voice' : 'image'));
  return api.post('/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const markMessageRead = (messageId) => api.patch(`/messages/${messageId}/read`);
