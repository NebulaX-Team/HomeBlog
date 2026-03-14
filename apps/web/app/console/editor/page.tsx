import type { ReactNode } from 'react';
import { PostList } from './PostList';

export const metadata = {
  title: '文章列表 · HomeBlog'
};

export const dynamic = 'force-dynamic';

export default function EditorListPage(): ReactNode {
  return (
    <main className="console-page">
      <PostList />
    </main>
  );
}
