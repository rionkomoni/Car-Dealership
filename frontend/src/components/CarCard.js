import { Link } from "react-router-dom";

function SpecRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="car-spec-row">
      <span className="car-spec-label">{label}</span>
      <span className="car-spec-value">{value}</span>
    </div>
  );
}

function CarCard({ car }) {
  if (!car) return null;

  const priceNum =
    typeof car.price === "number" ? car.price : parseFloat(car.price, 10);
  const price = Number.isFinite(priceNum)
    ? priceNum.toLocaleString(undefined, {
        style: "currency",
        currency: "EUR",
      })
    : car.price;

  const power =
    car.power_hp != null && car.power_hp !== ""
      ? `${car.power_hp} hp`
      : null;

  const mileage =
    car.mileage_km != null && car.mileage_km !== ""
      ? `${Number(car.mileage_km).toLocaleString()} km`
      : null;

  return (
    <Link to={`/cars/${car.id}`} className="car-card-link">
      <article className="car-card">
        {car.image ? (
          <img
            src={car.image}
            alt={car.name}
            className="car-card-image"
          />
        ) : null}
        <div className="car-card-body">
          <h3 className="car-card-title">{car.name}</h3>
          {car.body_type ? (
            <p className="car-card-badge">{car.body_type}</p>
          ) : null}
          <p className="car-card-price">{price}</p>
          <div className="car-card-specs">
            <SpecRow label="Year" value={car.year} />
            <SpecRow label="Mileage" value={mileage} />
            <SpecRow label="Fuel" value={car.fuel} />
            <SpecRow label="Transmission" value={car.transmission} />
            <SpecRow label="Engine" value={car.engine} />
            <SpecRow label="Power" value={power} />
            <SpecRow label="Color" value={car.color} />
          </div>
          {car.description ? (
            <p className="car-card-blurb">{car.description}</p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export default CarCard;
