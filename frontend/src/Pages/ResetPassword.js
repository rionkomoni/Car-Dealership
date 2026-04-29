import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => String(searchParams.get("token") || "").trim(), [searchParams]);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Token mungon në link.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/users/password/reset/confirm", {
        token,
        new_password: newPassword,
      });
      setMessage(data?.message || "Password u resetua me sukses.");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Reset dështoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="section narrow">
        <h1 className="page-title">Reset password</h1>
        <p className="page-subtitle">Vendos password të ri për llogarinë tënde.</p>
        <form className="auth-card" onSubmit={handleSubmit}>
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}
          <label className="field-label">
            New password
            <input
              className="field-input"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
          <p className="form-footer">
            <Link to="/login">Back to login</Link>
          </p>
        </form>
      </section>
    </PageLayout>
  );
}
