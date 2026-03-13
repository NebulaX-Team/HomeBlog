import Link from 'next/link';
import { BackLink } from './BackLink';

export type PageNavItem = {
  label: string;
  href: string;
};

export type PageNavProps = {
  items: PageNavItem[];
  activePath: string;
  showBack?: boolean;
  className?: string;
  align?: 'left' | 'right';
};

export function PageNav({ items, activePath, showBack = true, className, align = 'left' }: PageNavProps) {
  const rootClass = [
    'page-nav',
    align === 'right' ? 'page-nav--right' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={rootClass}>
      <div className="page-nav__links">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`page-nav__link${activePath === item.href ? ' page-nav__link--active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {showBack ? <BackLink /> : null}
    </nav>
  );
}
