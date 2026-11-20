import { useNavigate } from 'react-router-dom';
import { Blocks, FileText, Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.username || user?.name || 'Quản trị viên';

  return (
    <AdminLayout breadcrumbLabel="Bảng điều khiển hệ thống">
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#fff',
            borderRadius: '12px',
            padding: '28px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={20} />
            <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
              Hệ thống quản trị CMSBuilder
            </span>
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700 }}>
            Xin chào, {username}!
          </h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, maxWidth: '640px', lineHeight: 1.5 }}>
            Chào mừng bạn đến với không gian làm việc CMSBuilder. Bạn có thể quản trị các trang nội dung, người dùng và cài đặt chung của hệ thống.
          </p>
        </div>

        {/* Quick Action Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            onClick={() => navigate('/pages')}
            style={{
              background: 'var(--bg-surface, #fff)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '10px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <FileText size={20} />
              </div>
              <ArrowRight size={18} color="var(--text-muted, #94a3b8)" />
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
              Quản lý trang nội dung
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
              Xem danh sách, tìm kiếm, tạo mới và xuất bản các trang trên toàn hệ thống.
            </p>
          </div>

          <div
            onClick={() => navigate('/page-builder')}
            style={{
              background: 'var(--bg-surface, #fff)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '10px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#F0FDF4',
                  color: '#16A34A',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Blocks size={20} />
              </div>
              <ArrowRight size={18} color="var(--text-muted, #94a3b8)" />
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
              Trình soạn thảo trực quan
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
              Thiết kế trang trực tiếp bằng trình kéo thả khối nội dung đa phương tiện.
            </p>
          </div>

          <div
            onClick={() => navigate('/p')}
            style={{
              background: 'var(--bg-surface, #fff)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '10px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Globe size={20} />
              </div>
              <ArrowRight size={18} color="var(--text-muted, #94a3b8)" />
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
              Trang công khai (Public)
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
              Xem trước các trang đã được xuất bản phục vụ khách truy cập và người dùng.
            </p>
          </div>
        </div>

        {/* System Info Box */}
        <div
          style={{
            background: 'var(--bg-surface, #fff)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
            Thông tin vai trò và phân quyền
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-subtle, #f8fafc)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: '#4F46E5', marginBottom: '4px' }}>system_admin (Quản trị hệ thống)</div>
              <div style={{ color: 'var(--text-secondary, #64748b)' }}>
                Đăng nhập mặc định chuyển tới <strong>Bảng điều khiển</strong>. Có quyền quản lý toàn diện người dùng và trang.
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-subtle, #f8fafc)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: '#16A34A', marginBottom: '4px' }}>page_admin (Quản trị trang)</div>
              <div style={{ color: 'var(--text-secondary, #64748b)' }}>
                Đăng nhập mặc định chuyển thẳng tới <strong>Quản lý trang (/pages)</strong> để làm việc với nội dung trang.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
