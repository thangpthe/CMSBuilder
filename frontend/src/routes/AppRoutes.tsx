import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import LoginPage from "../pages/auth/LoginPage";
import PageListPage from "../pages/pages-management/PageListPage";
import PublicPage from "../pages/public/PublicPage";

interface ProtectedRouteProps {
  children: ReactNode;
}

function DashboardPlaceholder() {
  return (
    <div style={{ padding: 32 }}>
      <h1>CMSBuilder Dashboard</h1>
      <p>Đăng nhập thành công. Khu vực quản trị sẽ được phát triển ở bước tiếp theo.</p>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
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
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route path="/pages" element={<PageListPage />} />
      <Route path="/pages/*" element={<PageListPage />} />
      <Route path="/admin/pages" element={<PageListPage />} />
      <Route path="/admin/pages/*" element={<PageListPage />} />

      <Route path="/p" element={<PublicPage />} />
      <Route path="/p/*" element={<PublicPage />} />
      <Route path="/public" element={<PublicPage />} />
      <Route path="/public/*" element={<PublicPage />} />

      <Route path="/" element={<RootRedirect />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
