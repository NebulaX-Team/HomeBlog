/**
 * 服务端安全的预览用组件，供 /api/preview 使用（避免 client 组件在 server 中调用报错）。
 * 与 @homeblog/rich-text-renderer 的 Callout/CodeBlock/Mermaid 结构一致，便于复用样式。
 */
import type { ReactNode } from 'react';

const calloutTitles: Record<string, string> = {
  note: '提示',
  tip: '技巧',
  info: '信息',
  caution: '注意',
  danger: '危险',
  warning: '警告'
};

export type ServerCalloutProps = {
  type?: 'note' | 'tip' | 'info' | 'caution' | 'danger' | 'warning';
  title?: string;
  children?: ReactNode;
};

export function ServerCallout({ type = 'note', title, children }: ServerCalloutProps) {
  const resolvedType = type === 'warning' ? 'caution' : type;
  const label = title || calloutTitles[resolvedType] || 'Note';
  return (
    <div className={`rt-callout rt-callout--${resolvedType}`}>
      <div className="rt-callout__title">{label}</div>
      <div className="rt-callout__body">{children}</div>
    </div>
  );
}

export function ServerCodeBlock({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLPreElement>) {
  const lang = (rest as Record<string, unknown>)['data-language'] as string | undefined;
  return (
    <div className="rt-codeblock">
      <div className="rt-codeblock__toolbar">
        {lang ? <span className="rt-codeblock__lang">{lang}</span> : null}
      </div>
      <pre className={className} {...rest}>
        {children}
      </pre>
    </div>
  );
}

export type ServerMermaidProps = {
  code: string;
  className?: string;
};

/** 输出带 class="mermaid" 的 div，前端注入预览后可执行 mermaid.run() 渲染 */
export function ServerMermaid({ code, className }: ServerMermaidProps) {
  return (
    <div className={`rt-mermaid ${className || ''}`.trim()}>
      <div className="mermaid" data-content={code}>
        {code}
      </div>
    </div>
  );
}
