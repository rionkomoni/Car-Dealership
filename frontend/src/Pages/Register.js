import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import ValidatedField from "../components/ui/ValidatedField";
import api from "../api";
import { registerSchema, useFormValidation } from "../hooks/useFormValidation";

export default function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const form = useFormValidation(registerSchema, {
    name: "",
    email: "",
    password: "",
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!form.validateAll()) return;

    try {
      await api.post("/api/auth/register", {
        name: form.values.name,
        email: form.values.email,
        password: form.values.password,
      });
      navigate("/login", {
        state: { emailHint: form.values.email, justRegistered: true },
      });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed"
      );
    }
  };

  return (
    <PageLayout>
      <section className="section narrow">
        <h1 className="page-title">Create account</h1>
        <p className="page-subtitle">
          Your profile is stored in <strong>MySQL</strong> (phpMyAdmin).
        </p>
        <form className="auth-card" onSubmit={handleRegister} noValidate>
          {apiError ? <p className="error-text">{apiError}</p> : null}
          <ValidatedField
            id="register-name"
            label="Name"
            autoComplete="name"
            value={form.values.name ?? ""}
            onChange={form.handleChange("name")}
            onBlur={form.handleBlur("name")}
            error={form.fieldError("name")}
            required
          />
          <ValidatedField
            id="register-email"
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
            id="register-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.values.password ?? ""}
            onChange={form.handleChange("password")}
            onBlur={form.handleBlur("password")}
            error={form.fieldError("password")}
            required
          />
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
