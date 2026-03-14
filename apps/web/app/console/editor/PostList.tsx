'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@homeblog/ui/client';

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
};

export function PostList() {
  const [list, setList] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    const res = await fetch('/api/posts');
    if (!res.ok) return;
    const data = await res.json();
    setList(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchList().finally(() => setLoading(false));
  }, [fetchList]);

  const remove = useCallback(
    async (e: React.MouseEvent, slugToDelete: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm(`确定删除「${slugToDelete}」？`)) return;
      const res = await fetch(`/api/posts/${encodeURIComponent(slugToDelete)}`, {
        method: 'DELETE'
      });
      if (!res.ok) return;
      fetchList();
    },
    [fetchList]
  );

  return (
    <div className="post-list-page">
      <header className="post-list-header">
        <h1 className="post-list-title">文章列表</h1>
        <p className="post-list-desc muted">管理博客文章，点击进入富文本编辑器。</p>
        <div className="post-list-actions">
          <Link href="/console/editor/new">
            <Button variant="primary" size="md">
              新建文章
            </Button>
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="post-list-loading muted">加载中…</div>
      ) : list.length === 0 ? (
        <div className="post-list-empty card">
          <p className="muted">暂无文章</p>
          <Link href="/console/editor/new" style={{ marginTop: 12 }}>
            <Button variant="outline" size="sm">
              创建第一篇
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="post-list">
          {list.map((post) => (
            <li key={post.slug} className="post-list-item">
              <div className="post-list-card card">
                <Link
                  href={`/console/editor/${encodeURIComponent(post.slug)}`}
                  className="post-list-card__main"
                >
                  <h3 className="post-list-card__title">{post.title}</h3>
                  <div className="post-list-card__meta">
                    <time dateTime={post.date}>{post.date}</time>
                    {post.draft && <span className="post-list-card__draft">草稿</span>}
                  </div>
                  {post.summary && (
                    <p className="post-list-card__summary muted">{post.summary}</p>
                  )}
                </Link>
                <div className="post-list-card__actions">
                  <Link
                    href={`/console/editor/${encodeURIComponent(post.slug)}`}
                    className="post-list-card__btn"
                  >
                    编辑
                  </Link>
                  <button
                    type="button"
                    className="post-list-card__btn post-list-card__btn--danger"
                    onClick={(e) => remove(e, post.slug)}
                    aria-label="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
