import type { ReactNode } from 'react';

const defaultTitles: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  info: 'Info'
};

export type CalloutProps = {
  type?: 'note' | 'tip' | 'warning' | 'info';
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
