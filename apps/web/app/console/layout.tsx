import type { ReactNode } from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { TopbarActions } from '@homeblog/ui/client';

const titleMap: Record<string, string> = {
  '/console': '仪表盘',
  '/console/site': '站点配置',
  '/console/theme': '主题管理',
  '/console/content': '内容管线',
  '/console/editor': '文章编辑器'
};

function resolveTitle(pathname: string) {
  const match = Object.keys(titleMap).find((key) => pathname === key || pathname.startsWith(`${key}/`));
  return match ? titleMap[match] : 'Console';
}

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get('x-invoke-path') ?? headerList.get('x-next-url') ?? '/console';
  const title = resolveTitle(pathname);

  return (
    <div className="console-shell">
      <aside className="console-sidebar">
        <div className="console-brand">Console</div>
        <nav className="console-menu">
          <Link href="/console">仪表盘</Link>
          <div className="console-group">内容</div>
          <Link href="/console/site">站点配置</Link>
          <Link href="/console/theme">主题管理</Link>
          <Link href="/console/content">内容管线</Link>
          <Link href="/console/editor">文章编辑器</Link>
        </nav>
      </aside>
      <div className="console-content">
        <div className="console-topbar">
          <div className="console-topbar__title">{title}</div>
          <div className="console-topbar__actions">
            <TopbarActions />
          </div>
        </div>
        <div className="console-body">{children}</div>
      </div>
    </div>
  );
}
