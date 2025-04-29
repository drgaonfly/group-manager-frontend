import { useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { storage } from "../lib/utils";

interface SocketConfig {
  eventName: string;
  initialEmitEvent?: string;
  onDataReceived: (data: unknown) => void;
}

const soundSrc = "/sounds/newCustomerBeep.mp3";

export const playSound = () => {
  const sound = new Audio(soundSrc);
  sound.preload = "auto";
  sound.play();
};

export const useSocketNotification = (configs: SocketConfig[]) => {
  const accessToken = storage.getToken();
  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_APP_SOCKET_URL || "http://localhost:5007";
    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: true,
      auth: { token: `Bearer ${accessToken}` },
      // query: { customerId: user?._id }, // 替换为实际用户ID
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

    socket.on("ping", (timestamp: number) => {
      socket.emit("pong", timestamp);
    });

    // Handle socket disconnection
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);
      // 断开连接后自动重连
      if (
        reason === "io server disconnect" ||
        reason === "io client disconnect"
      ) {
        // 服务器或客户端主动断开连接，需要手动重连
        socket.connect();
        console.log("Attempting to reconnect after disconnect");
      }
      // 其他情况socket.io会自动重连
    });

    // Handle connection errors
    socket.on("connect_error", (error: Error) => {
      console.error("Socket.IO connection error:", error);
    });

    // Optional: Listen to reconnection events
    socket.on("reconnect_attempt", (attempt: number) => {
      console.log(`Socket.IO reconnection attempt ${attempt}`);
    });

    socket.on("reconnect", () => {
      console.log("Socket.IO reconnected successfully");
      // 重连成功后重新发送初始事件
      configs.forEach((config) => {
        if (config.initialEmitEvent) {
          socket.emit(config.initialEmitEvent);
          console.log(
            `Re-emitted initial event after reconnection: ${config.initialEmitEvent} for ${config.eventName}`,
          );
        }
      });
    });

    socket.on("reconnect_failed", () => {
      console.log("Socket.IO reconnection failed");
      // 重连失败后继续尝试连接
      setTimeout(() => {
        socket.connect();
      }, 5000);
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
