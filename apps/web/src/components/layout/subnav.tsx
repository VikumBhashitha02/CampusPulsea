'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/cn';
import { isNavItemActive, type NavItem } from '../../lib/navigation';

export function Subnav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-cp-border bg-cp-surface">
      <nav
        aria-label={label}
        className="cp-page flex gap-1 overflow-x-auto"
      >
        {items.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'shrink-0 px-3 py-3 text-sm font-semibold border-b-2 transition-colors',
                active
                  ? 'border-cp-yellow text-cp-navy'
                  : 'border-transparent text-cp-muted hover:text-cp-navy',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
