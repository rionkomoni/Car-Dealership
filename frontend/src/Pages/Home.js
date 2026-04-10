import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import HomeListingCard from "../components/HomeListingCard";
import api from "../api";

const HERO_CAR_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=85";

/** Katër karta “Nga stoku ynë” si në mockup */
const SHOWCASE_MODELS = [
  {
    name: "BMW 5 Series",
    src: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&q=85",
  },
  {
    name: "Audi Q7",
    src: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=85",
  },
  {
    name: "Mercedes-Benz GLE",
    src: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=85",
  },
  {
    name: "Volvo XC90",
    src: "https://images.unsplash.com/photo-1606016159991-dfe4f264a20d?w=800&q=85",
  },
];

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get("/api/cars");
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.cars)
            ? data.cars
            : [];
        if (!cancelled) setCars(list);
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

      <section className="home-showcase" aria-labelledby="showcase-heading">
        <div className="home-showcase-inner">
          <h2 id="showcase-heading" className="home-showcase-heading">
            Nga stoku ynë
          </h2>
          <div className="home-showcase-grid">
            {SHOWCASE_MODELS.map((item) => (
              <figure key={item.name} className="home-showcase-cell">
                <div className="home-showcase-img-wrap">
                  <img
                    src={item.src}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="home-showcase-caption">
                  {item.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="inventory"
        className="home-inventory-block section wide"
        aria-labelledby="inventory-heading"
      >
        <h2 id="inventory-heading" className="home-inventory-heading">
          Makina në shitje
        </h2>

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
              <Link to="/login">Kyçu</Link> dhe përdor{" "}
              <Link to="/cars/new">Shto listim</Link>.
            </p>
          </div>
        )}

        {!loading && !error && cars.length > 0 && (
          <div className="home-listing-grid">
            {cars.map((car) => (
              <HomeListingCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      <section id="about" className="home-about section">
        <h2 className="home-about-heading">Rreth nesh</h2>
        <p className="home-about-text">
          Car Dealership ofron përzgjedhje veturash premium me transparencë të
          plotë në çmime dhe historik. Ekipi ynë ju ndihmon të gjeni automjetin
          e duhur dhe ju ofron mbështetje gjatë gjithë procesit.
        </p>
      </section>
    </PageLayout>
  );
}
