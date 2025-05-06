import { create } from "zustand";

// 定义未读消息数量的接口类型
export interface UnreadCountData {
  count: number;
  customerId: string;
}

// 定义未读消息存储的接口类型
interface UnreadCountStore {
  unreadCountData: UnreadCountData;
  handleUnreadCountUpdate: (data: UnreadCountData) => void;
}

// 创建未读消息存储
export const useUnreadCountStore = create<UnreadCountStore>((set) => ({
  unreadCountData: {
    count: 0,
    customerId: "",
  },
  handleUnreadCountUpdate: (data: UnreadCountData) => {
    console.log("收到未读消息数量更新:", data);
    set({ unreadCountData: data });
  },
}));
