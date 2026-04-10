import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { TOKEN_KEY } from "../authStorage";

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
  const token = localStorage.getItem(TOKEN_KEY);

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
              {car.image ? (
                <img
                  src={car.image}
                  alt={car.name}
                  className="car-detail-image"
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

              <div className="car-detail-options">
                <h2 className="car-detail-options-title">
                  Mundësitë për ta marr makinën
                </h2>
                <ul className="car-detail-options-list">
                  <li>
                    <strong>Kontakt & ofertë:</strong> na shkruani për çmim,
                    disponueshmëri dhe pyetje — përgjigjemi sa më shpejt.
                  </li>
                  <li>
                    <strong>Financim:</strong> mund të diskutoni opsione
                    financimi me ekipin tonë pas kontaktit fillestar.
                  </li>
                  <li>
                    <strong>Vizitë / provë:</strong> mund të organizohet takim
                    për të parë veturën nga afër kur të jetë e disponueshme.
                  </li>
                </ul>
                <div className="car-detail-cta-row">
                  <Link
                    to="/contact"
                    state={contactState}
                    className="btn btn-primary car-detail-cta"
                  >
                    Interesohem për këtë veturë
                  </Link>
                  <Link to="/" className="btn btn-ghost car-detail-cta-secondary">
                    Shiko makina të tjera
                  </Link>
                </div>
              </div>

              <p className="muted small detail-footnote">
                Hapja e kësaj faqeje regjistron një <strong>shikim</strong> në
                sistemin e logjeve (MongoDB).
              </p>
              {token && (
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
