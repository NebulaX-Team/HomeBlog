import type { ReactNode } from 'react';
import { siteConfig } from '../../../../../site.config';
import { ConfigEditor } from '@homeblog/ui/client';

export const metadata = {
  title: '站点配置 · HomeBlog'
};

export const dynamic = 'force-dynamic';

export default function SiteConfigPage(): ReactNode {
  return (
    <main className="console-page">
      <ConfigEditor initialConfig={siteConfig} />
    </main>
  );
}
