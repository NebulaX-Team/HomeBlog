import Link from 'next/link';
import { getAllPosts } from '../../lib/content';

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="page">
      <header className="page__header">
        <h1>博客</h1>
        <p>最新内容与技术笔记。</p>
      </header>

      <section className="list">
        {posts.length === 0 ? (
          <p className="muted">暂无文章。</p>
        ) : (
          posts.map((post) => (
            <article key={post.slug} className="card">
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <div className="meta">
                <span>{post.date}</span>
                {post.tags?.length ? <span> · {post.tags.join(', ')}</span> : null}
              </div>
              {post.summary ? <p className="summary">{post.summary}</p> : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
