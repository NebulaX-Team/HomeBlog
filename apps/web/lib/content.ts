import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
};

export type PostRecord = {
  meta: PostMeta;
  content: string;
};

const postsDir = path.join(process.cwd(), 'content', 'posts');

function readPostFile(slug: string) {
  const fullPath = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function toMeta(slug: string, data: Record<string, unknown>): PostMeta {
  const date = normalizeDate(data.date);
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    date,
    summary: typeof data.summary === 'string' ? data.summary : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    draft: Boolean(data.draft)
  };
}

function normalizeDate(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return '1970-01-01';
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.mdx'));
  const metas = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = matter(raw);
    return toMeta(slug, data as Record<string, unknown>);
  });

  return metas
    .filter((meta) => !meta.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): PostRecord | null {
  const raw = readPostFile(slug);
  if (!raw) return null;
  const { content, data } = matter(raw);
  return {
    meta: toMeta(slug, data as Record<string, unknown>),
    content
  };
}
