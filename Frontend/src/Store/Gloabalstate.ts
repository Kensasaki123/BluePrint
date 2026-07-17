import { create } from "zustand";

export interface Settings {
  vaultPath: string | null;
}

interface SettingsStore {
  setting: Settings;

  setVaultPath: (path: string) => void;
  setSetting: (settings: Settings) => void;
  resetSetting: () => void;
}

const defaultSettings: Settings = {
  vaultPath: null,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  setting: defaultSettings,

  setVaultPath: (path) =>
    set((state) => ({
      setting: {
        ...state.setting,
        vaultPath: path,
      },
    })),

  setSetting: (setting) =>
    set({
      setting,
    }),

  resetSetting: () =>
    set({
      setting: defaultSettings,
    }),
}));