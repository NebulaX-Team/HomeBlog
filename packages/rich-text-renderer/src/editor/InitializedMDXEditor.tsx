'use client';

import type { ForwardedRef } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCellValues } from '@mdxeditor/gurx';
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  type CodeBlockEditorDescriptor,
  type CodeBlockEditorProps,
  type DirectiveDescriptor,
  CodeMirrorEditor,
  useCodeBlockEditorContext,
  NestedLexicalEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  diffSourcePlugin,
  directivesPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertAdmonition,
  InsertCodeBlock,
  CodeToggle,
  ListsToggle,
  Separator,
  UndoRedo,
  DiffSourceToggleWrapper,
  InsertThematicBreak,
  iconComponentFor$,
  readOnly$,
  codeBlockLanguages$,
  addComposerChild$,
  addNestedEditorChild$,
  addTableCellEditorChild$,
  realmPlugin,
  CodeBlockNode,
  $createCodeBlockNode,
  $createDirectiveNode
} from '@mdxeditor/editor';
import type { Extension } from '@codemirror/state';
import {
  $getSelection,
  $isRangeSelection,
  $isParagraphNode,
  $createNodeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
  type LexicalNode
} from 'lexical';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import type { ContainerDirective } from 'mdast-util-directive';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  ORDERED_LIST,
  UNORDERED_LIST,
  CHECK_LIST,
  LINK,
  QUOTE,
  HEADING,
  type Transformer,
  type MultilineElementTransformer,
  type TextMatchTransformer
} from '@lexical/markdown';
import { HorizontalRuleNode, $createHorizontalRuleNode, $isHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import '@mdxeditor/editor/style.css';
import { mathPlugin, InlineMathNode } from './mathPlugin';
import { resolveCodeTheme, type CodeThemeKey } from '../theme';

/* ================================================================
 *  中文翻译
 * ================================================================ */
const zhCN: Record<string, string> = {
  'toolbar.undo': '撤销 {{shortcut}}',
  'toolbar.redo': '重做 {{shortcut}}',
  'toolbar.bold': '加粗',
  'toolbar.removeBold': '取消加粗',
  'toolbar.italic': '斜体',
  'toolbar.removeItalic': '取消斜体',
  'toolbar.underline': '下划线',
  'toolbar.removeUnderline': '取消下划线',
  'toolbar.inlineCode': '行内代码',
  'toolbar.removeInlineCode': '取消行内代码',
  'toolbar.strikethrough': '删除线',
  'toolbar.removeStrikethrough': '取消删除线',
  'toolbar.superscript': '上标',
  'toolbar.removeSuperscript': '取消上标',
  'toolbar.subscript': '下标',
  'toolbar.removeSubscript': '取消下标',
  'toolbar.highlight': '高亮',
  'toolbar.removeHighlight': '取消高亮',
  'toolbar.bulletedList': '无序列表',
  'toolbar.numberedList': '有序列表',
  'toolbar.checkList': '任务列表',
  'toolbar.link': '插入链接',
  'toolbar.image': '插入图片',
  'toolbar.table': '插入表格',
  'toolbar.codeBlock': '插入代码块',
  'toolbar.admonition': '插入提示框',
  'toolbar.thematicBreak': '插入分割线',
  'toolbar.blockTypeSelect.placeholder': '段落类型',
  'toolbar.blockTypeSelect.selectBlockTypeTooltip': '选择段落类型',
  'toolbar.blockTypes.paragraph': '正文',
  'toolbar.blockTypes.heading': '标题 {{level}}',
  'toolbar.blockTypes.quote': '引用',
  'toolbar.richText': '富文本',
  'toolbar.source': '源码',
  'toolbar.diffMode': '差异对比',
  'toolbar.editFrontmatter': '编辑 Frontmatter',
  'toolbar.insertFrontmatter': '插入 Frontmatter',
  'admonitions.note': '提示',
  'admonitions.tip': '技巧',
  'admonitions.warning': '警告',
  'admonitions.info': '信息',
  'admonitions.caution': '注意',
  'admonitions.danger': '危险',
  'admonitions.changeType': '更改提示框类型',
  'admonitions.placeholder': '提示框类型',
  'codeBlock.language': '代码语言',
  'codeBlock.selectLanguage': '选择代码语言',
  'codeblock.delete': '删除代码块',
};

function translate(key: string, defaultValue: string, interpolations?: Record<string, any>): string {
  let result = zhCN[key] ?? defaultValue;
  if (interpolations) {
    for (const [k, v] of Object.entries(interpolations)) {
      result = result.replace(`{{${k}}}`, String(v));
    }
  }
  return result;
}

/* ================================================================
 *  主题与颜色模式
 * ================================================================ */
type ColorScheme = 'light' | 'dark';

const CODE_MIRROR_THEMES: Record<CodeThemeKey, { light: Extension; dark: Extension }> = {
  github: {
    light: githubLight,
    dark: githubDark
  },
  'one-dark': {
    light: githubLight,
    dark: oneDark
  }
};

function useResolvedColorScheme(): ColorScheme {
  const getScheme = useCallback((): ColorScheme => {
    if (typeof document === 'undefined') return 'light';
    const theme = document.documentElement.dataset.theme;
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const [scheme, setScheme] = useState<ColorScheme>(getScheme);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setScheme(getScheme()));
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [getScheme]);

  return scheme;
}

/* ================================================================
 *  可搜索下拉
 * ================================================================ */
type SelectItem = { value: string; label: string };

function SearchableSelect({
  value,
  items,
  placeholder,
  onChange,
  disabled
}: {
  value: string;
  items: SelectItem[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => items.find((item) => item.value === value), [items, value]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const label = item.label.toLowerCase();
      const val = item.value.toLowerCase();
      return label.includes(q) || val.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className={`hb-code-select ${open ? 'hb-code-select--open' : ''}`}>
      <button
        type="button"
        className="hb-code-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="hb-code-select__value">{selected?.label ?? placeholder}</span>
        <span className="hb-code-select__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div role="listbox" className="hb-code-select__menu">
          <div className="hb-code-select__search">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索语言"
            />
          </div>
          <div className="hb-code-select__options">
            {filtered.map((item) => {
              const isActive = item.value === value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`hb-code-select__option ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              );
            })}
            {!filtered.length ? <div className="hb-code-select__empty">无匹配结果</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ================================================================
 *  Callout 指令 (与博客页 rt-callout 样式一致)
 * ================================================================ */
const CALLOUT_TYPES = ['note', 'tip', 'warning', 'info', 'danger', 'caution'] as const;
const CALLOUT_TITLES: Record<string, string> = {
  note: '提示',
  tip: '技巧',
  warning: '警告',
  info: '信息',
  danger: '危险',
  caution: '注意'
};

function CalloutEditor({ mdastNode }: { mdastNode: ContainerDirective }) {
  const kind = mdastNode.name ?? 'note';
  const label = CALLOUT_TITLES[kind] || 'Note';
  return (
    <div className={`rt-callout rt-callout--${kind}`}>
      <div className="rt-callout__title">{label}</div>
      <div className="rt-callout__body">
        <NestedLexicalEditor<ContainerDirective>
          getContent={(node) => node.children as any}
          getUpdatedMdastNode={(node, children) => ({ ...node, children: children as any })}
        />
      </div>
    </div>
  );
}

const CalloutDirectiveDescriptor: DirectiveDescriptor = {
  name: 'callout',
  testNode(node) {
    return node.type === 'containerDirective' && CALLOUT_TYPES.includes(node.name as any);
  },
  attributes: [],
  hasChildren: true,
  type: 'containerDirective',
  Editor: CalloutEditor as any
};

/* ================================================================
 *  Mermaid 代码块内联渲染
 * ================================================================ */
function MermaidCodeBlockEditor({ code }: CodeBlockEditorProps) {
  const ctx = useCodeBlockEditorContext();
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!code.trim());
  const [localCode, setLocalCode] = useState(code);

  const render = useCallback(async (src: string) => {
    if (!src.trim()) { setSvg(''); return; }
    try {
      const mod = await import('mermaid');
      const mermaid = mod.default || mod;
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const getVar = (name: string, fb: string) => styles.getPropertyValue(name).trim() || fb;
      mermaid.initialize({
        startOnLoad: false, securityLevel: 'strict', theme: 'base',
        themeVariables: {
          fontFamily: getVar('--font-sans', 'system-ui, sans-serif'), fontSize: '14px',
          primaryColor: getVar('--color-card-muted', '#f6f6f6'),
          primaryTextColor: getVar('--color-text', '#111'),
          primaryBorderColor: getVar('--color-muted', '#6e6e6e'),
          lineColor: getVar('--color-muted', '#6e6e6e'),
          secondaryColor: getVar('--color-card', '#fff'),
          tertiaryColor: getVar('--color-bg', '#fff')
        }
      });
      const result = await mermaid.render(`mermaid-editor-${Date.now()}`, src);
      setSvg(result.svg); setError(null);
    } catch { setError('Mermaid 渲染失败，请检查语法'); }
  }, []);

  useEffect(() => { if (!editing && code.trim()) render(code); }, [code, editing, render]);

  if (editing) {
    return (
      <div className="editor-custom-block editor-custom-block--mermaid">
        <div className="editor-custom-block__label">Mermaid 流程图</div>
        <textarea className="editor-custom-block__textarea" value={localCode}
          onChange={(e) => { setLocalCode(e.target.value); ctx.setCode(e.target.value); }}
          placeholder={'graph TD\n  A[开始] --> B[结束]'} rows={6} />
        <button type="button" className="editor-custom-block__btn"
          onClick={() => { setEditing(false); render(localCode); }}>渲染预览</button>
      </div>
    );
  }

  return (
    <div className="editor-custom-block editor-custom-block--mermaid"
      onClick={() => setEditing(true)} title="点击编辑">
      <div className="editor-custom-block__label">Mermaid 流程图 (点击编辑)</div>
      {error ? <pre className="editor-custom-block__error">{error}</pre>
        : svg ? <div dangerouslySetInnerHTML={{ __html: svg }} />
        : <pre className="editor-custom-block__placeholder">{code}</pre>}
    </div>
  );
}

/* ================================================================
 *  Math 代码块内联渲染 (```math)
 * ================================================================ */
function MathCodeBlockEditor({ code }: CodeBlockEditorProps) {
  const ctx = useCodeBlockEditorContext();
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!code.trim());
  const [localCode, setLocalCode] = useState(code);

  const render = useCallback(async (src: string) => {
    if (!src.trim()) { setHtml(''); return; }
    try {
      const katex = (await import('katex')).default;
      setHtml(katex.renderToString(src, { displayMode: true, throwOnError: false, output: 'htmlAndMathml' }));
      setError(null);
    } catch { setError('KaTeX 渲染失败，请检查语法'); }
  }, []);

  useEffect(() => { if (!editing && code.trim()) render(code); }, [code, editing, render]);

  if (editing) {
    return (
      <div className="editor-custom-block editor-custom-block--math">
        <div className="editor-custom-block__label">数学公式 (KaTeX)</div>
        <textarea className="editor-custom-block__textarea" value={localCode}
          onChange={(e) => { setLocalCode(e.target.value); ctx.setCode(e.target.value); }}
          placeholder={'E = mc^2'} rows={3} />
        <button type="button" className="editor-custom-block__btn"
          onClick={() => { setEditing(false); render(localCode); }}>渲染预览</button>
      </div>
    );
  }

  return (
    <div className="editor-custom-block editor-custom-block--math"
      onClick={() => setEditing(true)} title="点击编辑">
      <div className="editor-custom-block__label">数学公式 (点击编辑)</div>
      {error ? <pre className="editor-custom-block__error">{error}</pre>
        : html ? <div dangerouslySetInnerHTML={{ __html: html }} />
        : <pre className="editor-custom-block__placeholder">{code}</pre>}
    </div>
  );
}

/* ================================================================
 *  CodeMirror 代码块（可搜索语言）
 * ================================================================ */
const EMPTY_VALUE = '__EMPTY_VALUE__';

function SearchableCodeMirrorEditor(props: CodeBlockEditorProps) {
  const { parentEditor, lexicalNode, setLanguage } = useCodeBlockEditorContext();
  const [readOnly, iconComponentFor, codeBlockLanguages] = useCellValues(
    readOnly$,
    iconComponentFor$,
    codeBlockLanguages$
  );

  const normalized = useMemo(() => normalizeCodeLanguage(props.language), [props.language]);
  useEffect(() => {
    if ((props.language ?? '') !== normalized) {
      setLanguage(normalized);
    }
  }, [normalized, props.language, setLanguage]);

  const languageItems = useMemo(
    () => Object.entries(codeBlockLanguages).map(([value, label]) => ({ value: value || EMPTY_VALUE, label })),
    [codeBlockLanguages]
  );

  const currentLanguage = normalized === '' ? EMPTY_VALUE : normalized;

  return (
    <div className="mdxeditor-codeblock">
      <div className="mdxeditor-codeblock__toolbar">
        <SearchableSelect
          value={currentLanguage}
          items={languageItems}
          placeholder={translate('codeBlock.language', '代码语言')}
          onChange={(next) => {
            parentEditor.update(() => {
              lexicalNode.setLanguage(next === EMPTY_VALUE ? '' : next);
              setTimeout(() => {
                parentEditor.update(() => {
                  lexicalNode.getLatest().select();
                });
              });
            });
          }}
          disabled={readOnly}
        />
        <button
          className="mdxeditor-codeblock__delete"
          type="button"
          disabled={readOnly}
          title={translate('codeblock.delete', '删除代码块')}
          onClick={(e) => {
            e.preventDefault();
            parentEditor.update(() => {
              lexicalNode.remove();
            });
          }}
        >
          {iconComponentFor('delete_small')}
        </button>
      </div>
      <div className="mdxeditor-codeblock__body">
        <CodeMirrorEditor {...props} language={normalized} />
      </div>
    </div>
  );
}

/* ================================================================
 *  代码块描述器
 * ================================================================ */
const mermaidDescriptor: CodeBlockEditorDescriptor = {
  match: (lang) => lang === 'mermaid',
  priority: 3,
  Editor: MermaidCodeBlockEditor
};
const mathDescriptor: CodeBlockEditorDescriptor = {
  match: (lang) => lang === 'math' || lang === 'latex' || lang === 'katex',
  priority: 3,
  Editor: MathCodeBlockEditor
};
const codeMirrorDescriptor: CodeBlockEditorDescriptor = {
  match: () => true,
  priority: 2,
  Editor: SearchableCodeMirrorEditor
};

const CODE_BLOCK_LANGUAGES: Record<string, string> = {
  '': '纯文本',
  js: 'JavaScript',
  ts: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  json: 'JSON',
  json5: 'JSON5',
  yaml: 'YAML',
  toml: 'TOML',
  md: 'Markdown',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  bash: 'Shell',
  powershell: 'PowerShell',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  swift: 'Swift',
  php: 'PHP',
  ruby: 'Ruby',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  sql: 'SQL',
  dockerfile: 'Dockerfile',
  nginx: 'Nginx',
  xml: 'XML',
  ini: 'INI',
  diff: 'Diff',
  lua: 'Lua',
  dart: 'Dart',
  scala: 'Scala',
  mermaid: 'Mermaid',
  math: 'Math',
  latex: 'LaTeX'
};

const CODE_BLOCK_ALIASES: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
  yml: 'yaml',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  py: 'python',
  rb: 'ruby',
  golang: 'go',
  ps: 'powershell',
  ps1: 'powershell',
  jsonc: 'json',
  tex: 'latex'
};

function normalizeCodeLanguage(lang?: string | null) {
  const value = (lang ?? '').toLowerCase().trim();
  if (!value) return '';
  if (Object.hasOwn(CODE_BLOCK_LANGUAGES, value)) return value;
  if (Object.hasOwn(CODE_BLOCK_ALIASES, value)) return CODE_BLOCK_ALIASES[value];
  return '';
}

/* ================================================================
 *  Markdown 快捷输入（支持代码块/提示框/行内数学）
 * ================================================================ */
const THEMATIC_BREAK: Transformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => ($isHorizontalRuleNode(node) ? '***' : null),
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }
    line.selectNext();
  },
  type: 'element'
};

const CODE_START_REGEX = /^[ \t]*```([\w-]+)?/;
const CODE_END_REGEX = /[ \t]*```$/;

const CODE_BLOCK_TRANSFORMER: MultilineElementTransformer = {
  dependencies: [CodeBlockNode],
  regExpStart: CODE_START_REGEX,
  regExpEnd: { optional: true, regExp: CODE_END_REGEX },
  replace: (parentNode, _children, match, _endMatch, _linesInBetween, isImport) => {
    if (isImport) return false;
    const rawLang = (match?.[1] ?? '').toLowerCase();
    const language = normalizeCodeLanguage(rawLang) || rawLang;
    const codeBlockNode = $createCodeBlockNode({ code: '', language, meta: '' });
    parentNode.replace(codeBlockNode);
    selectDecoratorNode(codeBlockNode);
    codeBlockNode.select();
  },
  type: 'multiline-element'
};

const INLINE_MATH_TRANSFORMER: TextMatchTransformer = {
  dependencies: [InlineMathNode],
  regExp: /\$([^$\n]+)\$$/,
  replace: (textNode, match) => {
    const value = match[1]?.trim();
    if (!value) return;
    textNode.replace(new InlineMathNode(value));
  },
  trigger: '$',
  type: 'text-match'
};

const LIST_TRANSFORMERS = new Set<Transformer>([ORDERED_LIST, UNORDERED_LIST, CHECK_LIST]);

function selectDecoratorNode(node: LexicalNode) {
  const selection = $createNodeSelection();
  selection.add(node.getKey());
  $setSelection(selection);
}

function buildMarkdownTransformers(): Transformer[] {
  return [
    BOLD_ITALIC_STAR,
    BOLD_ITALIC_UNDERSCORE,
    BOLD_STAR,
    BOLD_UNDERSCORE,
    INLINE_CODE,
    ITALIC_STAR,
    ITALIC_UNDERSCORE,
    INLINE_MATH_TRANSFORMER,
    HEADING,
    THEMATIC_BREAK,
    QUOTE,
    LINK,
    ORDERED_LIST,
    UNORDERED_LIST,
    CHECK_LIST,
    CODE_BLOCK_TRANSFORMER
  ];
}

const markdownShortcutsPlugin = realmPlugin({
  init(realm) {
    const transformers = buildMarkdownTransformers();
    const tableCellTransformers = transformers.filter((t) => !LIST_TRANSFORMERS.has(t));
    realm.pubIn({
      [addComposerChild$]: () => <MarkdownShortcutPlugin transformers={transformers} />,
      [addNestedEditorChild$]: () => <MarkdownShortcutPlugin transformers={transformers} />,
      [addTableCellEditorChild$]: () => <MarkdownShortcutPlugin transformers={tableCellTransformers} />
    });
  }
});

function BlockShortcuts() {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

          const anchorNode = selection.anchor.getNode();
          const paragraph = anchorNode.getTopLevelElementOrThrow();
          if (!$isParagraphNode(paragraph)) return false;

          const text = paragraph.getTextContent();
          if (!text.trim()) return false;

          const codeMatch = text.match(/^\s*```([\w-]+)?\s*$/);
          if (codeMatch) {
            event?.preventDefault();
            const rawLang = (codeMatch[1] ?? '').toLowerCase();
            const language = normalizeCodeLanguage(rawLang) || rawLang;
            const codeBlockNode = $createCodeBlockNode({ code: '', language, meta: '' });
            paragraph.replace(codeBlockNode);
            selectDecoratorNode(codeBlockNode);
            codeBlockNode.select();
            return true;
          }

          const directiveMatch = text.match(/^\s*:::(\w+)(?:\s+(.+))?\s*$/);
          if (directiveMatch) {
            const rawType = directiveMatch[1].toLowerCase();
            if (!CALLOUT_TYPES.includes(rawType as any)) return false;
            event?.preventDefault();
            const title = directiveMatch[2]?.trim();
            const mdastNode: ContainerDirective = {
              type: 'containerDirective',
              name: rawType,
              attributes: title ? { title } : {},
              children: []
            };
            const directiveNode = $createDirectiveNode(mdastNode);
            paragraph.replace(directiveNode);
            selectDecoratorNode(directiveNode);
            directiveNode.select();
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
    [editor]
  );

  return null;
}

const blockShortcutsPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addComposerChild$]: () => <BlockShortcuts />,
      [addNestedEditorChild$]: () => <BlockShortcuts />
    });
  }
});

/* ================================================================
 *  工具栏
 * ================================================================ */
function EditorToolbar() {
  return (
    <DiffSourceToggleWrapper>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      <Separator />
      <BlockTypeSelect />
      <ListsToggle />
      <Separator />
      <CreateLink />
      <InsertImage />
      <InsertTable />
      <Separator />
      <InsertCodeBlock />
      <InsertAdmonition />
      <InsertThematicBreak />
    </DiffSourceToggleWrapper>
  );
}

/* ================================================================
 *  主编辑器组件
 * ================================================================ */
export default function InitializedMDXEditor({
  editorRef,
  codeTheme,
  ...props
}: {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  codeTheme?: CodeThemeKey | string;
} & MDXEditorProps) {
  const scheme = useResolvedColorScheme();
  const resolvedTheme = resolveCodeTheme(codeTheme);
  const codeMirrorTheme = useMemo(() => {
    const target = CODE_MIRROR_THEMES[resolvedTheme.value] || CODE_MIRROR_THEMES.github;
    return scheme === 'dark' ? target.dark : target.light;
  }, [scheme, resolvedTheme.value]);

  const codeMirrorExtensions = useMemo(() => [codeMirrorTheme], [codeMirrorTheme]);

  return (
    <MDXEditor
      ref={editorRef}
      translation={translate}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutsPlugin(),
        blockShortcutsPlugin(),
        tablePlugin(),
        codeBlockPlugin({
          defaultCodeBlockLanguage: 'ts',
          codeBlockEditorDescriptors: [mermaidDescriptor, mathDescriptor, codeMirrorDescriptor]
        }),
        codeMirrorPlugin({
          codeBlockLanguages: CODE_BLOCK_LANGUAGES,
          codeMirrorExtensions
        }),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        directivesPlugin({ directiveDescriptors: [CalloutDirectiveDescriptor] }),
        diffSourcePlugin({ viewMode: 'rich-text' }),
        mathPlugin(),
        toolbarPlugin({ toolbarContents: () => <EditorToolbar /> })
      ]}
      {...props}
    />
  );
}
