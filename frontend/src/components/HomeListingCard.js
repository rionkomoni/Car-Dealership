import { Link } from "react-router-dom";

function formatPrice(car) {
  const priceNum =
    typeof car.price === "number" ? car.price : parseFloat(car.price, 10);
  if (!Number.isFinite(priceNum)) return car.price;
  return priceNum.toLocaleString("sq-AL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function HomeListingCard({ car }) {
  if (!car) return null;

  const priceStr = formatPrice(car);
  const mileage =
    car.mileage_km != null && car.mileage_km !== ""
      ? `${Number(car.mileage_km).toLocaleString()} km`
      : null;

  const transShort =
    car.transmission && /auto|tiptronic|dct|steptronic/i.test(car.transmission)
      ? "Automat"
      : car.transmission || null;

  const specParts = [
    car.engine || null,
    transShort,
    car.power_hp != null && car.power_hp !== ""
      ? `${car.power_hp} HP`
      : null,
  ].filter(Boolean);
  const specLine = specParts.join(" | ");

  const to = `/cars/${car.id}`;
  const contactInterest = {
    carInterest: `${car.name} — ${priceStr} — viti ${car.year} (ID #${car.id})`,
  };

  return (
    <article className="home-listing-card">
      <Link to={to} className="home-listing-card-main">
        <div className="home-listing-image-wrap">
          {car.image ? (
            <img
              src={car.image}
              alt={car.name}
              className="home-listing-image"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="home-listing-image home-listing-image--empty">
              Nuk ka foto
            </div>
          )}
          <div className="home-listing-overlays">
            <span className="home-listing-overlay-cell">{priceStr}</span>
            <span className="home-listing-overlay-cell">{car.year}</span>
          </div>
        </div>
        <div className="home-listing-body">
          <div className="home-listing-title-row">
            <h3 className="home-listing-title">{car.name}</h3>
            {car.body_type ? (
              <span className="home-listing-pill">{car.body_type}</span>
            ) : null}
          </div>
          <p className="home-listing-price-year">
            {priceStr} · {car.year}
          </p>
          <ul className="home-listing-specs-list">
            <li>
              <span className="home-listing-spec-label">Viti:</span> {car.year}
            </li>
            {mileage ? (
              <li>
                <span className="home-listing-spec-label">Kilometrazhi:</span>{" "}
                {mileage}
              </li>
            ) : null}
            {car.fuel ? (
              <li>
                <span className="home-listing-spec-label">Karburanti:</span>{" "}
                {car.fuel}
              </li>
            ) : null}
            {car.color ? (
              <li>
                <span className="home-listing-spec-label">Ngjyra:</span>{" "}
                {car.color}
              </li>
            ) : null}
          </ul>
          {specLine ? (
            <p className="home-listing-specline">{specLine}</p>
          ) : null}
        </div>
      </Link>
      <div className="home-listing-actions">
        <Link to={to} className="home-listing-action home-listing-action--detail">
          Pamje &amp; specifikacione
        </Link>
        <Link
          to={`/contact?car=${car.id}`}
          state={contactInterest}
          className="home-listing-action home-listing-action--buy"
        >
          Bli tani
        </Link>
      </div>
    </article>
  );
}
