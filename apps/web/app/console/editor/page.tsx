import type { ReactNode } from 'react';

export const metadata = {
  title: '文章编辑器 · HomeBlog'
};

export default function EditorPage(): ReactNode {
  return (
    <main className="console-page">
      <header className="page__header">
        <h1>文章编辑器</h1>
        <p className="muted">后续支持富文本编辑器与上传。</p>
      </header>
      <section className="card">
        <p className="muted">此处预留富文本编辑器。</p>
      </section>
    </main>
  );
}
