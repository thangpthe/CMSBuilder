import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import LoginPage from "../pages/auth/LoginPage";
import PageBuilderPage from "../pages/page-builder/PageBuilderPage";
import PageListPage from "../pages/pages-management/PageListPage";
import PublicPage from "../pages/public/PublicPage";

interface ProtectedRouteProps {
  children: ReactNode;
}

function DashboardPlaceholder() {
  return (
    <div style={{ padding: 32 }}>
      <h1>CMSBuilder Dashboard</h1>
      <p>
        Đăng nhập thành công. Khu vực quản trị sẽ được phát triển ở bước tiếp theo.
      </p>
    </div>
  );
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RootRedirect() {
  const [searchParams] = useSearchParams();
  if (searchParams.get("view") === "public") {
    return <PublicPage />;
  }
  return <Navigate to="/page-builder" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Page Builder - tạm thời cho phép truy cập trực tiếp để kiểm tra UI */}
      <Route path="/page-builder" element={<PageBuilderPage />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        }
      />

      {/* Page Management */}
      <Route path="/pages" element={<PageListPage />} />
      <Route path="/pages/*" element={<PageListPage />} />
      <Route path="/admin/pages" element={<PageListPage />} />
      <Route path="/admin/pages/*" element={<PageListPage />} />

      {/* Public Page */}
      <Route path="/p" element={<PublicPage />} />
      <Route path="/p/*" element={<PublicPage />} />
      <Route path="/public" element={<PublicPage />} />
      <Route path="/public/*" element={<PublicPage />} />

      {/* Trang mặc định */}
      <Route path="/" element={<RootRedirect />} />

      {/* Route không tồn tại */}
      <Route
        path="*"
        element={<Navigate to="/page-builder" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
