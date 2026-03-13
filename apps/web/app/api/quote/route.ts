import { NextResponse } from 'next/server';
import { siteConfig } from '../../../../../site.config';

const DEFAULT_REMOTE = 'https://v1.hitokoto.cn';

function resolveRemoteUrl() {
  const raw = siteConfig.home?.quoteCard?.apiUrl ?? DEFAULT_REMOTE;
  if (!raw || raw.startsWith('/')) return DEFAULT_REMOTE;
  return raw;
}

export async function GET() {
  const remoteUrl = resolveRemoteUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(remoteUrl, { cache: 'no-store', signal: controller.signal });
    if (!res.ok) {
      return NextResponse.json({ error: 'upstream_failed' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 204 });
  } finally {
    clearTimeout(timeout);
  }
}
