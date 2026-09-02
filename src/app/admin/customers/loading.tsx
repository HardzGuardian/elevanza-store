import { AdminTableSkeleton } from '@/features/admin/components/AdminTableSkeleton';

export default function CustomersLoading() {
  return (
    <AdminTableSkeleton
      rows={10}
      showSearch={false}
      cols={[200, 70, 100, 70, 40]}
    />
  );
}
