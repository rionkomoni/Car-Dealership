import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/api/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed";
      setError(msg);
    }
  };

  return (
    <PageLayout>
      <section className="section narrow">
        <h1 className="page-title">Create account</h1>
        <p className="page-subtitle">
          Your profile is stored in <strong>MySQL</strong> (phpMyAdmin).
        </p>
        <form className="auth-card" onSubmit={handleRegister}>
          {error && <p className="error-text">{error}</p>}
          <label className="field-label">
            Name
            <input
              className="field-input"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Register
          </button>
          <p className="form-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </section>
    </PageLayout>
  );
}
