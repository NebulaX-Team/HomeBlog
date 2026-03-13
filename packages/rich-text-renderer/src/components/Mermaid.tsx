'use client';

import { useEffect, useMemo, useState } from 'react';

export type MermaidProps = {
  code: string;
  className?: string;
};

export function Mermaid({ code, className }: MermaidProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const id = useMemo(() => `mermaid-${hashString(code)}`, [code]);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mod = await import('mermaid');
        const mermaid = mod.default || mod;
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        const getVar = (name: string, fallback: string) =>
          styles.getPropertyValue(name).trim() || fallback;
        const text = getVar('--color-text', '#111111');
        const border = getVar('--color-border', '#d8d8d8');
        const primary = getVar('--color-primary', '#2f2f2f');
        const bg = getVar('--color-bg', '#ffffff');
        const font = getVar('--font-sans', 'system-ui, sans-serif');

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          flowchart: {
            curve: 'basis',
            padding: 8
          },
          themeVariables: {
            fontFamily: font,
            fontSize: '14px',
            primaryColor: bg,
            primaryTextColor: text,
            primaryBorderColor: primary,
            lineColor: border,
            secondaryColor: bg,
            tertiaryColor: '#f7f7f7'
          }
        });
        const result = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(result.svg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Mermaid render failed');
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [code, id]);

  return (
    <div className={`rt-mermaid ${className || ''}`.trim()} data-mermaid-id={id}>
      {error ? (
        <pre>{code}</pre>
      ) : svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <pre>{code}</pre>
      )}
    </div>
  );
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}
