import { NextResponse } from 'next/server';
import { getPostBySlug, writePost, deletePost, postSlugExists } from '../../../../lib/content';

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').toLowerCase() || 'untitled';
}

const dateOnly = (v: unknown): string => {
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const safe = sanitizeSlug(slug);
  const record = getPostBySlug(safe);
  if (!record) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const safe = sanitizeSlug(slug);
  const record = getPostBySlug(safe);
  if (!record) return NextResponse.json({ error: '文章不存在' }, { status: 404 });

  const body = await request.json();
  const title = typeof body.title === 'string' ? body.title.trim() : record.meta.title;
  const content = typeof body.content === 'string' ? body.content : record.content;
  const summary = typeof body.summary === 'string' ? body.summary : record.meta.summary;
  const tags = body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags.map(String) : undefined) : record.meta.tags;
  const draft = body.draft !== undefined ? Boolean(body.draft) : record.meta.draft;
  const date = body.date !== undefined ? dateOnly(body.date) : record.meta.date;

  try {
    writePost(safe, { title, date, summary, tags, draft }, content);
    return NextResponse.json({ ok: true, slug: safe });
  } catch (e) {
    console.error('[api/posts] update error', e);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const safe = sanitizeSlug(slug);
  if (!postSlugExists(safe)) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  try {
    deletePost(safe);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/posts] delete error', e);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
