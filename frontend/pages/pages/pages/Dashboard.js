import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    year: "",
    image: "",
  });

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.post("/cars", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Vetura u shtua me sukses");

      setForm({
        name: "",
        price: "",
        year: "",
        image: "",
      });

      getCars();
    } catch (error) {
      alert(error.response?.data?.message || "Gabim gjatë shtimit");
    }
  };

  const deleteCar = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/cars/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      getCars();
    } catch (error) {
      alert(error.response?.data?.message || "Gabim gjatë fshirjes");
    }
  };

  return (
    <section className="section">
      <h2>Dashboard</h2>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Emri i veturës"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Çmimi"
          value={form.price}
          onChange={handleChange}
        />
        <input
          type="number"
          name="year"
          placeholder="Viti"
          value={form.year}
          onChange={handleChange}
        />
        <input
          type="text"
          name="image"
          placeholder="Foto URL"
          value={form.image}
          onChange={handleChange}
        />
        <button type="submit" className="btn">Shto veturë</button>
      </form>

      <div className="cars-grid">
        {cars.map((car) => (
          <div className="car-card" key={car.id}>
            <img src={car.image} alt={car.name} className="car-image" />
            <div className="car-content">
              <h3>{car.name}</h3>
              <p><strong>Çmimi:</strong> {car.price} €</p>
              <p><strong>Viti:</strong> {car.year}</p>
              <button className="btn delete-btn" onClick={() => deleteCar(car.id)}>
                Fshij
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Dashboard;