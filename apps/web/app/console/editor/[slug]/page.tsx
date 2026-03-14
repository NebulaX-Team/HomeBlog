import type { ReactNode } from 'react';
import { EditorView } from '../EditorView';
import { siteConfig } from '../../../../../../site.config';

export const metadata = {
  title: '编辑文章 · HomeBlog'
};

export const dynamic = 'force-dynamic';

export default async function EditEditorPage({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactNode> {
  const { slug } = await params;
  return (
    <main className="console-page console-page--editor">
      <EditorView slug={decodeURIComponent(slug)} mode="edit" codeTheme={siteConfig.codeTheme} />
    </main>
  );
}
