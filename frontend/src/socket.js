import { io } from "socket.io-client";

const url = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const socket = io(url, {
  transports: ["websocket", "polling"], // allow fallback
});
