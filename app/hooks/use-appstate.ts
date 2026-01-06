import i18next from "lib/i18n";
import { create } from "zustand";

// Theme
export type ThemeMsg = "light" | "dark" | "system";

interface TAppState {
  theme: ThemeMsg;
  setTheme: (theme: ThemeMsg) => void;
  i18next: typeof i18next;
}

const useAppState = create<TAppState>()((set) => ({
  theme: "system",
  setTheme: (theme) => {
    set(() => ({ theme }));
  },
  i18next: i18next,
}));

export default useAppState;
