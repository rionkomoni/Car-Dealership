import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import CarCard from "../components/CarCard";
import api from "../api";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get("/api/cars");
        if (!cancelled) setCars(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              "Could not load vehicles. Is the API running?"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageLayout>
      <section className="section hero">
        <h1 className="page-title">Browse our vehicles</h1>
        <p className="page-subtitle">
          Demo stock is nine vehicles — three <strong>BMW</strong>, three{" "}
          <strong>Audi</strong>, three <strong>Mercedes</strong> — each with
          full specs. Seeded only when the <code>cars</code> table is empty.
        </p>
      </section>

      {loading && <p className="center muted">Loading inventory…</p>}
      {error && <p className="center error-text">{error}</p>}

      {!loading && !error && cars.length === 0 && (
        <p className="center muted">
          No vehicles yet.{" "}
          <strong>Log in</strong> and use <strong>Add a listing</strong> to
          create one.
        </p>
      )}

      <div className="car-grid">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </PageLayout>
  );
}
