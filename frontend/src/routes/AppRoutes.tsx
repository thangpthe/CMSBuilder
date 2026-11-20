import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import PageBuilderPage from "../pages/page-builder/PageBuilderPage";
import PageListPage from "../pages/pages-management/PageListPage";
import PublicPage from "../pages/public/PublicPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRouteForRole } from "../services/authService";

function RootRedirect() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, isLoading } = useAuth();

  if (searchParams.get("view") === "public") {
    return <PublicPage />;
  }

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Chuyen huong theo dung role cua user
  const destination = getDefaultRouteForRole(user?.role);
  return <Navigate to={destination} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Page Builder */}
      <Route
        path="/page-builder"
        element={
          <ProtectedRoute>
            <PageBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/page-builder/*"
        element={
          <ProtectedRoute>
            <PageBuilderPage />
          </ProtectedRoute>
        }
      />

      {/* Dashboard (Danh rieng cho system_admin) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["system_admin"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Page Management */}
      <Route
        path="/pages"
        element={
          <ProtectedRoute>
            <PageListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pages/*"
        element={
          <ProtectedRoute>
            <PageListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pages"
        element={
          <ProtectedRoute>
            <PageListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pages/*"
        element={
          <ProtectedRoute>
            <PageListPage />
          </ProtectedRoute>
        }
      />

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
        element={<RootRedirect />}
      />
    </Routes>
  );
}

export default AppRoutes;
