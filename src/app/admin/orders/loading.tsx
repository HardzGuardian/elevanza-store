import { AdminTableSkeleton } from '@/features/admin/components/AdminTableSkeleton';

export default function OrdersLoading() {
  return (
    <AdminTableSkeleton
      rows={10}
      showSearch={false}
      cols={[80, 160, 70, 100, 80, 80, 120, 50]}
    />
  );
}
