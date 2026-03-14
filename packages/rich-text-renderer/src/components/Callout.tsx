import type { ReactNode } from 'react';

const defaultTitles: Record<string, string> = {
  note: '提示',
  tip: '技巧',
  info: '信息',
  caution: '注意',
  danger: '危险',
  warning: '警告'
};

export type CalloutProps = {
  type?: 'note' | 'tip' | 'info' | 'caution' | 'danger' | 'warning';
  title?: string;
  children?: ReactNode;
};

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const label = title || defaultTitles[type] || 'Note';

  return (
    <div className={`rt-callout rt-callout--${type}`}>
      <div className="rt-callout__title">{label}</div>
      <div className="rt-callout__body">{children}</div>
    </div>
  );
}
