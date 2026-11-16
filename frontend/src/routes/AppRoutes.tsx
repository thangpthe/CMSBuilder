
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";


import type { ReactNode } from "react";
import PageBuilderPage from "../pages/page-builder/PageBuilderPage";

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

      {/* Trang mặc định */}
      <Route
        path="/"
        element={<Navigate to="/page-builder" replace />}
      />

      {/* Route không tồn tại */}
      <Route
        path="*"
        element={<Navigate to="/page-builder" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
