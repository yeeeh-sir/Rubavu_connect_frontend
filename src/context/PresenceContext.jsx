import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { connectPresenceSocket, disconnectPresenceSocket } from '../utils/socket';
import { useAuth } from './AuthContext';

const PresenceContext = createContext(null);

export function PresenceProvider({ children }) {
  const { user } = useAuth();
  const [onlineIds, setOnlineIds] = useState(() => new Set());
  const onlineRef = useRef(new Set());
  const heartbeatRef = useRef(null);

  const updateOnline = useCallback((ids) => {
    onlineRef.current = ids;
    setOnlineIds(new Set(ids));
  }, []);

  useEffect(() => {
    if (!user) {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      disconnectPresenceSocket();
      updateOnline(new Set());
      return;
    }

    const token = localStorage.getItem('token');
    const socket = connectPresenceSocket(token);

    const applyEvent = (payload) => {
      const next = new Set(onlineRef.current);
      if (payload && payload.user_id != null) {
        if (payload.online === false || payload.offline) {
          next.delete(Number(payload.user_id));
        } else {
          next.add(Number(payload.user_id));
        }
      }
      updateOnline(next);
    };

    socket.on('presence:online', applyEvent);
    socket.on('presence:offline', (payload) => applyEvent({ ...payload, offline: true }));

    const sendPing = () => {
      if (socket.connected) socket.emit('presence:ping');
    };
    socket.on('connect', sendPing);
    if (socket.connected) sendPing();

    heartbeatRef.current = setInterval(sendPing, 30000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      socket.off('presence:online');
      socket.off('presence:offline');
      socket.off('connect', sendPing);
      disconnectPresenceSocket();
      updateOnline(new Set());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isOnline = useCallback((userId) => onlineRef.current.has(Number(userId)), []);

  return (
    <PresenceContext.Provider value={{ isOnline, onlineCount: onlineIds.size }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within PresenceProvider');
  }
  return context;
}