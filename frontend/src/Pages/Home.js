import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import HomeListingCard from "../components/HomeListingCard";
import HomeSearchStrip from "../components/HomeSearchStrip";
import HomePlatformInfo from "../components/HomePlatformInfo";
import api from "../api";
import { toggleWishlist } from "../store/wishlistSlice";

const HERO_CAR_IMAGE =
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1920&q=88";

const DEFAULT_FILTERS = {
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
};

export default function Home() {
  const dispatch = useDispatch();
  const role = useSelector((s) => s.auth.user?.role);
  const wishlistIds = useSelector((s) => s.wishlist.ids);
  const isAdmin = role === "admin";
  const [cars, setCars] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 8, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
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

  const compareIds = useMemo(() => compareCars.map((c) => c.id), [compareCars]);

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === "page" ? value : 1,
    }));
  }

  function clearFilters() {
    setFilters({ ...DEFAULT_FILTERS });
  }

  function handleToggleWishlist(car) {
    dispatch(toggleWishlist(car.id));
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
      <section className="showroom-hero" aria-labelledby="home-heading">
        <div className="showroom-hero-bg">
          <img src={HERO_CAR_IMAGE} alt="" />
        </div>
        <div className="showroom-hero-content">
          <span className="showroom-hero-badge">Showroom Digital</span>
          <h1 id="home-heading" className="showroom-hero-title">
            Gjej veturën tënde
          </h1>
          <p className="showroom-hero-lead">
            Koleksion premium me specifika të hapura, krahasim live dhe blerje
            online — nga shfletimi deri te test-drive.
          </p>
          <div className="showroom-hero-actions">
            <a href="#inventory" className="showroom-hero-btn showroom-hero-btn--primary">
              Shiko inventarin
            </a>
            <Link to="/contact" className="showroom-hero-btn showroom-hero-btn--ghost">
              Na kontakto
            </Link>
          </div>
        </div>
        <HomeSearchStrip
          filters={filters}
          onChange={updateFilter}
          onClear={clearFilters}
        />
      </section>

      <section
        id="inventory"
        className="showroom-inventory showroom-wrap"
        aria-labelledby="inventory-heading"
      >
        <div className="showroom-inventory-head">
          <h2 id="inventory-heading" className="showroom-section-title">
            Inventari ynë
          </h2>
          <p className="showroom-section-lead">
            {meta.total} vetura — {wishlistIds.length} në listën tuaj të dëshirave.
          </p>
        </div>

        {compareCars.length > 0 ? (
          <div className="showroom-compare">
            <h3 className="spec-section-title">Krahasimi ({compareCars.length}/3)</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Makina</th>
                    <th>Çmimi</th>
                    <th>Viti</th>
                    <th>KM</th>
                    <th>Karburanti</th>
                  </tr>
                </thead>
                <tbody>
                  {compareCars.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.price}</td>
                      <td>{c.year}</td>
                      <td>{c.mileage_km ?? "—"}</td>
                      <td>{c.fuel || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {loading && (
          <div className="showroom-skeleton-grid" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="showroom-skeleton-card" />
            ))}
          </div>
        )}

        {error && (
          <p className="center error-text" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && cars.length === 0 && (
          <div className="home-empty">
            <p className="center muted">
              Nuk u gjet asnjë veturë me këto filtra.{" "}
              <button type="button" className="btn btn-ghost" onClick={clearFilters}>
                Pastro filtrat
              </button>
              {isAdmin ? (
                <>
                  {" "}
                  ose <Link to="/admin">shto listim</Link> nga Admin.
                </>
              ) : null}
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
          <div className="showroom-pagination">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={meta.page <= 1}
              onClick={() => updateFilter("page", meta.page - 1)}
            >
              ← Para
            </button>
            <span className="muted">
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

      <HomePlatformInfo />

      <section id="about" className="showroom-about">
        <h2 className="showroom-section-title">Rreth nesh</h2>
        <p className="home-about-text">
          Car Dealership është autosallon i specializuar për vetura të verifikuara.
          Platforma jonë web lidh inventarin, blerjen, test-drive dhe menaxhimin e
          ekipit në një vend të vetëm — e ndërtuar me React dhe API moderne REST.
        </p>
      </section>
    </PageLayout>
  );
}
