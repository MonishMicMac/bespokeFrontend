import { io } from "socket.io-client";

let socket = null;

// Connect socket
export const connectSocket = (url) => {
  if (!socket) {
    socket = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });
  }

  return socket;
};

// Listen to specific event
export const onSocketEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  } else {
    console.error("⚠ Socket not connected! Call connectSocket() first.");
  }
};

// Optional: remove listener
export const offSocketEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

// Get socket instance
export const getSocket = () => socket;
