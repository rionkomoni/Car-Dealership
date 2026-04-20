import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { getCarImageUrls } from "../utils/carGallery";

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
  const isAdmin = role === "admin";

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

  const mainSrc =
    imageUrls.length > 0 ? imageUrls[photoIndex] : null;

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
                      to={`/contact?car=${car.id}`}
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
                      to={`/contact?car=${car.id}`}
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
