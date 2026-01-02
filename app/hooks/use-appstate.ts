import { create } from 'zustand';
// import i18next from '../locales/i18n';

// Theme
export type ThemeMsg = 'light' | 'dark' | 'system'

interface TAppState {
  theme: ThemeMsg,
  setTheme: (theme: ThemeMsg) => void,
  language: string,
  setLanguage: (lang: string) => void,
}

const useAppState = create<TAppState>()((set) => ({
  theme: "system",
  setTheme: (theme) => {
    set(() => ({ theme }))
  },
  language: "zh",
  setLanguage: (lang) => {
    // i18next.changeLanguage(lang)
  },
}))

export default useAppState;