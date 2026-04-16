import { db } from '@/core/db';
import { users } from '@/core/db/schema';
import { desc } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { Suspense } from 'react';
import { CustomerActions } from '@/features/admin/components/CustomerActions';

export default async function AdminCustomersPage() {
  const allCustomers = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Customers</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage and view your registered user base.</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Customer', 'Role', 'Joined', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 last:text-right">
                    {h}
                  </th>
                ))}
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
                      <span className="text-xs text-neutral-500">Verified</span>
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
          <div className="py-14 text-center text-sm text-neutral-400">No customers yet.</div>
        )}
      </div>
    </div>
  );
}


