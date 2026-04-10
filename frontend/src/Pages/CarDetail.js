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
              "Could not load this vehicle."
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
    if (!window.confirm("Delete this listing permanently?")) return;
    try {
      await api.delete(`/api/cars/${id}`);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Delete failed");
    }
  };

  const priceNum =
    car &&
    (typeof car.price === "number" ? car.price : parseFloat(car.price, 10));
  const price =
    car && Number.isFinite(priceNum)
      ? priceNum.toLocaleString(undefined, {
          style: "currency",
          currency: "EUR",
        })
      : car?.price;

  const power =
    car && car.power_hp != null && car.power_hp !== ""
      ? `${car.power_hp} hp`
      : null;

  const mileage =
    car && car.mileage_km != null && car.mileage_km !== ""
      ? `${Number(car.mileage_km).toLocaleString()} km`
      : null;

  return (
    <PageLayout>
      <section className="section wide">
        <p className="breadcrumb">
          <Link to="/">← All vehicles</Link>
        </p>

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        {car && !loading && (
          <div className="car-detail">
            {car.image ? (
              <img
                src={car.image}
                alt={car.name}
                className="car-detail-image"
              />
            ) : null}
            <div className="car-detail-info">
              <h1 className="page-title left">{car.name}</h1>
              {car.body_type ? (
                <p className="car-detail-badge">{car.body_type}</p>
              ) : null}
              <p className="detail-price">{price}</p>

              <dl className="spec-grid">
                <SpecBlock label="Model year" value={car.year} />
                <SpecBlock label="Mileage" value={mileage} />
                <SpecBlock label="Fuel" value={car.fuel} />
                <SpecBlock label="Transmission" value={car.transmission} />
                <SpecBlock label="Engine" value={car.engine} />
                <SpecBlock label="Power" value={power} />
                <SpecBlock label="Exterior color" value={car.color} />
              </dl>

              {car.description ? (
                <div className="car-detail-about">
                  <h2 className="spec-section-title">About this vehicle</h2>
                  <p className="car-detail-description">{car.description}</p>
                </div>
              ) : null}

              <p className="muted small detail-footnote">
                Opening this page logs a <strong>view</strong> in MongoDB (Car
                logs).
              </p>
              {token && (
                <div className="detail-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Delete listing
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
