import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import {
  register,
  getDefaultRouteForRole,
  type RegisterPayload,
} from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import "./LoginPage.css";

interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface ValidationErrorItem {
  msg?: string;
}

interface ApiErrorResponse {
  detail?: string | ValidationErrorItem[];
  message?: string;
}

const USERNAME_REGEX = /^[A-Za-z0-9_.-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractServerErrorMessage(data?: ApiErrorResponse): string | null {
  if (!data) return null;

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail.trim();
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const messages = data.detail
      .map((item) =>
        typeof item?.msg === "string"
          ? item.msg.replace(/^Value error,\s*/i, "").trim()
          : ""
      )
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  return null;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useAuth();

  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Nếu đã đăng nhập từ trước, tự động chuyển hướng về trang mặc định theo role
  useEffect(() => {
    if (isAuthenticated) {
      const destination = getDefaultRouteForRole(authUser?.role);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, authUser?.role, navigate]);

  const validate = (): boolean => {
    const nextErrors: RegisterErrors = {};
    const trimmedUsername = form.username.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedUsername) {
      nextErrors.username = "Vui lòng nhập tên đăng nhập.";
    } else if (/\s/.test(trimmedUsername)) {
      nextErrors.username = "Tên đăng nhập không được chứa khoảng trắng.";
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 100) {
      nextErrors.username = "Tên đăng nhập phải từ 3 đến 100 ký tự.";
    } else if (!USERNAME_REGEX.test(trimmedUsername)) {
      nextErrors.username =
        "Tên đăng nhập chỉ được chứa chữ cái không dấu, chữ số và ký tự ., _, -.";
    }

    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = "Email không đúng định dạng.";
    }

    if (!form.password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    } else if (form.password.length > 128) {
      nextErrors.password = "Mật khẩu không được vượt quá 128 ký tự.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      ...(name === "password" && current.confirmPassword
        ? { confirmPassword: "" }
        : {}),
    }));

    setServerError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    const trimmedUsername = form.username.trim();
    const trimmedEmail = form.email.trim();

    const payload: RegisterPayload = {
      username: trimmedUsername,
      password: form.password,
      ...(trimmedEmail ? { email: trimmedEmail } : {}),
    };

    try {
      setLoading(true);

      const response = await register(payload);

      navigate("/login", {
        replace: true,
        state: {
          registeredMessage:
            response?.message ||
            "Đăng ký tài khoản thành công. Vui lòng đăng nhập.",
          registeredUsername: trimmedUsername,
        },
      });
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const status = error.response?.status;
        const detailMessage = extractServerErrorMessage(error.response?.data);

        if (status === 409) {
          setServerError(
            detailMessage ||
              "Tên đăng nhập hoặc email đã được sử dụng. Vui lòng chọn thông tin khác."
          );
        } else if (status === 422) {
          setServerError(
            detailMessage ||
              "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại."
          );
        } else if (error.code === "ECONNABORTED") {
          setServerError(
            "Yêu cầu đăng ký đã hết thời gian chờ. Vui lòng thử lại."
          );
        } else if (!error.response) {
          setServerError(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
          );
        } else if (status && status >= 500) {
          setServerError(
            "Máy chủ đang gặp sự cố. Vui lòng thử lại sau."
          );
        } else {
          setServerError(
            detailMessage ||
              "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại."
          );
        }
      } else {
        setServerError(
          "Đã xảy ra lỗi không xác định. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-glow login-glow-blue" />
      <div className="login-glow login-glow-green" />

      <section className="login-card">
        <aside className="login-intro">
          <div className="brand">
            <div className="brand-logo">C</div>

            <div>
              <div className="brand-name">CMSBuilder</div>
              <div className="brand-subtitle">ENTERPRISE STUDIO</div>
            </div>
          </div>

          <div className="intro-content">
            <h1>Xây dựng & Xuất bản nội dung trực quan</h1>

            <p>
              Nền tảng biên tập nội dung giúp cá nhân xuất bản
              trang linh hoạt và nhanh chóng.
            </p>

            <div className="intro-orb" />
          </div>

          <div className="intro-footer">
            CMSBuilder - Nền tảng quản trị nội dung
          </div>
        </aside>

        <section className="login-form-panel">
          <div className="form-heading">
            <h2>Đăng ký tài khoản</h2>
            <p>Tạo tài khoản mới để bắt đầu cùng CMSBuilder.</p>
          </div>

          {serverError && (
            <div className="login-alert" role="alert">
              <AlertCircle
                className="alert-icon"
                size={18}
                aria-hidden="true"
              />

              <span>{serverError}</span>

              <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={() => setServerError("")}
              >
                <X size={18} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="login-field">
              <label htmlFor="register-username">
                Tên đăng nhập <span>*</span>
              </label>

              <div
                className={`input-wrap ${
                  errors.username ? "input-invalid" : ""
                }`}
              >
                <span className="input-icon" aria-hidden="true">
                  <UserRound size={18} />
                </span>

                <input
                  id="register-username"
                  name="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={loading}
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={
                    errors.username ? "register-username-error" : undefined
                  }
                />
              </div>

              {errors.username && (
                <small className="field-error" id="register-username-error">
                  {errors.username}
                </small>
              )}
            </div>

            {/* Email (optional) */}
            <div className="login-field">
              <label htmlFor="register-email">
                Email <span className="optional-tag">(tùy chọn)</span>
              </label>

              <div
                className={`input-wrap ${
                  errors.email ? "input-invalid" : ""
                }`}
              >
                <span className="input-icon" aria-hidden="true">
                  <Mail size={18} />
                </span>

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="Nhập email (không bắt buộc)"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "register-email-error" : undefined
                  }
                />
              </div>

              {errors.email && (
                <small className="field-error" id="register-email-error">
                  {errors.email}
                </small>
              )}
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="label-row">
                <label htmlFor="register-password">
                  Mật khẩu <span>*</span>
                </label>
              </div>

              <div
                className={`input-wrap ${
                  errors.password ? "input-invalid" : ""
                }`}
              >
                <span className="input-icon" aria-hidden="true">
                  <LockKeyhole size={18} />
                </span>

                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "register-password-error" : undefined
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <small className="field-error" id="register-password-error">
                  {errors.password}
                </small>
              )}
            </div>

            {/* Confirm Password */}
            <div className="login-field">
              <div className="label-row">
                <label htmlFor="register-confirm-password">
                  Xác nhận mật khẩu <span>*</span>
                </label>
              </div>

              <div
                className={`input-wrap ${
                  errors.confirmPassword ? "input-invalid" : ""
                }`}
              >
                <span className="input-icon" aria-hidden="true">
                  <LockKeyhole size={18} />
                </span>

                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "register-confirm-password-error"
                      : undefined
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Ẩn mật khẩu xác nhận"
                      : "Hiện mật khẩu xác nhận"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <small
                  className="field-error"
                  id="register-confirm-password-error"
                >
                  {errors.confirmPassword}
                </small>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Đang đăng ký...
                </>
              ) : (
                <>
                  Tạo tài khoản
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch-row">
            Đã có tài khoản?{" "}
            <Link to="/login" className="auth-switch-link">
              Đăng nhập ngay
            </Link>
          </p>

          <div className="login-bottom">
            <span>© 2026 CMSBuilder. Bản quyền được bảo lưu.</span>
          </div>
        </section>
      </section>
    </main>
  );
}

export default RegisterPage;
