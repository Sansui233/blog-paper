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
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 移除旧类
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const cls = systemIsDark ? 'dark' : 'light'
      root.classList.add(cls);
      appState.setTheme(cls);
    } else {
      root.classList.add(theme);
      appState.setTheme(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme }
}
