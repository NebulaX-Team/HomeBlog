"use client";

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type ThemeMode = 'light' | 'dark';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
  window.localStorage.setItem('theme', mode);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const initial =
      (document.documentElement.dataset.theme as ThemeMode | undefined) ?? getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => {
        const startViewTransition = (
          document as unknown as { startViewTransition?: (cb: () => void) => void }
        ).startViewTransition;
        if (typeof startViewTransition === 'function') {
          startViewTransition.call(document, () => {
            applyTheme(next);
            setTheme(next);
          });
        } else {
          applyTheme(next);
          setTheme(next);
        }
      }}
      aria-label={`切换到${next === 'dark' ? '深色' : '浅色'}模式`}
    >
      <span className="theme-toggle__icon">
        {theme === 'dark' ? <Sun size={14} strokeWidth={1.6} /> : <Moon size={14} strokeWidth={1.6} />}
      </span>
      <span className="theme-toggle__label">{theme === 'dark' ? '浅色' : '深色'}</span>
    </button>
  );
}
