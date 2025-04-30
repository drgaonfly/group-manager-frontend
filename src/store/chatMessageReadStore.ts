import { create } from "zustand";

// 定义消息状态的接口类型
export interface MessageReadStatus {
  customerId: string;
  userId: string;
  sender: string;
}

// 定义消息存储的接口类型
interface MessageReadStore {
  messageReadStatus: MessageReadStatus;
  handleMessageReadStatusChange: (data: MessageReadStatus) => void;
}

// 创建消息存储
export const useMessageReadStore = create<MessageReadStore>((set) => ({
  messageReadStatus: {
    customerId: "",
    userId: "",
    sender: "",
  },
  handleMessageReadStatusChange: (data: MessageReadStatus) => {
    console.log("Message read status changed:", {
      customerId: data.customerId,
      userId: data.userId,
      sender: data.sender,
    });
    set({
      messageReadStatus: {
        customerId: data.customerId,
        userId: data.userId,
        sender: data.sender,
      },
    });
  },
}));
