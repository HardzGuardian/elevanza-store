import { AdminBreadcrumbs } from './AdminBreadcrumbs';

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

function initials(name?: string | null, email?: string | null): string {
  if (name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
  return (email?.[0] ?? 'A').toUpperCase();
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  return (
    <header className="h-13 border-b border-neutral-100 bg-white flex items-center justify-between px-6 flex-shrink-0">
      <AdminBreadcrumbs />
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          {user.name && (
            <p className="text-xs font-semibold text-neutral-900 leading-none">{user.name}</p>
          )}
          {user.email && (
            <p className="text-[10px] text-neutral-400 mt-0.5">{user.email}</p>
          )}
        </div>
        <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {initials(user.name, user.email)}
        </div>
      </div>
    </header>
  );
}
