import type { ReactElement } from 'react';
import { NextResponse } from 'next/server';
import { compileMDX, renderMDX, resolveShikiTheme } from '@homeblog/rich-text-renderer';
import { ServerCallout, ServerCodeBlock, ServerMermaid } from '../../../lib/preview-components';
import { siteConfig } from '../../../../../site.config';

const mdxComponents = {
  pre: ServerCodeBlock,
  Mermaid: ServerMermaid,
  Callout: ServerCallout
};

function buildFrontmatter(meta: {
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
}): string {
  const lines = [
    '---',
    `title: ${JSON.stringify(meta.title)}`,
    `date: ${meta.date}`,
    ...(meta.summary ? [`summary: ${JSON.stringify(meta.summary)}`] : []),
    ...(meta.tags?.length ? [`tags:\n${meta.tags.map((t) => `  - ${t}`).join('\n')}`] : []),
    ...(meta.draft ? ['draft: true'] : []),
    '---'
  ];
  return lines.join('\n') + '\n';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title : '预览';
    const date = typeof body.date === 'string' ? body.date : new Date().toISOString().slice(0, 10);
    const summary = typeof body.summary === 'string' ? body.summary : undefined;
    const tags = Array.isArray(body.tags) ? body.tags.map(String) : undefined;
    const content = typeof body.content === 'string' ? body.content : '';

    const raw = buildFrontmatter({ title, date, summary, tags, draft: false }) + content;

    const compiled = await compileMDX({
      input: raw,
      enableMermaid: true,
      enableMath: true,
      highlighterTheme: resolveShikiTheme(siteConfig.codeTheme)
    });

    const contentEl = await renderMDX(compiled, { components: mdxComponents });
    const mod = await import('react-dom/server') as { renderToStaticMarkup: (el: ReactElement) => string };
    const html = mod.renderToStaticMarkup(contentEl);

    return NextResponse.json({ html });
  } catch (e) {
    console.error('[api/preview] error', e);
    return NextResponse.json(
      { error: '预览渲染失败', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
