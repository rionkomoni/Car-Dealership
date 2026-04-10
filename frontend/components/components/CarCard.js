function CarCard({ car }) {
  return (
    <div className="car-card">
      <img src={car.image} alt={car.name} className="car-image" />
      <div className="car-content">
        <h3>{car.name}</h3>
        <p><strong>Çmimi:</strong> {car.price} €</p>
        <p><strong>Viti:</strong> {car.year}</p>
      </div>
    </div>
  );
}

export default CarCard;