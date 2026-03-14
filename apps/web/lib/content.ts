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
  return getAllPostsIncludingDrafts().filter((meta) => !meta.draft);
}

/** 获取所有文章（含草稿），供控制台列表使用 */
export function getAllPostsIncludingDrafts(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.mdx'));
  const metas = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = matter(raw);
    return toMeta(slug, data as Record<string, unknown>);
  });
  return metas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

function slugToFilename(slug: string): string {
  const safe = slug.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').toLowerCase();
  return safe || 'untitled';
}

function buildFrontmatter(meta: Omit<PostMeta, 'slug'>): string {
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

export function writePost(
  slug: string,
  meta: Omit<PostMeta, 'slug'>,
  content: string
): { path: string } {
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
  const filename = slugToFilename(slug);
  const fullPath = path.join(postsDir, `${filename}.mdx`);
  const raw = buildFrontmatter(meta) + content;
  fs.writeFileSync(fullPath, raw, 'utf8');
  return { path: fullPath };
}

export function deletePost(slug: string): boolean {
  const filename = slugToFilename(slug);
  const fullPath = path.join(postsDir, `${filename}.mdx`);
  if (!fs.existsSync(fullPath)) return false;
  fs.unlinkSync(fullPath);
  return true;
}

export function postSlugExists(slug: string): boolean {
  const filename = slugToFilename(slug);
  const fullPath = path.join(postsDir, `${filename}.mdx`);
  return fs.existsSync(fullPath);
}
