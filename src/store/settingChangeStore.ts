import { create } from "zustand";

interface SettingChangeStore {
  settingChange: string;
  setSettingChange: (value: string) => void;
}

export const useSettingChangeStore = create<SettingChangeStore>((set) => ({
  settingChange: new Date().toLocaleString(),
  setSettingChange: (value: string) => {
    set({ settingChange: value });
  },
}));
