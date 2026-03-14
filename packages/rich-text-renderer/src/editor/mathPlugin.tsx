'use client';

/**
 * MDXEditor plugin: Inline & block math ($...$, $$...$$) rendered via KaTeX.
 *
 * Registers:
 *   - micromark-extension-math  → tokenizer for `$` / `$$`
 *   - mdast-util-math           → MDAST ↔ markdown round-trip
 *   - Two custom Lexical DecoratorNodes  (InlineMathNode, BlockMathNode)
 *   - Import visitors (MDAST → Lexical)
 *   - Export visitors (Lexical → MDAST)
 */
import { useState, useCallback, useEffect, type JSX } from 'react';
import {
  DecoratorNode,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  $getNodeByKey,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  realmPlugin,
  addImportVisitor$,
  addExportVisitor$,
  addLexicalNode$,
  addMdastExtension$,
  addSyntaxExtension$,
  addToMarkdownExtension$,
} from '@mdxeditor/editor';
import { math as mathSyntax } from 'micromark-extension-math';
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math';

/* ================================================================
 *  KaTeX render helper (lazy-loaded)
 * ================================================================ */
async function renderKatex(tex: string, displayMode: boolean): Promise<string> {
  const katex = (await import('katex')).default;
  return katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    output: 'htmlAndMathml',
  });
}

/* ================================================================
 *  React components for rendering inside the editor
 * ================================================================ */

function InlineMathComponent({ nodeKey, value }: { nodeKey: string; value: string }) {
  const [editor] = useLexicalComposerContext();
  const [html, setHtml] = useState('');
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!editing) renderKatex(value, false).then(setHtml);
  }, [value, editing]);

  const commit = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && $isInlineMathNode(node)) {
        node.setValue(localValue);
      }
    });
    setEditing(false);
  }, [editor, nodeKey, localValue]);

  if (editing) {
    return (
      <span className="editor-math-inline-edit">
        <code>$</code>
        <input
          className="editor-math-inline-input"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { setLocalValue(value); setEditing(false); }
          }}
          autoFocus
        />
        <code>$</code>
      </span>
    );
  }

  return (
    <span
      className="editor-math-inline"
      onClick={() => { setLocalValue(value); setEditing(true); }}
      title="点击编辑公式"
      dangerouslySetInnerHTML={{ __html: html || `$${value}$` }}
    />
  );
}

function BlockMathComponent({ nodeKey, value }: { nodeKey: string; value: string }) {
  const [editor] = useLexicalComposerContext();
  const [html, setHtml] = useState('');
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!editing) renderKatex(value, true).then(setHtml);
  }, [value, editing]);

  const commit = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && $isBlockMathNode(node)) {
        node.setValue(localValue);
      }
    });
    setEditing(false);
  }, [editor, nodeKey, localValue]);

  if (editing) {
    return (
      <div className="editor-custom-block editor-custom-block--math">
        <div className="editor-custom-block__label">数学公式 (块级)</div>
        <textarea
          className="editor-custom-block__textarea"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          rows={3}
          autoFocus
        />
        <button type="button" className="editor-custom-block__btn" onClick={commit}>
          确定
        </button>
      </div>
    );
  }

  return (
    <div
      className="editor-custom-block editor-custom-block--math"
      onClick={() => { setLocalValue(value); setEditing(true); }}
      title="点击编辑公式"
    >
      <div className="editor-custom-block__label">数学公式 (点击编辑)</div>
      <div dangerouslySetInnerHTML={{ __html: html || `$$${value}$$` }} />
    </div>
  );
}

/* ================================================================
 *  Lexical Nodes
 * ================================================================ */

type SerializedInlineMathNode = SerializedLexicalNode & { value: string; type: 'inline-math' };
type SerializedBlockMathNode = SerializedLexicalNode & { value: string; type: 'block-math' };

export class InlineMathNode extends DecoratorNode<JSX.Element> {
  __value: string;

  static getType(): string {
    return 'inline-math';
  }

  static clone(node: InlineMathNode): InlineMathNode {
    return new InlineMathNode(node.__value, node.__key);
  }

