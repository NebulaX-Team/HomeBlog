import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';
import type { PluggableList } from 'unified';

export type RendererPluginOptions = {
  enableMermaid?: boolean;
  enableMath?: boolean;
  languages?: string[];
  highlighterTheme?: string;
};

const defaultLanguages = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'json',
  'yaml',
  'toml',
  'html',
  'css',
  'markdown',
  'mdx',
  'bash',
  'shell',
  'python',
  'go',
  'rust',
  'java',
  'c',
  'cpp',
  'sql',
  'graphql',
  'dockerfile'
];

export function createRemarkPlugins(options: RendererPluginOptions): PluggableList {
  const plugins: PluggableList = [
    remarkFrontmatter,
    remarkGfm,
    remarkMath,
    remarkDirective,
    remarkCalloutDirectives
  ];

  if (options.enableMermaid !== false) {
    plugins.push(remarkMermaidToMdx);
  }

  return plugins;
}

export function createRehypePlugins(options: RendererPluginOptions): PluggableList {
  const theme =
    options.highlighterTheme || ({ light: 'github-light', dark: 'github-dark' } as const);

  const plugins: PluggableList = [
    [
      rehypePrettyCode,
      {
        theme,
        keepBackground: false,
        defaultLang: 'text',
        onVisitLine(node: { children: unknown[] }) {
          if (node.children.length === 0) {
            node.children = [{ type: 'text', value: ' ' }];
          }
        },
        onVisitHighlightedLine(node: { properties?: Record<string, unknown> }) {
          if (!node.properties) node.properties = {};
          const className = (node.properties.className || []) as string[];
          className.push('line--highlighted');
          node.properties.className = className;
        },
        onVisitHighlightedWord(node: { properties?: Record<string, unknown> }) {
          node.properties = node.properties || {};
          node.properties.className = ['word--highlighted'];
        }
      }
    ],
    rehypeSlug
  ];

  if (options.enableMath !== false) {
    plugins.push(rehypeKatex);
  }

  return plugins;
}

function remarkMermaidToMdx() {
  return (tree: unknown) => {
    visit(tree as any, 'code', (node: any, index: number | undefined, parent: any) => {
      if (!parent || typeof index !== 'number') return;
      if (!node.lang || node.lang.toLowerCase() !== 'mermaid') return;
      const value = node.value || '';
      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'code',
            value
          }
        ],
        children: []
      };
    });
  };
}

const calloutTypes = new Set(['note', 'tip', 'warning', 'info']);

function remarkCalloutDirectives() {
  return (tree: unknown) => {
    visit(tree as any, 'containerDirective', (node: any, index: number | undefined, parent: any) => {
      if (!parent || typeof index !== 'number') return;
      if (!node.name || !calloutTypes.has(node.name)) return;
      const title = typeof node.attributes?.title === 'string' ? node.attributes?.title : undefined;
      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Callout',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'type',
            value: node.name
          },
          ...(title
            ? [
                {
                  type: 'mdxJsxAttribute',
                  name: 'title',
                  value: title
                }
              ]
            : [])
        ],
        children: node.children || []
      };
    });
  };
}
