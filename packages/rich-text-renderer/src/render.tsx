import { run } from '@mdx-js/mdx';
import * as jsxRuntime from 'react/jsx-runtime';
import type { ReactElement, ComponentType } from 'react';
import type { CompiledMDX } from './compile';

export type RenderOptions = {
  components?: Record<string, ComponentType<any>>;
};

export async function renderMDX(
  compiled: CompiledMDX | string,
  options: RenderOptions = {}
): Promise<ReactElement> {
  const code = typeof compiled === 'string' ? compiled : compiled.code;
  const { default: MDXContent } = await run(code, {
    ...jsxRuntime
  });
  return <MDXContent components={options.components || {}} />;
}
