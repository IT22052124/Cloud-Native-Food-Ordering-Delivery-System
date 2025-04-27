import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map(); // { userId: WebSocket }

wss.on("connection", (ws, req) => {
  const userId = req.url.split("?userId=")[1]; // Simple auth
  clients.set(userId, ws);

  ws.on("close", () => clients.delete(userId));
});

// Send notification to a specific user
export const sendRealTimeNotification = (userId, notification) => {
  const client = clients.get(userId);
  if (client) client.send(JSON.stringify(notification));
};

export default wss;
