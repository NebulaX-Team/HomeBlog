import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cx } from './utils';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cx('hb-textarea', className)} {...props} />
));

Textarea.displayName = 'Textarea';
