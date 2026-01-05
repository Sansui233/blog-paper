// src/hooks/useTheme.ts
import { useEffect, useState } from 'react';
import useAppState from './use-appstate';

export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const appState = useAppState();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // 初始化逻辑：从 localStorage 读，或者默认 system
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as ThemeMode) || 'system';
    }
    appState.setTheme('system');
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (systemIsDark: boolean) => {
      // 移除旧类
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const cls = systemIsDark ? 'dark' : 'light';
        root.classList.add(cls);
        appState.setTheme(cls);
      } else {
        root.classList.add(theme);
        appState.setTheme(theme);
      }
    };

    // 初始应用主题
    applyTheme(mediaQuery.matches);
    localStorage.setItem('theme', theme);

    // 当 theme 为 system 时，监听系统主题变化
    if (theme === 'system') {
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return { theme, setTheme }
}
