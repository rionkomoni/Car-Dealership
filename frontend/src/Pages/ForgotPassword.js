import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/users/password/reset/request", { email });
      setMessage(data?.message || "Kërkesa u dërgua. Kontrollo email-in.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Dërgimi dështoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="section narrow">
        <h1 className="page-title">Forgot password</h1>
        <p className="page-subtitle">Shkruaj email-in dhe do të marrësh linkun për reset.</p>
        <form className="auth-card" onSubmit={handleSubmit}>
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <p className="form-footer">
            <Link to="/login">Back to login</Link>
          </p>
        </form>
      </section>
    </PageLayout>
  );
}
