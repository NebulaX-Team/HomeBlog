'use client';

import { useCallback, useMemo, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return '';
}

export function CodeBlock({ children, className, ...rest }: HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const language = (rest as Record<string, unknown>)['data-language'] as string | undefined;
  const codeText = useMemo(() => extractText(children), [children]);

  const onCopy = useCallback(async () => {
    if (!codeText) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      setCopied(false);
    }
  }, [codeText]);

  return (
    <div className="rt-codeblock">
      <div className="rt-codeblock__toolbar">
        {language ? <span className="rt-codeblock__lang">{language}</span> : null}
        <button type="button" className="rt-codeblock__copy" onClick={onCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={className} {...rest}>
        {children}
      </pre>
    </div>
  );
}
