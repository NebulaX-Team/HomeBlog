'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function GlobalRouteTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const prevPath = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      prevPath.current = pathname;
      return;
    }
    if (pathname === prevPath.current) return;
    if (pathname?.startsWith('/console')) {
      prevPath.current = pathname;
      return;
    }

    prevPath.current = pathname;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    document.documentElement.classList.add('route-fade');
    timeoutRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove('route-fade');
      timeoutRef.current = null;
    }, 260);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  return null;
}
