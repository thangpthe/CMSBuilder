import AdminLayout from '../../components/layout/AdminLayout';
import { PageManagementView } from '../../features/pages/PageManagementView';

/**
 * PageListPage - Màn hình danh sách quản lý Page (Task S1-T09)
 * Phụ trách bởi: Đỗ Huy Đạt
 */
export default function PageListPage() {
  return (
    <AdminLayout breadcrumbLabel="Quản lý trang">
      <PageManagementView />
    </AdminLayout>
  );
}
