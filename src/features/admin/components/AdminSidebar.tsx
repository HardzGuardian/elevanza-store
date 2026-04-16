'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, ListOrdered, Users,
  Settings, LogOut, Layers, FileText, Tag, ExternalLink,
} from 'lucide-react';
import { cn } from '@/core/utils';
import { signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Products',   href: '/admin/products',   icon: ShoppingBag },
  { label: 'Categories', href: '/admin/taxonomy',   icon: Layers },
  { label: 'Orders',     href: '/admin/orders',     icon: ListOrdered },
  { label: 'Customers',  href: '/admin/customers',  icon: Users },
  { label: 'Pages',      href: '/admin/pages',      icon: FileText },
  { label: 'Festivals',  href: '/admin/festivals',  icon: Tag },
  { label: 'Settings',   href: '/admin/settings',   icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-neutral-100 bg-white flex flex-col h-full flex-shrink-0">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-neutral-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-bold tracking-tight text-neutral-900">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors',
                active
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-neutral-100 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
          View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
