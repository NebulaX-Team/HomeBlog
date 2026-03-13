import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from './utils';

export type CardVariant = 'default' | 'muted';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cx('hb-card', variant === 'muted' ? 'hb-card--muted' : '', className)}
      {...props}
    />
  )
);

Card.displayName = 'Card';
