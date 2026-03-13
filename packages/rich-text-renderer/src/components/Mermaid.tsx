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
        const muted = getVar('--color-muted', '#6e6e6e');
        const bg = getVar('--color-bg', '#ffffff');
        const card = getVar('--color-card', '#ffffff');
        const cardMuted = getVar('--color-card-muted', '#f6f6f6');
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
            primaryColor: cardMuted,
            primaryTextColor: text,
            primaryBorderColor: muted,
            lineColor: muted,
            secondaryColor: card,
            tertiaryColor: bg
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
