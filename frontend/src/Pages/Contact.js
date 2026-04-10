import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";

export default function Contact() {
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const interest = location.state?.carInterest;
    if (typeof interest === "string" && interest.trim()) {
      setMessage((prev) => {
        if (prev.trim()) return prev;
        return `Përshëndetje,\n\nJam i interesuar për: ${interest.trim()}\n\n`;
      });
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      await api.post("/api/contact", { name, email, message });
      setStatus({
        ok: true,
        text: "Message saved in MongoDB. We will get back to you soon.",
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const text =
        err.response?.data?.message ||
        err.message ||
        "Could not send message";
      setStatus({ ok: false, text });
    }
  };

  return (
    <PageLayout>
      <section className="section narrow">
        <h1 className="page-title">Contact us</h1>
        <p className="page-subtitle left">
          Messages are stored in <strong>MongoDB</strong>.{" "}
          <Link to="/">Home</Link>
        </p>

        <form className="auth-card" onSubmit={handleSubmit}>
          {status && (
            <p className={status.ok ? "success-text" : "error-text"}>
              {status.text}
            </p>
          )}
          <label className="field-label">
            Your name
            <input
              className="field-input"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Message
            <textarea
              className="field-input field-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </section>
    </PageLayout>
  );
}
