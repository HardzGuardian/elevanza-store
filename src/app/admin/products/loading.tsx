import { AdminTableSkeleton } from '@/features/admin/components/AdminTableSkeleton';

export default function ProductsLoading() {
  return (
    <AdminTableSkeleton
      rows={10}
      showSearch
      cols={[220, 100, 80, 60, 100, 40]}
    />
  );
}
