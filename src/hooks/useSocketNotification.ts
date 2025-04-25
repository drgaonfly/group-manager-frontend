import { useEffect } from "react";
import io, { Socket } from "socket.io-client";

interface SocketConfig {
  eventName: string;
  initialEmitEvent?: string;
  onDataReceived: (data: unknown) => void;
}

export const useSocketNotification = (configs: SocketConfig[]) => {
  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_APP_SOCKET_URL || "http://localhost:5007";
    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: true,
      auth: { token: localStorage.getItem("token") },
    });

    // Handle socket connection
    socket.on("connect", () => {
      console.log("Socket connected successfully");
      // Emit initial events for all configurations that have it
      configs.forEach((config) => {
        if (config.initialEmitEvent) {
          socket.emit(config.initialEmitEvent);
          console.log(
            `Emitted initial event: ${config.initialEmitEvent} for ${config.eventName}`,
          );
        }
      });
    });

    // Set up listeners for each configuration
    configs.forEach((config) => {
      socket.on(config.eventName, config.onDataReceived);
      console.log(`Listening to event: ${config.eventName}`);
    });

    // Handle socket disconnection
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);
    });

    // Handle connection errors
    socket.on("connect_error", (error: Error) => {
      console.error("Socket.IO connection error:", error);
    });

    // Optional: Listen to reconnection events
    socket.on("reconnect_attempt", (attempt: number) => {
      console.log(`Socket.IO reconnection attempt ${attempt}`);
    });

    socket.on("reconnect_failed", () => {
      console.log("Socket.IO reconnection failed");
    });

    // Listen to 'message' event (if needed)
    socket.on("message", (data: unknown) => {
      console.log("Received 'message' event:", data);
    });

    // Cleanup function to remove all listeners and disconnect the socket
    return () => {
      console.log("Cleaning up socket connection");
      configs.forEach((config) => {
        socket.off(config.eventName, config.onDataReceived);
        console.log(`Stopped listening to event: ${config.eventName}`);
      });
      socket.disconnect();
    };
  }, []); // Dependency array includes the entire configs array
};
