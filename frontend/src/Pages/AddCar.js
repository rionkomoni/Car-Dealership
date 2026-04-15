import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";

export default function AddCar() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState("");
  const [mileageKm, setMileageKm] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [engine, setEngine] = useState("");
  const [powerHp, setPowerHp] = useState("");
  const [color, setColor] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [description, setDescription] = useState("");
  const [galleryRaw, setGalleryRaw] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const priceNum = parseFloat(price);
    const yearNum = parseInt(year, 10);

    if (Number.isNaN(priceNum) || Number.isNaN(yearNum)) {
      setError("Price and year must be valid numbers.");
      return;
    }

    const payload = {
      name,
      price: priceNum,
      year: yearNum,
      image,
    };

    if (mileageKm.trim() !== "") {
      const m = parseInt(mileageKm, 10);
      if (!Number.isNaN(m)) payload.mileage_km = m;
    }
    if (fuel.trim()) payload.fuel = fuel.trim();
    if (transmission.trim()) payload.transmission = transmission.trim();
    if (engine.trim()) payload.engine = engine.trim();
    if (powerHp.trim() !== "") {
      const p = parseInt(powerHp, 10);
      if (!Number.isNaN(p)) payload.power_hp = p;
    }
    if (color.trim()) payload.color = color.trim();
    if (bodyType.trim()) payload.body_type = bodyType.trim();
    if (description.trim()) payload.description = description.trim();

    const galleryLines = galleryRaw
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (galleryLines.length) payload.gallery = galleryLines;

    try {
      const { data } = await api.post("/api/cars", payload);
      const id = data.id;
      if (id) navigate(`/cars/${id}`);
      else navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Could not add vehicle";
      setError(msg);
    }
  };

  return (
    <PageLayout>
      <section className="section narrow add-car-section">
        <h1 className="page-title">Add a listing</h1>
        <p className="page-subtitle">
          Required fields below; add specs so buyers see full details on the
          home page.
        </p>

        <form className="auth-card" onSubmit={handleSubmit}>
          {error && <p className="error-text">{error}</p>}
          <label className="field-label">
            Name
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Price (EUR)
            <input
              className="field-input"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Year
            <input
              className="field-input"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Image URL
            <input
              className="field-input"
              type="url"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Extra photo URLs (optional, one per line)
            <textarea
              className="field-input field-textarea"
              rows={3}
              placeholder="https://...&#10;https://..."
              value={galleryRaw}
              onChange={(e) => setGalleryRaw(e.target.value)}
            />
          </label>

          <p className="form-section-label">Specs (optional)</p>
          <label className="field-label">
            Mileage (km)
            <input
              className="field-input"
              type="number"
              min="0"
              value={mileageKm}
              onChange={(e) => setMileageKm(e.target.value)}
            />
          </label>
          <label className="field-label">
            Body type
            <input
              className="field-input"
              placeholder="e.g. SUV, Sedan, Coupe"
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
            />
          </label>
          <label className="field-label">
            Fuel
            <input
              className="field-input"
              placeholder="Petrol, Diesel, Electric…"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
            />
          </label>
          <label className="field-label">
            Transmission
            <input
              className="field-input"
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
            />
          </label>
          <label className="field-label">
            Engine
            <input
              className="field-input"
              placeholder="e.g. 3.0L V6 turbo"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
            />
          </label>
          <label className="field-label">
            Power (hp)
            <input
              className="field-input"
              type="number"
              min="0"
              value={powerHp}
              onChange={(e) => setPowerHp(e.target.value)}
            />
          </label>
          <label className="field-label">
            Color
            <input
              className="field-input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
          <label className="field-label">
            Description
            <textarea
              className="field-input field-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <button type="submit" className="btn btn-primary">
            Publish listing
          </button>
          <p className="form-footer">
            <Link to="/">Back to listings</Link>
          </p>
        </form>
      </section>
    </PageLayout>
  );
}
