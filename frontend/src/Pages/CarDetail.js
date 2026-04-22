import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { getCarImageUrls } from "../utils/carGallery";
import { useAppToast } from "../components/ui/AppToastProvider";

function SpecBlock({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="spec-block">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const role = useSelector((s) => s.auth.user?.role);
  const user = useSelector((s) => s.auth.user);
  const isAdmin = role === "admin";
  const { showToast } = useAppToast();
  const [downPayment, setDownPayment] = useState("");
  const [months, setMonths] = useState(36);
  const [interestRate, setInterestRate] = useState(6.5);
  const [booking, setBooking] = useState({
    requester_name: "",
    requester_email: "",
    requester_phone: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const imageUrls = useMemo(() => getCarImageUrls(car), [car]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [id]);

  useEffect(() => {
    if (photoIndex >= imageUrls.length) {
      setPhotoIndex(0);
    }
  }, [imageUrls.length, photoIndex]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get(`/api/cars/${id}`);
        if (!cancelled) setCar(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              "Nuk u ngarkua vetura."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Të fshihet përgjithmonë ky listim?")) return;
    try {
      await api.delete(`/api/cars/${id}`);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Fshirja dështoi.");
    }
  };

  const priceNum =
    car &&
    (typeof car.price === "number" ? car.price : parseFloat(car.price, 10));
  const price =
    car && Number.isFinite(priceNum)
      ? priceNum.toLocaleString("sq-AL", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : car?.price;

  const power =
    car && car.power_hp != null && car.power_hp !== ""
      ? `${car.power_hp} HP`
      : null;

  const mileage =
    car && car.mileage_km != null && car.mileage_km !== ""
      ? `${Number(car.mileage_km).toLocaleString()} km`
      : null;

  const contactState = car
    ? {
        carInterest: `${car.name} — ${price} — viti ${car.year} (ID #${car.id})`,
      }
    : undefined;

  useEffect(() => {
    setBooking((prev) => ({
      ...prev,
      requester_name: user?.name || "",
      requester_email: user?.email || "",
    }));
  }, [user?.name, user?.email]);

  const mainSrc =
    imageUrls.length > 0 ? imageUrls[photoIndex] : null;

  const finance = useMemo(() => {
    const priceValue = Number(priceNum || 0);
    const dp = Math.max(0, Number(downPayment || 0));
    const principal = Math.max(0, priceValue - dp);
    const n = Math.max(1, Number(months || 1));
    const monthlyRate = Math.max(0, Number(interestRate || 0)) / 100 / 12;
    if (principal <= 0) {
      return { principal: 0, monthly: 0, total: 0 };
    }
    const monthly =
      monthlyRate === 0
        ? principal / n
        : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    return {
      principal,
      monthly,
      total: monthly * n,
    };
  }, [priceNum, downPayment, months, interestRate]);

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      showToast("Duhet të kyçeni për të rezervuar test-drive.", "error");
      navigate("/login");
      return;
    }
    setBookingSubmitting(true);
    try {
      const payload = {
        ...booking,
        requester_name: booking.requester_name.trim(),
        requester_email: booking.requester_email.trim(),
        requester_phone: booking.requester_phone.trim(),
        notes: booking.notes.trim(),
      };
      await api.post(`/api/cars/${id}/test-drive`, payload);
      showToast("Kërkesa për test-drive u dërgua me sukses.", "success");
      setBooking((prev) => ({
        ...prev,
        preferred_date: "",
        preferred_time: "",
        notes: "",
      }));
    } catch (e1) {
      showToast(e1.response?.data?.message || "Dërgimi i test-drive dështoi.", "error");
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <section className="section wide">
        <p className="breadcrumb">
          <Link to="/">← Kthehu te makinat</Link>
        </p>

        {loading && <p className="muted">Duke ngarkuar…</p>}
        {error && <p className="error-text">{error}</p>}

        {car && !loading && (
          <div className="car-detail">
            <div className="car-detail-media">
              <div className="car-gallery-main">
                {mainSrc ? (
                  <img
                    src={mainSrc}
                    alt={`${car.name} — pamja ${photoIndex + 1}`}
                    className="car-detail-image car-gallery-main-img"
                  />
                ) : (
                  <div className="car-detail-image car-detail-image--placeholder">
                    Nuk ka foto të ngarkuar
                  </div>
                )}
                <div className="car-detail-price-strip">
                  <span>{price}</span>
                  <span>Viti {car.year}</span>
                </div>
              </div>

              {imageUrls.length > 1 ? (
                <div className="car-gallery-thumbs" role="tablist" aria-label="Pamje të veturës">
                  {imageUrls.map((url, i) => (
                    <button
                      key={`${url}-${i}`}
                      type="button"
                      role="tab"
                      aria-selected={i === photoIndex}
                      className={`car-gallery-thumb${i === photoIndex ? " is-active" : ""}`}
                      onClick={() => setPhotoIndex(i)}
                    >
                      <img src={url} alt="" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              ) : null}
              <p className="car-gallery-hint muted small">
                Zgjidh miniaturën për të ndërruar pamjen.
              </p>
            </div>

            <div className="car-detail-info">
              <h1 className="page-title left">{car.name}</h1>
              {car.body_type ? (
                <p className="car-detail-badge">{car.body_type}</p>
              ) : null}
              <p className="detail-price">{price}</p>
              <p className="car-detail-year-line muted">
                Modeli i vitit <strong>{car.year}</strong>
                {mileage ? (
                  <>
                    {" "}
                    · <strong>{mileage}</strong>
                  </>
                ) : null}
              </p>

              <h2 className="spec-section-title">Specifikacionet</h2>
              <dl className="spec-grid">
                <SpecBlock label="Viti i modelit" value={car.year} />
                <SpecBlock label="Kilometrazhi" value={mileage} />
                <SpecBlock label="Karburanti" value={car.fuel} />
                <SpecBlock label="Transmisioni" value={car.transmission} />
                <SpecBlock label="Motori" value={car.engine} />
                <SpecBlock label="Fuqia" value={power} />
                <SpecBlock label="Ngjyra" value={car.color} />
              </dl>

              {car.description ? (
                <div className="car-detail-about">
                  <h2 className="spec-section-title">Për këtë veturë</h2>
                  <p className="car-detail-description">{car.description}</p>
                </div>
              ) : null}

              <aside id="blerje" className="car-buy-panel" tabIndex={-1}>
                <h2 className="car-buy-panel-title">Bli këtë veturë</h2>
                <p className="car-buy-panel-price">{price}</p>
                <p className="car-buy-panel-text">
                  Klikoni më poshtë për të na kontaktuar. Do t’ju përgjigjemi me
                  detaje për pagesë, dokumentacion dhe mundësi takimi.
                </p>
                <div className="car-detail-cta-row car-buy-panel-ctas">
                  {car.sold_out ? (
                    <p className="muted">Kjo veturë është shitur (sold out).</p>
                  ) : (
                    <Link
                      to={`/cars/${car.id}/buy`}
                      state={contactState}
                      className="btn btn-primary car-detail-cta car-buy-primary"
                    >
                      Bli tani / kërko ofertë
                    </Link>
                  )}
                </div>
              </aside>

              <div className="car-detail-options">
                <h2 className="car-detail-options-title">
                  Si funksionon blerja
                </h2>
                <ul className="car-detail-options-list">
                  <li>
                    <strong>Kontakt:</strong> përmes formularit ose telefonit —
                    konfirmojmë disponueshmërinë dhe çmimin final.
                  </li>
                  <li>
                    <strong>Financim:</strong> mund të diskutohet me ekipin pas
                    hapës fillestar.
                  </li>
                  <li>
                    <strong>Vizitë:</strong> mund të organizohet për të parë
                    veturën nga afër.
                  </li>
                </ul>
                <div className="car-detail-cta-row">
                  {!car.sold_out ? (
                    <Link
                      to={`/cars/${car.id}/buy`}
                      state={contactState}
                      className="btn btn-primary car-detail-cta"
                    >
                      Interesohem për këtë veturë
                    </Link>
                  ) : null}
                  <Link to="/" className="btn btn-ghost car-detail-cta-secondary">
                    Shiko makina të tjera
                  </Link>
                </div>
              </div>

              <div className="car-detail-options">
                <h2 className="car-detail-options-title">Kalkulator financimi</h2>
                <div className="spec-grid">
                  <label className="field-label">
                    Down payment (EUR)
                    <input
                      className="field-input"
                      type="number"
                      min="0"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                    />
                  </label>
                  <label className="field-label">
                    Muaj
                    <input
                      className="field-input"
                      type="number"
                      min="6"
                      max="96"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                    />
                  </label>
                  <label className="field-label">
                    Interesi vjetor (%)
                    <input
                      className="field-input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                    />
                  </label>
                </div>
                <p className="muted">
                  Principal: <strong>{finance.principal.toFixed(2)} EUR</strong> · Kësti mujor:{" "}
                  <strong>{finance.monthly.toFixed(2)} EUR</strong> · Totali:{" "}
                  <strong>{finance.total.toFixed(2)} EUR</strong>
                </p>
              </div>

              <div className="car-detail-options">
                <h2 className="car-detail-options-title">Rezervo test-drive</h2>
                <form className="auth-card" onSubmit={submitBooking}>
                  <label className="field-label">
                    Emri
                    <input
                      className="field-input"
                      required
                      value={booking.requester_name}
                      onChange={(e) =>
                        setBooking((p) => ({ ...p, requester_name: e.target.value }))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Email
                    <input
                      className="field-input"
                      type="email"
                      required
                      value={booking.requester_email}
                      onChange={(e) =>
                        setBooking((p) => ({ ...p, requester_email: e.target.value }))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Telefoni
                    <input
                      className="field-input"
                      value={booking.requester_phone}
                      onChange={(e) =>
                        setBooking((p) => ({ ...p, requester_phone: e.target.value }))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Data e preferuar
                    <input
                      className="field-input"
                      type="date"
                      required
                      value={booking.preferred_date}
                      onChange={(e) =>
                        setBooking((p) => ({ ...p, preferred_date: e.target.value }))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Ora e preferuar
                    <input
                      className="field-input"
                      placeholder="p.sh. 14:30"
                      value={booking.preferred_time}
                      onChange={(e) =>
                        setBooking((p) => ({ ...p, preferred_time: e.target.value }))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Shënime
                    <textarea
                      className="field-input field-textarea"
                      rows={3}
                      value={booking.notes}
                      onChange={(e) =>
                        setBooking((p) => ({ ...p, notes: e.target.value }))
                      }
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={bookingSubmitting || Boolean(car?.sold_out)}
                  >
                    {bookingSubmitting ? "Duke dërguar..." : "Dërgo kërkesën"}
                  </button>
                </form>
              </div>

              <p className="muted small detail-footnote">
                Hapja e kësaj faqeje regjistron një <strong>shikim</strong> në
                sistemin e logjeve (MongoDB).
              </p>
              {isAdmin && (
                <div className="detail-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Fshi listimin
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
