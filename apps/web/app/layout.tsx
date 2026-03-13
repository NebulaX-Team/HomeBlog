import './globals.css';
import './theme.tokens.css';
import './theme.css';
import '@homeblog/ui/styles.css';
import '@homeblog/rich-text-renderer/styles.css';
import type { ReactNode } from 'react';
import { VisitTracker } from '@homeblog/ui/client';
import { GlobalTopBar } from './GlobalTopBar';
import { GlobalRouteTransition } from './GlobalRouteTransition';

export const metadata = {
  title: 'HomeBlog',
  description: 'Personal home + blog'
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <VisitTracker />
        <GlobalTopBar />
        <GlobalRouteTransition />
        {children}
      </body>
    </html>
  );
}
