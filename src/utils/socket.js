import { io } from 'socket.io-client';

let socket = null;
let presenceSocket = null;

export function getSocket(token) {
  if (!socket) {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(url, {
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
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  presenceSocket = io(url, {
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