  static importJSON(json: SerializedInlineMathNode): InlineMathNode {
    return new InlineMathNode(json.value);
  }

  constructor(value: string, key?: NodeKey) {
    super(key);
    this.__value = value;
  }

  exportJSON(): SerializedInlineMathNode {
    return { type: 'inline-math', value: this.__value, version: 1 };
  }

  createDOM(_config: EditorConfig): HTMLSpanElement {
    const el = document.createElement('span');
    el.className = 'editor-math-inline-wrap';
    return el;
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('span');
    el.textContent = `$${this.__value}$`;
    return { element: el };
  }

  updateDOM(): false {
    return false;
  }

  getValue(): string {
    return this.__value;
  }

  setValue(value: string): void {
    const writable = this.getWritable();
    writable.__value = value;
  }

  isInline(): boolean {
    return true;
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return <InlineMathComponent nodeKey={this.__key} value={this.__value} />;
  }
}

export function $isInlineMathNode(node: LexicalNode | null | undefined): node is InlineMathNode {
  return node instanceof InlineMathNode;
}

export class BlockMathNode extends DecoratorNode<JSX.Element> {
  __value: string;

  static getType(): string {
    return 'block-math';
  }

  static clone(node: BlockMathNode): BlockMathNode {
    return new BlockMathNode(node.__value, node.__key);
  }

  static importJSON(json: SerializedBlockMathNode): BlockMathNode {
    return new BlockMathNode(json.value);
  }

  constructor(value: string, key?: NodeKey) {
    super(key);
    this.__value = value;
  }

  exportJSON(): SerializedBlockMathNode {
    return { type: 'block-math', value: this.__value, version: 1 };
  }

  createDOM(_config: EditorConfig): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'editor-math-block-wrap';
    return el;
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('div');
    el.textContent = `$$\n${this.__value}\n$$`;
    return { element: el };
  }

  updateDOM(): false {
    return false;
  }

  getValue(): string {
    return this.__value;
  }

  setValue(value: string): void {
    const writable = this.getWritable();
    writable.__value = value;
  }

  isInline(): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return <BlockMathComponent nodeKey={this.__key} value={this.__value} />;
  }
}

export function $isBlockMathNode(node: LexicalNode | null | undefined): node is BlockMathNode {
  return node instanceof BlockMathNode;
}

/* ================================================================
 *  MDAST → Lexical import visitors
 * ================================================================ */
const inlineMathImportVisitor = {
  testNode: 'inlineMath' as const,
  visitNode({ mdastNode, actions }: any) {
    actions.addAndStepInto(new InlineMathNode(mdastNode.value ?? ''));
  },
};

const blockMathImportVisitor = {
  testNode: 'math' as const,
  visitNode({ mdastNode, actions }: any) {
    actions.addAndStepInto(new BlockMathNode(mdastNode.value ?? ''));
  },
};

/* ================================================================
 *  Lexical → MDAST export visitors
 * ================================================================ */
const inlineMathExportVisitor = {
  testLexicalNode: $isInlineMathNode,
  visitLexicalNode({ lexicalNode, mdastParent, actions }: any) {
    actions.appendToParent(mdastParent, {
      type: 'inlineMath',
      value: (lexicalNode as InlineMathNode).getValue(),
    });
  },
};

const blockMathExportVisitor = {
  testLexicalNode: $isBlockMathNode,
  visitLexicalNode({ lexicalNode, mdastParent, actions }: any) {
    actions.appendToParent(mdastParent, {
      type: 'math',
      value: (lexicalNode as BlockMathNode).getValue(),
    });
  },
};

/* ================================================================
 *  The plugin itself
 * ================================================================ */
export const mathPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addSyntaxExtension$]: mathSyntax(),
      [addMdastExtension$]: mathFromMarkdown(),
      [addToMarkdownExtension$]: mathToMarkdown(),
      [addLexicalNode$]: [InlineMathNode, BlockMathNode],
      [addImportVisitor$]: [inlineMathImportVisitor, blockMathImportVisitor],
      [addExportVisitor$]: [inlineMathExportVisitor, blockMathExportVisitor],
    });
  },
});
