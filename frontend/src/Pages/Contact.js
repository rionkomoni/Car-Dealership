import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";

function formatPriceSq(car) {
  const priceNum =
    typeof car.price === "number" ? car.price : parseFloat(car.price, 10);
  if (!Number.isFinite(priceNum)) return "";
  return priceNum.toLocaleString("sq-AL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function Contact() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const carId = searchParams.get("car");
    const interest = location.state?.carInterest;

    const prefill = (text) => {
      if (cancelled) return;
      setMessage((prev) => (prev.trim() ? prev : text));
    };

    if (carId) {
      (async () => {
        try {
          const { data } = await api.get(`/api/cars/${carId}`);
          if (cancelled) return;
          const p = formatPriceSq(data);
          prefill(
            `Përshëndetje,\n\nDua të blej / të informohem për: ${data.name}${p ? ` — ${p}` : ""} — viti ${data.year} (ID #${data.id}).\n\n`
          );
        } catch {
          if (
            !cancelled &&
            typeof interest === "string" &&
            interest.trim()
          ) {
            prefill(
              `Përshëndetje,\n\nJam i interesuar për: ${interest.trim()}\n\n`
            );
          }
        }
      })();
    } else if (typeof interest === "string" && interest.trim()) {
      prefill(
        `Përshëndetje,\n\nJam i interesuar për: ${interest.trim()}\n\n`
      );
    }

    return () => {
      cancelled = true;
    };
  }, [searchParams, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      await api.post("/api/contact", { name, email, message });
      setStatus({
        ok: true,
        text: "Mesazhi u ruajt. Do t’ju përgjigjemi së shpejti.",
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const text =
        err.response?.data?.message ||
        err.message ||
        "Nuk u dërgua mesazhi.";
      setStatus({ ok: false, text });
    }
  };

  return (
    <PageLayout>
      <section className="section narrow">
        <h1 className="page-title">Na kontaktoni</h1>
        <p className="page-subtitle left">
          Mesazhet ruhen në <strong>MongoDB</strong>.{" "}
          <Link to="/">Kreu</Link>
        </p>

        <form className="auth-card" onSubmit={handleSubmit}>
          {status && (
            <p className={status.ok ? "success-text" : "error-text"}>
              {status.text}
            </p>
          )}
          <label className="field-label">
            Emri juaj
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
            Mesazhi
            <textarea
              className="field-input field-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Dërgo
          </button>
        </form>
      </section>
    </PageLayout>
  );
}
