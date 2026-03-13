'use client';

import { usePathname } from 'next/navigation';
import { PageNav } from '@homeblog/ui/client';

export function BlogNav() {
  const pathname = usePathname();
  const activePath = pathname?.startsWith('/blog') ? '/blog' : '/';

  return (
    <PageNav
      items={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' }
      ]}
      activePath={activePath}
      showBack
    />
  );
}
