import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import HomeListingCard from "../components/HomeListingCard";
import api from "../api";

const HERO_CAR_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=85";

export default function Home() {
  const role = useSelector((s) => s.auth.user?.role);
  const isAdmin = role === "admin";
  const [cars, setCars] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 8, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    fuel: "",
    transmission: "",
    bodyType: "",
    availableOnly: true,
    sort: "latest",
    page: 1,
    pageSize: 8,
  });
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const raw = localStorage.getItem("car_wishlist_ids");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [compareCars, setCompareCars] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v === "" || v === null || v === undefined) return;
          params.set(k, String(v));
        });
        const { data } = await api.get(`/api/cars?${params.toString()}`);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
          : Array.isArray(data?.cars)
            ? data.cars
            : [];
        if (!cancelled) {
          setCars(list);
          setMeta({
            total: Number(data?.meta?.total || list.length || 0),
            page: Number(data?.meta?.page || filters.page || 1),
            pageSize: Number(data?.meta?.pageSize || filters.pageSize || 8),
            totalPages: Number(data?.meta?.totalPages || 1),
          });
        }
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
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("car_wishlist_ids", JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const compareIds = useMemo(() => compareCars.map((c) => c.id), [compareCars]);

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === "page" ? value : 1,
    }));
  }

  function handleToggleWishlist(car) {
    setWishlistIds((prev) =>
      prev.includes(car.id) ? prev.filter((id) => id !== car.id) : [...prev, car.id]
    );
  }

  function handleToggleCompare(car) {
    setCompareCars((prev) => {
      if (prev.some((c) => c.id === car.id)) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), car];
      }
      return [...prev, car];
    });
  }

  return (
    <PageLayout>
      <section className="home-hero home-hero--split" aria-labelledby="home-heading">
        <div className="home-hero-copy">
          <h1 id="home-heading" className="home-hero-title">
            Gjej veturën tënde
          </h1>
          <p className="home-hero-lead">
            Zbuloni koleksionin tonë të përzgjedhur të makinave cilësore. Oferta
            speciale dhe shërbim profesional.
          </p>
          <div className="home-hero-actions">
            <a href="#inventory" className="btn home-hero-btn home-hero-btn--primary">
              Shiko inventarin
            </a>
            <Link
              to="/contact"
              className="btn home-hero-btn home-hero-btn--outline"
            >
              Na kontakto
            </Link>
          </div>
        </div>
        <div className="home-hero-visual" aria-hidden="true">
          <img src={HERO_CAR_IMAGE} alt="" className="home-hero-car" />
          <div className="home-hero-visual-fade" />
        </div>
      </section>

      <section
        id="inventory"
        className="home-inventory-block section wide"
        aria-labelledby="inventory-heading"
      >
        <h2 id="inventory-heading" className="home-inventory-heading">
          Stoku ynë - Makinat në shitje
        </h2>
        <p className="center muted home-status">
          Këtu gjenden të gjitha makinat në inventar ({meta.total} gjithsej).
        </p>

        <div className="auth-card" style={{ marginBottom: "1rem" }}>
          <h3 className="spec-section-title">Kërko dhe filtro</h3>
          <div className="spec-grid">
            <label className="field-label">
              Kërko (emri/motori/ngjyra)
              <input
                className="field-input"
                value={filters.q}
                onChange={(e) => updateFilter("q", e.target.value)}
              />
            </label>
            <label className="field-label">
              Çmimi min
              <input
                className="field-input"
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
              />
            </label>
            <label className="field-label">
              Çmimi max
              <input
                className="field-input"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
              />
            </label>
            <label className="field-label">
              Viti min
              <input
                className="field-input"
                type="number"
                min="1950"
                value={filters.minYear}
                onChange={(e) => updateFilter("minYear", e.target.value)}
              />
            </label>
            <label className="field-label">
              Viti max
              <input
                className="field-input"
                type="number"
                min="1950"
                value={filters.maxYear}
                onChange={(e) => updateFilter("maxYear", e.target.value)}
              />
            </label>
            <label className="field-label">
              Karburanti
              <input
                className="field-input"
                value={filters.fuel}
                onChange={(e) => updateFilter("fuel", e.target.value)}
                placeholder="p.sh. Petrol"
              />
            </label>
            <label className="field-label">
              Transmisioni
              <input
                className="field-input"
                value={filters.transmission}
                onChange={(e) => updateFilter("transmission", e.target.value)}
                placeholder="p.sh. Automatic"
              />
            </label>
            <label className="field-label">
              Body type
              <input
                className="field-input"
                value={filters.bodyType}
                onChange={(e) => updateFilter("bodyType", e.target.value)}
                placeholder="SUV/Sedan..."
              />
            </label>
            <label className="field-label">
              Rendit sipas
              <select
                className="field-input"
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
              >
                <option value="latest">Më të rejat</option>
                <option value="price_asc">Çmimi: më i ulët</option>
                <option value="price_desc">Çmimi: më i lartë</option>
                <option value="year_desc">Viti: më i ri</option>
                <option value="year_asc">Viti: më i vjetër</option>
                <option value="mileage_asc">KM: më i ulët</option>
                <option value="mileage_desc">KM: më i lartë</option>
              </select>
            </label>
          </div>
          <label className="field-label" style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(e) => updateFilter("availableOnly", e.target.checked)}
            />
            Vetëm makinat në dispozicion
          </label>
          <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  q: "",
                  minPrice: "",
                  maxPrice: "",
                  minYear: "",
                  maxYear: "",
                  fuel: "",
                  transmission: "",
                  bodyType: "",
                  availableOnly: true,
                  sort: "latest",
                  page: 1,
                }))
              }
            >
              Pastro filtrat
            </button>
          </div>
        </div>

        {compareCars.length > 0 ? (
          <div className="auth-card" style={{ marginBottom: "1rem" }}>
            <h3 className="spec-section-title">Krahasimi (max 3)</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Makina</th>
                    <th style={{ textAlign: "left" }}>Çmimi</th>
                    <th style={{ textAlign: "left" }}>Viti</th>
                    <th style={{ textAlign: "left" }}>KM</th>
                    <th style={{ textAlign: "left" }}>Fuel</th>
                  </tr>
                </thead>
                <tbody>
                  {compareCars.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.price}</td>
                      <td>{c.year}</td>
                      <td>{c.mileage_km ?? "-"}</td>
                      <td>{c.fuel || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {loading && (
          <p className="center muted home-status">Duke ngarkuar inventarin…</p>
        )}
        {error && (
          <p className="center error-text home-status" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && cars.length === 0 && (
          <div className="home-empty">
            <p className="center muted">
              Ende nuk ka vetura në listë.{" "}
              {isAdmin ? (
                <>
                  Shto inventarin nga <Link to="/admin">Admin Dashboard</Link>.
                </>
              ) : (
                <>Vetëm admini mund të shtojë listime.</>
              )}
            </p>
          </div>
        )}

        {!loading && !error && cars.length > 0 && (
          <div className="home-listing-grid">
            {cars.map((car) => (
              <HomeListingCard
                key={car.id}
                car={car}
                isWishlisted={wishlistIds.includes(car.id)}
                isCompared={compareIds.includes(car.id)}
                onToggleWishlist={handleToggleWishlist}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        )}

        {!loading && !error && cars.length > 0 ? (
          <div style={{ display: "flex", justifyContent: "center", gap: ".5rem", marginTop: "1rem" }}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={meta.page <= 1}
              onClick={() => updateFilter("page", meta.page - 1)}
            >
              ← Para
            </button>
            <span className="muted" style={{ alignSelf: "center" }}>
              Faqja {meta.page} / {meta.totalPages}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={meta.page >= meta.totalPages}
              onClick={() => updateFilter("page", meta.page + 1)}
            >
              Tjetra →
            </button>
          </div>
        ) : null}
      </section>

      <section id="about" className="home-about section">
        <h2 className="home-about-heading">Rreth nesh</h2>
        <p className="home-about-text">
          Car Dealership është autosallon i specializuar për vetura të
          verifikuara premium dhe familjare. Ne ofrojmë transparencë të plotë
          për çmimin, kilometrat dhe gjendjen teknike, me mbështetje nga
          konsultimi fillestar deri te finalizimi i blerjes.
        </p>
      </section>
    </PageLayout>
  );
}
