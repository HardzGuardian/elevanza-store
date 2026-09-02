'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LABELS: Record<string, string> = {
  admin:     'Admin',
  dashboard: 'Dashboard',
  products:  'Products',
  taxonomy:  'Categories',
  orders:    'Orders',
  customers: 'Customers',
  pages:     'Pages',
  festivals: 'Festivals',
  settings:  'Settings',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-[11px] font-semibold">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const href   = '/' + segments.slice(0, i + 1).join('/');
        const label  = LABELS[seg] ?? (seg.match(/^\d+$/) ? `#${seg.padStart(5, '0')}` : seg);

        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-neutral-300 font-normal">/</span>}
            {isLast ? (
              <span className="text-neutral-900">{label}</span>
            ) : (
              <Link href={href} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
