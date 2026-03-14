import { NextResponse } from 'next/server';
import { getAllPostsIncludingDrafts, writePost, postSlugExists } from '../../../lib/content';

export async function GET() {
  const posts = getAllPostsIncludingDrafts();
  return NextResponse.json(posts);
}

const dateOnly = (v: unknown): string => {
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};

export async function POST(request: Request) {
  const body = await request.json();
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '未命名';
  const content = typeof body.content === 'string' ? body.content : '';
  const summary = typeof body.summary === 'string' ? body.summary : undefined;
  const tags = Array.isArray(body.tags) ? body.tags.map(String) : undefined;
  const draft = Boolean(body.draft);

  if (!slug) {
    return NextResponse.json({ error: 'slug 不能为空' }, { status: 400 });
  }
  if (postSlugExists(slug)) {
    return NextResponse.json({ error: '该 slug 已存在' }, { status: 409 });
  }

  try {
    const date = dateOnly(body.date);
    writePost(slug, { title, date, summary, tags, draft }, content);
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    console.error('[api/posts] write error', e);
    return NextResponse.json({ error: '写入失败' }, { status: 500 });
  }
}
