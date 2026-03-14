import type { ReactNode } from 'react';
import { EditorView } from '../EditorView';
import { siteConfig } from '../../../../../../site.config';

export const metadata = {
  title: '新建文章 · HomeBlog'
};

export const dynamic = 'force-dynamic';

export default function NewEditorPage(): ReactNode {
  return (
    <main className="console-page console-page--editor">
      <EditorView slug={null} mode="new" codeTheme={siteConfig.codeTheme} />
    </main>
  );
}
