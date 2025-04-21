// utils/socketService.js
import io from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5004";
let socket = null;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true
    });
  }
  return socket;
};

export const joinDeliveryRoom = (deliveryId) => {
  if (socket) {
    socket.emit("joinDelivery", deliveryId);
  }
};

export const onSocketEvent = (eventName, callback) => {
  if (socket) {
    socket.on(eventName, callback);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};