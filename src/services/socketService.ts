import { io, Socket } from "socket.io-client";

// Use environment variable or fallback to localhost
const SOCKET_URL =
  import.meta.env.VITE_APP_SOCKET_URL || "http://localhost:5007";

// 处理URL，确保不带/api后缀
const getBaseUrl = (url: string): string => {
  return url.endsWith("/api") ? url.slice(0, -4) : url;
};

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {
    this.socket = io(getBaseUrl(SOCKET_URL), {
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(getBaseUrl(SOCKET_URL), {
        transports: ["websocket"],
        autoConnect: true,
      });
    }
    return this.socket;
  }

  public on<T>(event: string, callback: (data: T) => void): void {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  public off(event: string): void {
    if (!this.socket) return;
    this.socket.off(event);
  }

  public emit<T>(event: string, data?: T): void {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  public connect(): void {
    if (this.socket && this.socket.disconnected) {
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default SocketService.getInstance();
