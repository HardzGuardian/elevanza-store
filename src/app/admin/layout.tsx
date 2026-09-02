import { auth } from "@/core/auth/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { AdminTopbar } from "@/features/admin/components/AdminTopbar";

// The entire /admin tree is behind auth and reads per-request session +
// live data — it must never be statically prerendered. Without this,
// Next.js can attempt to prerender admin pages at build time, which
// requires a live DB connection just to complete a build.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  const user = {
    name:  session.user.name,
    email: session.user.email,
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
