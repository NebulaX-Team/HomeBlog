import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cx } from './utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} className={cx('hb-input', className)} {...props} />
));

Input.displayName = 'Input';
