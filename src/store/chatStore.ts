import { create } from "zustand";

// 定义消息存储的接口类型
interface ChatStore {
  message: any;
  setMessage: (message: any) => void;
}

// 创建消息存储
export const useChatStore = create<ChatStore>((set) => ({
  message: {},
  setMessage: (message: any) => {
    set({ message });
  },
}));
