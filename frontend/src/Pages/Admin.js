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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [statsRes, contactRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/contact"),
        ]);
        if (!cancelled) {
          setStats(statsRes.data);
          setContacts(Array.isArray(contactRes.data) ? contactRes.data : []);
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
          </div>
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
      </section>
    </PageLayout>
  );
}
