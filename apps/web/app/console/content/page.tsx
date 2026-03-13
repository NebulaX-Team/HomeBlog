import type { ReactNode } from 'react';

export const metadata = {
  title: '内容管线 · HomeBlog'
};

export default function ContentPage(): ReactNode {
  return (
    <main className="console-page">
      <header className="page__header">
        <h1>内容管线</h1>
        <p className="muted">后续支持内容源、构建与发布流程配置。</p>
      </header>
      <section className="card">
        <p className="muted">此处预留内容管线设置。</p>
      </section>
    </main>
  );
}
