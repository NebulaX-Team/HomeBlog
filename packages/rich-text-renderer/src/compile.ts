import { compile } from '@mdx-js/mdx';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import type { PluggableList } from 'unified';
import { createRemarkPlugins, createRehypePlugins, type RendererPluginOptions } from './plugins';

export type TocItem = {
  id: string;
  depth: number;
  value: string;
};

export type CompileOptions = RendererPluginOptions & {
  input: string;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
};

export type CompiledMDX = {
  code: string;
  frontmatter: Record<string, unknown>;
  toc: TocItem[];
};

export async function compileMDX(options: CompileOptions): Promise<CompiledMDX> {
  const { content, data } = matter(options.input);
  const toc = extractToc(content);

  const remarkPlugins = [
    ...createRemarkPlugins(options),
    ...(options.remarkPlugins || [])
  ];
  const rehypePlugins = [
    ...createRehypePlugins(options),
    ...(options.rehypePlugins || [])
  ];

  const file = await compile(content, {
    outputFormat: 'function-body',
    jsxImportSource: 'react',
    remarkPlugins,
    rehypePlugins
  });

  return {
    code: String(file.value),
    frontmatter: data as Record<string, unknown>,
    toc
  };
}

export function extractToc(input: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(input);
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];

  visit(tree, 'heading', (node: { depth?: number; children?: unknown[] }) => {
    const value = toString(node as any).trim();
    if (!value) return;
    const depth = node.depth || 1;
    toc.push({
      id: slugger.slug(value),
      depth,
      value
    });
  });

  return toc;
}
