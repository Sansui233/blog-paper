import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ja from "../locales/ja.json";
import zh from "../locales/zh.json";

export const STORAGE_KEY = "language";
export const DEFAULT_LANG = "zh";
export const SUPPORTED_LANGS = ["zh", "en", "ja"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

/**
 * 检测用户首选语言（仅在客户端调用）
 */
export function detectUserLanguage(): SupportedLang {
  if (typeof window === "undefined") return DEFAULT_LANG;

  // 1. 检测浏览器语言
  const browserLang = navigator.language.split("-")[0];
  if (SUPPORTED_LANGS.includes(browserLang as SupportedLang)) {
    return browserLang as SupportedLang;
  }
  // 2. 先检查 localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored as SupportedLang)) {
    return stored as SupportedLang;
  }

  return DEFAULT_LANG;
}

// 初始化时始终使用默认语言，避免 SSG 水合不匹配
// 客户端会在 I18nProvider 中检测并切换到用户语言
i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ja: { translation: ja },
  },
  lng: DEFAULT_LANG, // SSG 和客户端初始都用默认语言
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
});

// 语言变化时保存到 localStorage
i18next.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18next;
