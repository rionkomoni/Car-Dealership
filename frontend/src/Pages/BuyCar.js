import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { useAppToast } from "../components/ui/AppToastProvider";

function formatEuro(amount) {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return "€0";
  return n.toLocaleString("sq-AL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function BuyCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [useTradeIn, setUseTradeIn] = useState(false);
  const [tradeCar, setTradeCar] = useState("");
  const [tradeYear, setTradeYear] = useState("");
  const [tradeMileage, setTradeMileage] = useState("");
  const [tradeValue, setTradeValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useAppToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/cars/${id}`);
        if (!cancelled) setCar(data);
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || "Nuk u ngarkua vetura.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const breakdown = useMemo(() => {
    const carPrice = Number(car?.price || 0);
    const trade = useTradeIn ? Number(tradeValue || 0) : 0;
    const amountToAdd = Math.max(0, carPrice - (Number.isFinite(trade) ? trade : 0));
    return { carPrice, trade: Number.isFinite(trade) ? trade : 0, amountToAdd };
  }, [car?.price, tradeValue, useTradeIn]);

  const validation = useMemo(() => {
    const issues = {};
    if (!buyerName.trim() || buyerName.trim().length < 2) {
      issues.buyerName = "Emri duhet të ketë të paktën 2 karaktere.";
    }
    if (!/\S+@\S+\.\S+/.test(buyerEmail.trim())) {
      issues.buyerEmail = "Email i pavlefshëm.";
    }
    if (useTradeIn) {
      if (!tradeCar.trim()) issues.tradeCar = "Shkruaj veturën aktuale.";
      const year = Number(tradeYear);
      if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1) {
        issues.tradeYear = "Viti i trade-in nuk është valid.";
      }
      const mileage = Number(tradeMileage);
      if (!Number.isFinite(mileage) || mileage < 0) {
        issues.tradeMileage = "Kilometrazhi duhet >= 0.";
      }
      const value = Number(tradeValue);
      if (!Number.isFinite(value) || value < 0) {
        issues.tradeValue = "Vlera e trade-in duhet >= 0.";
      }
    }
    return issues;
  }, [buyerName, buyerEmail, useTradeIn, tradeCar, tradeYear, tradeMileage, tradeValue]);

  const isValid = Object.keys(validation).length === 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isValid) {
      setError("Ju lutem korrigjoni fushat e formularit.");
      return;
    }

    const payload = {
      buyer_name: buyerName.trim(),
      buyer_email: buyerEmail.trim(),
      buyer_phone: buyerPhone.trim(),
      payment_method: paymentMethod,
      notes: notes.trim(),
    };

    if (useTradeIn) {
      payload.trade_in = {
        current_car: tradeCar.trim(),
        year: Number(tradeYear),
        mileage_km: Number(tradeMileage),
        estimated_value: Number(tradeValue),
      };
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/api/cars/${id}/purchase`, payload);
      setSuccess(data?.message || "Blerja u regjistrua me sukses.");
      showToast("Blerja u regjistrua me sukses.", "success");
      setTimeout(() => navigate(`/cars/${id}`), 1200);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Blerja dështoi.");
      showToast("Blerja dështoi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <section className="section narrow">
          <p className="muted">Duke ngarkuar të dhënat e blerjes...</p>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="section narrow">
        <p className="breadcrumb">
          <Link to={`/cars/${id}`}>← Kthehu te vetura</Link>
        </p>
        <h1 className="page-title">Procedura e blerjes</h1>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        {car ? (
          <>
            <div className="auth-card" style={{ marginBottom: "1rem" }}>
              <h2 className="spec-section-title">{car.name}</h2>
              <p className="muted">
                Çmimi i listuar: <strong>{formatEuro(car.price)}</strong>
              </p>
              {car.sold_out ? (
                <p className="error-text">Kjo veturë është already sold out.</p>
              ) : null}
            </div>

            {!car.sold_out ? (
              <form className="auth-card" onSubmit={onSubmit}>
                <label className="field-label">
                  Emri i blerësit
                  <input
                    className="field-input"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                  />
                  {validation.buyerName ? (
                    <span className="error-text">{validation.buyerName}</span>
                  ) : null}
                </label>
                <label className="field-label">
                  Email
                  <input
                    className="field-input"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    required
                  />
                  {validation.buyerEmail ? (
                    <span className="error-text">{validation.buyerEmail}</span>
                  ) : null}
                </label>
                <label className="field-label">
                  Telefoni
                  <input
                    className="field-input"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                  />
                </label>
                <label className="field-label">
                  Metoda e pagesës
                  <select
                    className="field-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Transfer bankar</option>
                    <option value="financing">Financim</option>
                    <option value="leasing">Leasing</option>
                  </select>
                </label>

                <label className="field-label" style={{ display: "flex", gap: ".5rem" }}>
                  <input
                    type="checkbox"
                    checked={useTradeIn}
                    onChange={(e) => setUseTradeIn(e.target.checked)}
                  />
                  Dua ta nderroj makinen time (trade-in)
                </label>

                {useTradeIn ? (
                  <>
                    <label className="field-label">
                      Vetura që ke aktualisht
                      <input
                        className="field-input"
                        placeholder="p.sh. Audi A4 2017"
                        value={tradeCar}
                        onChange={(e) => setTradeCar(e.target.value)}
                        required={useTradeIn}
                      />
                      {validation.tradeCar ? (
                        <span className="error-text">{validation.tradeCar}</span>
                      ) : null}
                    </label>
                    <label className="field-label">
                      Viti i veturës ekzistuese
                      <input
                        className="field-input"
                        type="number"
                        min="1950"
                        max={new Date().getFullYear() + 1}
                        value={tradeYear}
                        onChange={(e) => setTradeYear(e.target.value)}
                        required={useTradeIn}
                      />
                      {validation.tradeYear ? (
                        <span className="error-text">{validation.tradeYear}</span>
                      ) : null}
                    </label>
                    <label className="field-label">
                      Kilometrazhi (km)
                      <input
                        className="field-input"
                        type="number"
                        min="0"
                        value={tradeMileage}
                        onChange={(e) => setTradeMileage(e.target.value)}
                        required={useTradeIn}
                      />
                      {validation.tradeMileage ? (
                        <span className="error-text">{validation.tradeMileage}</span>
                      ) : null}
                    </label>
                    <label className="field-label">
                      Vlera e vlerësuar e trade-in (EUR)
                      <input
                        className="field-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={tradeValue}
                        onChange={(e) => setTradeValue(e.target.value)}
                        required={useTradeIn}
                      />
                      {validation.tradeValue ? (
                        <span className="error-text">{validation.tradeValue}</span>
                      ) : null}
                    </label>
                  </>
                ) : null}

                <div className="auth-card" style={{ margin: "1rem 0" }}>
                  <h3 className="spec-section-title">Kalkulimi</h3>
                  <p>Çmimi i veturës: {formatEuro(breakdown.carPrice)}</p>
                  <p>Zbritja nga trade-in: {formatEuro(breakdown.trade)}</p>
                  <p>
                    <strong>Shuma që duhet të shtosh: {formatEuro(breakdown.amountToAdd)}</strong>
                  </p>
                </div>

                <label className="field-label">
                  Shënime shtesë
                  <textarea
                    className="field-input field-textarea"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? "Duke regjistruar..." : "Përfundo blerjen"}
                </button>
              </form>
            ) : null}
          </>
        ) : null}
      </section>
    </PageLayout>
  );
}

