import type { ReactNode } from 'react';
import Link from 'next/link';
import { Activity, Bell, Eye, FileText } from 'lucide-react';
import { getNotifications, getStats } from '../../lib/stats';

export const metadata = {
  title: 'Console · HomeBlog'
};

export const dynamic = 'force-dynamic';

export default async function ConsolePage(): Promise<ReactNode> {
  const statsData = await getStats();
  const stats = [
    { label: '文章', value: String(statsData.posts), Icon: FileText },
    { label: '评论', value: String(statsData.comments), Icon: Activity },
    { label: '浏览量', value: String(statsData.views), Icon: Eye }
  ];
  const notifications = await getNotifications(6);

  return (
    <main className="console-page">
      <header className="page__header">
        <h1>仪表盘</h1>
        <p className="muted">快捷入口与系统状态。</p>
      </header>
      <section className="console-stats">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="console-stat card">
            <div className="console-stat__icon">
              <Icon size={18} />
            </div>
            <div>
              <div className="console-stat__label">{label}</div>
              <div className="console-stat__value">{value}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="card console-panel">
        <div className="console-panel__header">
          <h2>
            <Bell size={16} /> 通知
          </h2>
          <Link className="button button--ghost" href="/blog">
            查看全部
          </Link>
        </div>
        <div className="console-notices">
          {notifications.length ? (
            notifications.map((item, index) => (
              <div key={`${item.title}-${index}`} className="console-notice">
                <div className="console-notice__title">{item.title}</div>
                <div className="console-notice__time">{item.time}</div>
              </div>
            ))
          ) : (
            <div className="muted">暂无通知。</div>
          )}
        </div>
      </section>
    </main>
  );
}
