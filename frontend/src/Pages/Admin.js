import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { isAdmin } from "../authHelpers";

function formatTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyCarId, setBusyCarId] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [statsRes, contactRes, purchaseRes, carsRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/contacts"),
          api.get("/api/admin/purchases"),
          api.get("/api/cars"),
        ]);
        if (!cancelled) {
          setStats(statsRes.data);
          setContacts(Array.isArray(contactRes.data) ? contactRes.data : []);
          setPurchases(Array.isArray(purchaseRes.data) ? purchaseRes.data : []);
          const list = Array.isArray(carsRes.data?.data)
            ? carsRes.data.data
            : Array.isArray(carsRes.data)
              ? carsRes.data
              : [];
          setCars(list);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              "Could not load admin data."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!isAdmin()) {
    return null;
  }

  const fmtPrice = (v) => {
    const priceNum = typeof v === "number" ? v : parseFloat(v, 10);
    if (!Number.isFinite(priceNum)) return v;
    return priceNum.toLocaleString("sq-AL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleToggleSoldOut = async (car) => {
    setBusyCarId(car.id);
    setActionError("");
    try {
      const next = !Boolean(car.sold_out);
      await api.patch(`/api/cars/${car.id}/sold-out`, { sold_out: next });
      setCars((prev) =>
        prev.map((x) => (x.id === car.id ? { ...x, sold_out: next ? 1 : 0 } : x))
      );
    } catch (e) {
      setActionError(e.response?.data?.message || e.message || "Veprimi dështoi.");
    } finally {
      setBusyCarId(null);
    }
  };

  const handleDeleteCar = async (car) => {
    if (!window.confirm(`Të fshihet "${car.name}"?`)) return;
    setBusyCarId(car.id);
    setActionError("");
    try {
      await api.delete(`/api/cars/${car.id}`);
      setCars((prev) => prev.filter((x) => x.id !== car.id));
    } catch (e) {
      setActionError(e.response?.data?.message || e.message || "Fshirja dështoi.");
    } finally {
      setBusyCarId(null);
    }
  };

  return (
    <PageLayout>
      <section className="section wide">
        <h1 className="page-title left">Admin dashboard</h1>
        <p className="page-subtitle left">
          Visible only for users with role <strong>admin</strong>.{" "}
          <Link to="/logs">Car logs (MongoDB)</Link>
        </p>

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error-text">{error}</p>}
        {actionError && <p className="error-text">{actionError}</p>}

        <div style={{ marginTop: "1rem", marginBottom: "1.25rem" }}>
          <Link className="btn btn-primary" to="/cars/new">
            + Shto makinë të re
          </Link>
        </div>

        {stats && !loading && (
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.users}</span>
              <span className="stat-label">Users (MySQL)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.cars}</span>
              <span className="stat-label">Vehicles (MySQL)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.contactsMongo}</span>
              <span className="stat-label">Contact msgs (MongoDB)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.purchases ?? 0}</span>
              <span className="stat-label">Blerje (MySQL)</span>
            </div>
          </div>
        )}

        <h2 className="spec-section-title" style={{ marginTop: "2rem" }}>
          Blerjet dhe trade-in
        </h2>
        <p className="muted small" style={{ marginBottom: "1rem" }}>
          Këtu shihen të gjitha blerjet e regjistruara, përfshirë zbritjen nga trade-in dhe shumën për pagesë.
        </p>
        {purchases.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kur</th>
                  <th>Vetura</th>
                  <th>Blerësi</th>
                  <th>Pagesa</th>
                  <th>Trade-in</th>
                  <th>Për të shtuar</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{formatTime(p.created_at)}</td>
                    <td>
                      {(p.car_name || `Car #${p.car_id}`)}
                      {p.car_year ? ` (${p.car_year})` : ""}
                    </td>
                    <td className="cell-wrap">
                      <strong>{p.buyer_name}</strong>
                      <br />
                      <span className="muted">{p.buyer_email}</span>
                      {p.buyer_phone ? (
                        <>
                          <br />
                          <span className="muted">{p.buyer_phone}</span>
                        </>
                      ) : null}
                    </td>
                    <td>
                      {fmtPrice(p.car_price)}
                      <br />
                      <span className="muted">{p.payment_method}</span>
                    </td>
                    <td className="cell-wrap">
                      {p.trade_in_car ? (
                        <>
                          <strong>{p.trade_in_car}</strong>
                          {p.trade_in_year ? ` (${p.trade_in_year})` : ""}
                          <br />
                          <span className="muted">
                            {p.trade_in_mileage_km != null
                              ? `${Number(p.trade_in_mileage_km).toLocaleString()} km`
                              : "—"}
                            {" · "}
                            {fmtPrice(p.trade_in_value)}
                          </span>
                        </>
                      ) : (
                        <span className="muted">Pa trade-in</span>
                      )}
                    </td>
                    <td>
                      <strong>{fmtPrice(p.amount_to_add)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Nuk ka blerje të regjistruara ende.</p>
        )}

        <h2 className="spec-section-title" style={{ marginTop: "2rem" }}>
          Contact messages (MongoDB)
        </h2>
        <p className="muted small" style={{ marginBottom: "1rem" }}>
          Regular users can submit the form; only admins can read the list.
        </p>

        {contacts.length === 0 && !loading && !error && (
          <p className="muted">No messages yet.</p>
        )}

        {contacts.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((row) => (
                  <tr key={row._id}>
                    <td>{formatTime(row.createdAt)}</td>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td className="cell-wrap">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="spec-section-title" style={{ marginTop: "2rem" }}>
          Menaxhimi i inventarit
        </h2>
        <p className="muted small" style={{ marginBottom: "1rem" }}>
          Admini mund të shënojë makinat si sold out, t'i rikthejë available ose t'i fshijë.
        </p>
        {cars.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Modeli</th>
                  <th>Viti</th>
                  <th>Çmimi</th>
                  <th>Statusi</th>
                  <th>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => {
                  const sold = Boolean(car.sold_out);
                  const busy = busyCarId === car.id;
                  return (
                    <tr key={car.id}>
                      <td>{car.id}</td>
                      <td>{car.name}</td>
                      <td>{car.year}</td>
                      <td>{fmtPrice(car.price)}</td>
                      <td>{sold ? "SOLD OUT" : "Available"}</td>
                      <td className="cell-wrap">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() => handleToggleSoldOut(car)}
                          style={{ marginRight: "0.5rem" }}
                        >
                          {sold ? "Vendos available" : "Vendos sold out"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          disabled={busy}
                          onClick={() => handleDeleteCar(car)}
                        >
                          Fshi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Nuk ka makina për menaxhim.</p>
        )}
      </section>
    </PageLayout>
  );
}
