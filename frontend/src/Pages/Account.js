import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { fetchWishlist, toggleWishlist } from "../store/wishlistSlice";

function formatPrice(value) {
  const n = typeof value === "number" ? value : parseFloat(value, 10);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export default function Account() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const wishlistIds = useSelector((s) => s.wishlist.ids);
  const [purchases, setPurchases] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const tasks = [
          api.get("/api/users/me/purchases"),
          api.get("/api/users/me/test-drives"),
        ];
        if (token) {
          tasks.push(dispatch(fetchWishlist()).unwrap());
        }
        const [pRes, tRes] = await Promise.all(tasks.slice(0, 2));
        if (token) {
          await tasks[2];
        }
        if (!cancelled) {
          setPurchases(pRes.data?.data || []);
          setTestDrives(tRes.data?.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Nuk u ngarkuan të dhënat e llogarisë."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, dispatch]);

  const wishlistDisplay =
    token && wishlistItems.length > 0
      ? wishlistItems
      : wishlistIds.map((id) => ({ car_id: id, id }));

  return (
    <PageLayout>
      <section className="section wide account-page">
        <h1 className="page-title">Llogaria ime</h1>
        <p className="page-subtitle">
          Përshëndetje{user?.name ? `, ${user.name}` : ""}. Blerjet, test-drive dhe
          lista e dëshirave{token ? " (ruhen në databazë)" : " (lokale)"}.
        </p>

        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p>Duke ngarkuar…</p> : null}

        {!loading ? (
          <>
            <h2 className="section-heading">Lista e dëshirave ({wishlistIds.length})</h2>
            {wishlistIds.length === 0 ? (
              <p className="muted">
                Ende nuk keni favorit.{" "}
                <Link to="/#inventory">Shfletoni inventarin</Link>.
              </p>
            ) : (
              <ul className="account-list account-wishlist-grid">
                {wishlistDisplay.map((item) => {
                  const carId = item.car_id || item.id;
                  return (
                    <li key={carId} className="account-card account-wishlist-card">
                      {item.image ? (
                        <img src={item.image} alt="" className="account-wishlist-thumb" />
                      ) : null}
                      <div>
                        <strong>
                          <Link to={`/cars/${carId}`}>{item.name || `Vetura #${carId}`}</Link>
                        </strong>
                        {item.year ? (
                          <p className="muted">
                            {formatPrice(item.price)} · {item.year}
                            {item.sold_out ? " · Shitur" : ""}
                          </p>
                        ) : null}
                        <div className="account-wishlist-actions">
                          <Link to={`/cars/${carId}`} className="btn btn-ghost">
                            Shiko
                          </Link>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => dispatch(toggleWishlist(carId))}
                          >
                            Hiq
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <h2 className="section-heading">Blerjet e mia</h2>
            {purchases.length === 0 ? (
              <p className="muted">
                Ende nuk keni blerje.{" "}
                <Link to="/#inventory">Shfletoni inventarin</Link>.
              </p>
            ) : (
              <ul className="account-list">
                {purchases.map((p) => (
                  <li key={p.id} className="account-card">
                    <strong>
                      {p.car_name || `Vetura #${p.car_id}`}
                      {p.car_year ? ` (${p.car_year})` : ""}
                    </strong>
                    <p>Çmimi: {p.car_price} € · {p.payment_method}</p>
                    {p.trade_in_car ? (
                      <p>
                        Trade-in: {p.trade_in_car} — statusi:{" "}
                        {p.trade_in_status || "n/a"}
                      </p>
                    ) : null}
                    <p className="muted">
                      {new Date(p.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <h2 className="section-heading">Test-drive</h2>
            {testDrives.length === 0 ? (
              <p className="muted">Nuk keni kërkesa për test-drive.</p>
            ) : (
              <ul className="account-list">
                {testDrives.map((t) => (
                  <li key={t.id} className="account-card">
                    <strong>
                      <Link to={`/cars/${t.car_id}`}>
                        {t.car_name || `Vetura #${t.car_id}`}
                      </Link>
                      {t.car_year ? ` (${t.car_year})` : ""}
                    </strong>
                    <p>
                      {t.preferred_date} · {t.preferred_time} —{" "}
                      <span className="status-pill">{t.status}</span>
                    </p>
                    {t.notes ? <p>{t.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </section>
    </PageLayout>
  );
}
