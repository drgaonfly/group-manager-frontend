import { create } from "zustand";

interface ChatStore {
  messages: string[];
  addMessage: (message: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message: string) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },
  clearMessages: () => {
    set({ messages: [] });
  },
}));
