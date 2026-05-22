import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { desc, asc, count, eq } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';
import { cn } from '@/core/utils';
import { CustomerActions } from '@/features/admin/components/CustomerActions';

const PAGE_SIZE = 20;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; dir?: string; role?: string }>;
}) {
  const { page: pageParam, sort = 'joined', dir = 'desc', role = 'all' } = await searchParams;
  const pageNum = parseInt(pageParam || '1', 10);
  const page    = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  const offset  = (page - 1) * PAGE_SIZE;

  const roleFilter = role !== 'all' ? eq(users.role, role as any) : undefined;

  const sortCol = sort === 'name' ? users.name : users.createdAt;
  const sortFn  = dir === 'asc' ? asc : desc;

  function pageUrl(p: number) {
    const q = new URLSearchParams();
    if (sort !== 'joined') q.set('sort', sort);
    if (dir  !== 'desc')   q.set('dir',  dir);
    if (role !== 'all')    q.set('role', role);
    if (p > 1)             q.set('page', String(p));
    const s = q.toString();
    return `/admin/customers${s ? `?${s}` : ''}`;
  }

  function sortUrl(field: string) {
    const nextDir = sort === field && dir === 'asc' ? 'desc' : 'asc';
    const q = new URLSearchParams({ sort: field, dir: nextDir });
    if (role !== 'all') q.set('role', role);
    return `/admin/customers?${q.toString()}`;
  }

  function roleUrl(r: string) {
    const q = new URLSearchParams();
    if (r !== 'all')       q.set('role', r);
    if (sort !== 'joined') q.set('sort', sort);
    if (dir  !== 'desc')   q.set('dir',  dir);
    const s = q.toString();
    return `/admin/customers${s ? `?${s}` : ''}`;
  }

  const [allCustomers, [{ total }]] = await Promise.all([
    db.select().from(users).where(roleFilter).orderBy(sortFn(sortCol)).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(users).where(roleFilter),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function SortIndicator({ field }: { field: string }) {
    if (sort !== field) return <span className="text-neutral-300">↕</span>;
    return <span>{dir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div className="p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Customers</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage and view your registered user base.</p>
      </div>

      {/* Role filter pills */}
      <div className="flex gap-1.5">
        {(['all', 'customer', 'admin'] as const).map(r => (
          <Link
            key={r}
            href={roleUrl(r)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
              role === r
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200'
            )}
          >
            {r === 'all' ? 'All' : r}
          </Link>
        ))}
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <a
          href="/api/admin/export/customers"
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          ↓ Export CSV
        </a>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  <Link href={sortUrl('name')} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
                    Customer <SortIndicator field="name" />
                  </Link>
                </th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Role</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  <Link href={sortUrl('joined')} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
                    Joined <SortIndicator field="joined" />
                  </Link>
                </th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {allCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{customer.name}</p>
                        <p className="text-xs text-neutral-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={customer.role === 'admin' ? 'default' : 'secondary'} className="px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider">
                      {customer.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-neutral-500">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-xs text-neutral-500">Active</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Suspense fallback={<div className="h-8 w-8 animate-pulse bg-neutral-100 rounded-lg ml-auto" />}>
                      <CustomerActions customer={customer} />
                    </Suspense>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {allCustomers.length === 0 && (
          <div className="py-14 text-center text-sm text-neutral-400">
            {role !== 'all' ? `No ${role} accounts yet.` : 'No customers yet.'}
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Page {page} of {totalPages} · {total} customers
            </p>
            <div className="flex items-center gap-1">
              <Link
                href={pageUrl(page - 1)}
                aria-disabled={page <= 1}
                aria-label="Previous page"
                tabIndex={page <= 1 ? -1 : undefined}
                className={`p-1.5 rounded-lg border border-neutral-200 transition-colors ${page <= 1 ? 'pointer-events-none opacity-30' : 'hover:bg-neutral-100'}`}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-neutral-600" />
              </Link>
              <Link
                href={pageUrl(page + 1)}
                aria-disabled={page >= totalPages}
                aria-label="Next page"
                tabIndex={page >= totalPages ? -1 : undefined}
                className={`p-1.5 rounded-lg border border-neutral-200 transition-colors ${page >= totalPages ? 'pointer-events-none opacity-30' : 'hover:bg-neutral-100'}`}
              >
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
