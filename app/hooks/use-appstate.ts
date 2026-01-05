import i18next, { type SupportedLang } from "lib/i18n";
import { create } from "zustand";

// Theme
export type ThemeMsg = "light" | "dark" | "system";

interface TAppState {
  theme: ThemeMsg;
  setTheme: (theme: ThemeMsg) => void;
  language: SupportedLang;
  setLanguage: (lang: SupportedLang) => void;
}

const useAppState = create<TAppState>()((set) => ({
  theme: "system",
  setTheme: (theme) => {
    set(() => ({ theme }));
  },
  language: i18next.language as SupportedLang,
  setLanguage: (lang) => {
    i18next.changeLanguage(lang);
    set(() => ({ language: lang }));
  },
}));

export default useAppState;
