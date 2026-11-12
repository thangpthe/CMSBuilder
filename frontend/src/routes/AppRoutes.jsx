
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";

function DashboardPlaceholder() {
  return (
    <div style={{ padding: 32 }}>
      <h1>CMSBuilder Dashboard</h1>
      <p>Đăng nhập thành công. Khu vực quản trị sẽ được phát triển ở bước tiếp theo.</p>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
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

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
