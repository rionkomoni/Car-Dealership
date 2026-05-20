import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import ValidatedField from "../components/ui/ValidatedField";
import api from "../api";
import { setCredentials } from "../store/authSlice";
import { loginSchema, useFormValidation } from "../hooks/useFormValidation";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const registerOk = location.state?.justRegistered;
  const [apiError, setApiError] = useState("");

  const form = useFormValidation(loginSchema, {
    email: location.state?.emailHint || "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!form.validateAll()) return;

    try {
      const { data } = await api.post("/api/auth/login", {
        email: form.values.email,
        password: form.values.password,
      });

      if (data.success && data.token) {
        dispatch(
          setCredentials({
            token: data.token,
            refreshToken: data.refreshToken,
            user: data.user,
          })
        );
        navigate(from, { replace: true });
        return;
      }

      setApiError(data.message || "Login failed");
    } catch (err) {
      setApiError(
        err.response?.data?.message || err.message || "Login failed"
      );
    }
  };

  return (
    <PageLayout>
      <section className="section narrow">
        <h1 className="page-title">Log in</h1>
        <p className="page-subtitle">
          Clients can add listings. <strong>Admins</strong> also get{" "}
          <strong>Admin</strong> (dashboard + contact inbox) and{" "}
          <strong>Car logs</strong>.
        </p>
        <form className="auth-card" onSubmit={handleLogin} noValidate>
          {registerOk ? (
            <p className="success-text">
              Llogaria u krijua. Kyçu me email-in dhe fjalëkalimin që zgjodhe.
            </p>
          ) : null}
          {apiError ? <p className="error-text">{apiError}</p> : null}
          <ValidatedField
            id="login-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.values.email ?? ""}
            onChange={form.handleChange("email")}
            onBlur={form.handleBlur("email")}
            error={form.fieldError("email")}
            required
          />
          <ValidatedField
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.values.password ?? ""}
            onChange={form.handleChange("password")}
            onBlur={form.handleBlur("password")}
            error={form.fieldError("password")}
            required
          />
          <p className="form-footer" style={{ marginTop: "-0.2rem", marginBottom: "0.9rem" }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <button type="submit" className="btn btn-primary">
            Sign in
          </button>
          <p className="form-footer">
            No account? <Link to="/register">Register</Link>
          </p>
        </form>
      </section>
    </PageLayout>
  );
}
