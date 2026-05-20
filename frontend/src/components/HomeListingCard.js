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

export default function HomeListingCard({
  car,
  isWishlisted = false,
  isCompared = false,
  onToggleWishlist,
  onToggleCompare,
}) {
  if (!car) return null;
  const isSoldOut = Boolean(car.sold_out);

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
  const specLine = specParts.join(" · ");

  const to = `/cars/${car.id}`;
  const contactInterest = {
    carInterest: `${car.name} — ${priceStr} — viti ${car.year} (ID #${car.id})`,
  };

  return (
    <article className={`home-listing-card${isSoldOut ? " is-sold" : ""}`}>
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
          {isSoldOut ? (
            <span className="home-listing-sold-badge">SOLD OUT</span>
          ) : null}
          <div className="home-listing-toolbar">
            <button
              type="button"
              className={`home-listing-tool${isWishlisted ? " is-active" : ""}`}
              title={isWishlisted ? "Hiq nga favoritet" : "Ruaj favorit"}
              aria-pressed={isWishlisted}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist?.(car);
              }}
            >
              {isWishlisted ? "\u2665" : "\u2661"}
            </button>
            <button
              type="button"
              className={`home-listing-tool${isCompared ? " is-active" : ""}`}
              title={isCompared ? "Hiq nga krahasimi" : "Krahaso"}
              aria-pressed={isCompared}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare?.(car);
              }}
            >
              {"\u2696"}
            </button>
          </div>
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
          {specLine ? (
            <p className="home-listing-specline">{specLine}</p>
          ) : null}
          <ul className="home-listing-specs-list">
            {mileage ? (
              <li>
                <span className="home-listing-spec-label">KM:</span> {mileage}
              </li>
            ) : null}
            {car.fuel ? (
              <li>
                <span className="home-listing-spec-label">Karburanti:</span>{" "}
                {car.fuel}
              </li>
            ) : null}
          </ul>
        </div>
      </Link>
      <div className="home-listing-actions">
        <Link to={to} className="home-listing-action home-listing-action--detail">
          Detaje
        </Link>
        {isSoldOut ? (
          <span className="home-listing-action home-listing-action--buy" aria-disabled="true">
            Shitur
          </span>
        ) : (
          <Link
            to={`/cars/${car.id}/buy`}
            state={contactInterest}
            className="home-listing-action home-listing-action--buy"
          >
            Bli tani
          </Link>
        )}
      </div>
    </article>
  );
}
