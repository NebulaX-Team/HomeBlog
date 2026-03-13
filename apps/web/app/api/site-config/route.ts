import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { siteConfig } from '../../../../../site.config';

function resolveConfigPath() {
  const cwd = process.cwd();
  const isWorkspaceWeb =
    path.basename(cwd) === 'web' && path.basename(path.dirname(cwd)) === 'apps';
  const root = isWorkspaceWeb ? path.resolve(cwd, '..', '..') : cwd;
  return path.join(root, 'site.config.ts');
}

function serializeConfig(config: unknown) {
  return `export const siteConfig = ${JSON.stringify(config, null, 2)};\n\nexport type SiteConfig = typeof siteConfig;\n`;
}

export async function GET() {
  return NextResponse.json(siteConfig, { status: 200 });
}

export async function POST(request: Request) {
  const data = await request.json();
  const filePath = resolveConfigPath();
  console.log('[site-config] write', filePath);
  await fs.writeFile(filePath, serializeConfig(data), 'utf8');
  return NextResponse.json({ ok: true, filePath }, { status: 200 });
}
