import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cx } from './utils';

export type ButtonVariant = 'primary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cx(
        'hb-button',
        variant ? `hb-button--${variant}` : '',
        size && size !== 'md' ? `hb-button--${size}` : '',
        className
      )}
      {...props}
    />
  )
);

Button.displayName = 'Button';
