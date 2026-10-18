import { useCallback, useEffect, useState } from 'react';
import { getUnreadCount } from '../api/notifications';
import { getConversations } from '../api/messages';

const REFRESH_INTERVAL = 60000;

export default function useBadges(enabled = true) {
  const [badges, setBadges] = useState({ notifications: 0, messages: 0 });

  const refresh = useCallback(async () => {
    try {
      const [notifResponse, convResponse] = await Promise.all([getUnreadCount(), getConversations()]);
      const notificationCount = Number(notifResponse.data?.data?.count);
      const notifications = Number.isFinite(notificationCount) ? notificationCount : 0;
      const conversations = convResponse.data?.data?.conversations || [];
      const messages = conversations.reduce((total, conversation) => {
        const unreadCount = Number(conversation.unread_count);
        return total + (Number.isFinite(unreadCount) ? unreadCount : 0);
      }, 0);
      setBadges({ notifications, messages });
    } catch (error) {
      // Keep the last successfully fetched counts if a refresh fails.
      console.error('Failed to refresh navigation badges:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setBadges({ notifications: 0, messages: 0 });
      return undefined;
    }
    refresh();
    const intervalId = setInterval(refresh, REFRESH_INTERVAL);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, refresh]);

  return badges;
}
