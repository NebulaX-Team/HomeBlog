import { notFound } from 'next/navigation';
import { compileMDX, renderMDX } from '@homeblog/rich-text-renderer';
import { Callout, CodeBlock, Mermaid } from '@homeblog/rich-text-renderer/client';
import { getPostBySlug } from '../../../lib/content';

export const dynamic = 'force-dynamic';

const mdxComponents = {
  pre: CodeBlock,
  Mermaid,
  Callout
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = getPostBySlug(slug);
  if (!record) return notFound();

  const compiled = await compileMDX({
    input: record.content,
    enableMermaid: true,
    enableMath: true
  });

  const content = await renderMDX(compiled, { components: mdxComponents });

  return (
    <main className="page">
      <article className="article">
        <header className="article__header">
          <h1>{record.meta.title}</h1>
          <div className="meta">
            <span>{record.meta.date}</span>
            {record.meta.tags?.length ? <span> · {record.meta.tags.join(', ')}</span> : null}
          </div>
          {record.meta.summary ? <p className="summary">{record.meta.summary}</p> : null}
        </header>
        <section className="article__body">{content}</section>
      </article>
    </main>
  );
}
