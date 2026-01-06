import i18next, { detectUserLanguage } from "lib/i18n";
import { useEffect } from "react";

/**
 * I18nProvider - 处理客户端语言初始化
 *
 * SSG 模式下的工作流程：
 * 1. SSG 构建时使用默认语言(zh)渲染 HTML
 * 2. 客户端加载时，React 先用默认语言水合（匹配 SSG HTML）
 * 3. 水合完成后，useEffect 检测用户语言并切换
 * 4. 如果用户语言与默认语言不同，触发重新渲染
 *
 * 这样可以避免水合不匹配错误，代价是非默认语言用户会看到短暂的语言闪烁
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const userLang = detectUserLanguage();
    console.debug("i18n lang", i18next.language, "->", userLang);
    if (i18next.language !== userLang) {
      i18next.changeLanguage(userLang);
    }
  }, []);

  return <>{children}</>;
}

export default I18nProvider;
