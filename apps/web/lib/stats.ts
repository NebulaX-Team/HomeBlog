import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

type StatsStore = {
  views: number;
};

const dataDir = path.resolve(process.cwd(), '..', '..', '.data');
const statsPath = path.join(dataDir, 'stats.json');

async function ensureStore(): Promise<StatsStore> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(statsPath, 'utf8');
    const parsed = JSON.parse(raw) as StatsStore;
    if (typeof parsed.views === 'number') return parsed;
  } catch {
    // ignore
  }
  const fresh = { views: 0 };
  await fs.writeFile(statsPath, JSON.stringify(fresh, null, 2), 'utf8');
  return fresh;
}

async function countPosts(): Promise<number> {
  const postsDir = path.resolve(process.cwd(), 'content', 'posts');
  try {
    const entries = await fs.readdir(postsDir);
    return entries.filter((file) => file.endsWith('.mdx') || file.endsWith('.md')).length;
  } catch {
    return 0;
  }
}

export async function getStats() {
  const store = await ensureStore();
  const posts = await countPosts();
  return {
    posts,
    users: 0,
    comments: 0,
    views: store.views
  };
}

export async function incrementViews() {
  const store = await ensureStore();
  const next = { ...store, views: store.views + 1 };
  await fs.writeFile(statsPath, JSON.stringify(next, null, 2), 'utf8');
  return next.views;
}

function formatRelativeTime(input: number) {
  const diff = Date.now() - input;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  return `${Math.floor(diff / day)} 天前`;
}

export async function getNotifications(limit = 6) {
  const postsDir = path.resolve(process.cwd(), 'content', 'posts');
  try {
    const files = (await fs.readdir(postsDir)).filter((file) => file.endsWith('.mdx'));
    const items = await Promise.all(
      files.map(async (file) => {
        const fullPath = path.join(postsDir, file);
        const raw = await fs.readFile(fullPath, 'utf8');
        const { data } = matter(raw);
        const title = typeof data.title === 'string' ? data.title : file.replace(/\.mdx$/, '');
        const stat = await fs.stat(fullPath);
        return {
          title: `文章「${title}」更新`,
          time: formatRelativeTime(stat.mtimeMs),
          mtime: stat.mtimeMs
        };
      })
    );
    return items.sort((a, b) => b.mtime - a.mtime).slice(0, limit);
  } catch {
    return [];
  }
}
