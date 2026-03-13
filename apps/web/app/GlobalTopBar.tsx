'use client';

import { usePathname } from 'next/navigation';
import { PageNav, ThemeToggle } from '@homeblog/ui/client';

export function GlobalTopBar() {
  const pathname = usePathname();
  if (!pathname) return null;
  if (pathname.startsWith('/console')) return null;

  const activePath = pathname.startsWith('/blog') ? '/blog' : '/';
  const showBack = pathname.startsWith('/blog');

  return (
    <div className="global-topbar">
      <div className="global-topbar__nav">
        <PageNav
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' }
          ]}
          activePath={activePath}
          showBack={showBack}
          className="global-topbar__pill"
        />
      </div>
      <div className="global-topbar__theme">
        <ThemeToggle />
      </div>
    </div>
  );
}
