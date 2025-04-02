import socketService from "../services/socketService";

/**
 * Initialize socket connection at app startup
 */
export const initializeSocket = () => {
  // Ensure socket is connected
  socketService.connect();

  // Add global event listeners if needed
  socketService.on("global_notification", (data: unknown) => {
    console.log("Global notification received:", data);
    // You could dispatch to a notification store/context here
  });

  // Add authentication mechanism if needed
  const addAuthToSocket = (token: string) => {
    const socket = socketService.getSocket();
    // Set auth token for future connections
    socket.auth = { token };
    // Reconnect with new auth
    if (socket.disconnected) {
      socket.connect();
    }
  };

  return {
    addAuthToSocket,
  };
};

export default socketService;
