import { io } from 'socket.io-client';
import { getApiOrigin } from '../config/api';

let socket = null;
let presenceSocket = null;

function getSocketUrl() {
  return getApiOrigin();
}

export function getSocket(token) {
  if (!socket) {
    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(token) {
  const s = getSocket(token);
  if (!s.connected) {
    s.auth = { token };
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function connectPresenceSocket(token) {
  if (presenceSocket) {
    presenceSocket.auth = { token };
    if (!presenceSocket.connected) presenceSocket.connect();
    return presenceSocket;
  }
  presenceSocket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return presenceSocket;
}

export function disconnectPresenceSocket() {
  if (presenceSocket) {
    presenceSocket.disconnect();
    presenceSocket = null;
  }
}