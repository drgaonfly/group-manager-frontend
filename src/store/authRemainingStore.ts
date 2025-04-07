import { create } from "zustand";

interface AuthRemainingStore {
  authRemaining: string;
  setAuthRemaining: (value: string) => void;
}

export const useAuthRemainingStore = create<AuthRemainingStore>((set) => ({
  authRemaining: new Date().toLocaleString(),
  setAuthRemaining: (value: string) => {
    set({ authRemaining: value });
  },
}));
