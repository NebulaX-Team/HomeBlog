'use client';

import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';
import type { CodeThemeKey } from '@homeblog/rich-text-renderer';

const Editor = dynamic(
  () => import('@homeblog/rich-text-renderer/client').then((mod) => mod.InitializedMDXEditor),
  { ssr: false }
);

type MDXEditorWrapperProps = MDXEditorProps & {
  codeTheme?: CodeThemeKey | string;
};

export const MDXEditorWrapper = forwardRef<MDXEditorMethods, MDXEditorWrapperProps>((props, ref) => (
  <Editor {...props} editorRef={ref} />
));
MDXEditorWrapper.displayName = 'MDXEditorWrapper';
