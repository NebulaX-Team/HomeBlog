import type { ReactNode } from 'react';

export const metadata = {
  title: '主题管理 · HomeBlog'
};

export default function ThemePage(): ReactNode {
  return (
    <main className="console-page">
      <header className="page__header">
        <h1>主题管理</h1>
        <p className="muted">后续支持主题包切换、预览与安装。</p>
      </header>
      <section className="card">
        <p className="muted">此处预留主题包管理功能。</p>
      </section>
    </main>
  );
}
