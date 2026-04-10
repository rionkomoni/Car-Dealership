import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { TOKEN_KEY, USER_KEY } from "../authStorage";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/api/auth/login", { email, password });

      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        navigate(from, { replace: true });
        return;
      }

      setError(data.message || "Login failed");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Login failed";
      setError(msg);
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
        <form className="auth-card" onSubmit={handleLogin}>
          {error && <p className="error-text">{error}</p>}
          <label className="field-label">
            Email
            <input
              className="field-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Password
            <input
              className="field-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
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
