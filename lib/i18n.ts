import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ja from "../locales/ja.json";
import zh from "../locales/zh.json";

const STORAGE_KEY = "language";
export const SUPPORTED_LANGS = ["zh", "en", "ja"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function getInitialLanguage(): SupportedLang {
  if (typeof window === "undefined") return "zh";

  // 1. 先检查 localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored as SupportedLang)) {
    return stored as SupportedLang;
  }

  // 2. 检测浏览器语言
  const browserLang = navigator.language.split("-")[0];
  if (SUPPORTED_LANGS.includes(browserLang as SupportedLang)) {
    return browserLang as SupportedLang;
  }

  // store into localStorage
  localStorage.setItem(STORAGE_KEY, "zh");
  console.debug("local storage set lang to zh");

  return "zh"; // 默认中文
}

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ja: { translation: ja },
  },
  lng: getInitialLanguage(),
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
});

// 语言变化时保存到 localStorage
i18next.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lng);
    console.debug(`local storage set lang to ${lng}`);
  }
});

export default i18next;
