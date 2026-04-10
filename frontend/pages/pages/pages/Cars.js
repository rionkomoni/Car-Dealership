import { useEffect, useState } from "react";
import api from "../services/api";
import CarCard from "../components/CarCard";

function Cars() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    getCars();
  }, []);

  const getCars = async () => {
    try {
      const res = await api.get("/cars");
      setCars(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="section">
      <h2>Lista e veturave</h2>
      <div className="cars-grid">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
}

export default Cars;