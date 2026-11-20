import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";

import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import "./LoginPage.css";

interface LoginErrors {
  identifier?: string;
  password?: string;
}

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validate dữ liệu đầu vào
  const validate = () => {
    const nextErrors: LoginErrors = {};
    const identifier = form.identifier.trim();

    if (!identifier) {
      nextErrors.identifier =
        "Vui lòng nhập tên đăng nhập hoặc email.";
    } else if (
      identifier.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
    ) {
      nextErrors.identifier = "Email không đúng định dạng.";
    }

    if (!form.password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // Xử lý thay đổi input
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setServerError("");
  };

  // Xử lý đăng nhập
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);

      const response = await login({
        identifier: form.identifier.trim(),
        password: form.password,
      });

      if (!response?.access_token) {
        throw new Error("INVALID_RESPONSE");
      }

      localStorage.setItem("access_token", response.access_token);

      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setServerError(
            "Tên đăng nhập hoặc mật khẩu không chính xác."
          );
        } else if (error.response?.status === 422) {
          setServerError(
            "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại."
          );
        } else if (error.code === "ECONNABORTED") {
          setServerError(
            "Yêu cầu đăng nhập đã hết thời gian chờ. Vui lòng thử lại."
          );
        } else if (!error.response) {
          setServerError(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          setServerError(
            "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại."
          );
        }
      } else if (error instanceof Error) {
        if (error.message === "INVALID_RESPONSE") {
          setServerError(
            "Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại."
          );
        } else {
          setServerError(
            "Đã xảy ra lỗi không xác định. Vui lòng thử lại."
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
              <div className="brand-subtitle">
                ENTERPRISE STUDIO
              </div>
            </div>
          </div>

          <div className="intro-content">
            <h1>Xây dựng & Xuất bản nội dung trực quan</h1>

            <p>
              Nền tảng biên tập kéo thả trực quan giúp đội ngũ xuất bản
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
            <h2>Đăng nhập</h2>
            <p>Chào mừng bạn trở lại với CMSBuilder.</p>
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
            {/* Username / Email */}
            <div className="login-field">
              <label htmlFor="identifier">
                Tên đăng nhập <span>*</span>
              </label>

              <div
                className={`input-wrap ${
                  errors.identifier ? "input-invalid" : ""
                }`}
              >
                <span className="input-icon" aria-hidden="true">
                  <UserRound size={18} />
                </span>

                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={form.identifier}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={loading}
                  aria-invalid={Boolean(errors.identifier)}
                  aria-describedby={
                    errors.identifier ? "identifier-error" : undefined
                  }
                />
              </div>

              {errors.identifier && (
                <small className="field-error" id="identifier-error">
                  {errors.identifier}
                </small>
              )}
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="label-row">
                <label htmlFor="password">
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
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <small className="field-error" id="password-error">
                  {errors.password}
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
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập vào hệ thống
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="login-bottom">
            <span>© 2026 CMSBuilder. Bản quyền được bảo lưu.</span>
          </div>
        </section>
      </section>
    </main>
  );
}

export default LoginPage;