import { create } from "zustand";

export interface ChatMessage {
  _id?: string;
  customer: any;
  user: any;
  message: string;
  sender: "customer" | "user";
  isRead: boolean;
  isSoftDeleted: boolean;
  deletedAt?: Date | null;
  unreadCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 定义消息存储的接口类型
interface ChatStore {
  message: ChatMessage;
  setMessage: (message: ChatMessage) => void;
}

// 创建消息存储
export const useChatStore = create<ChatStore>((set) => ({
  message: {
    customer: null,
    user: null,
    message: "",
    sender: "user",
    isRead: false,
    isSoftDeleted: false,
  },
  setMessage: (message: any) => {
    set({ message });
  },
}));
