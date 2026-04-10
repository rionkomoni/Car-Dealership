import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { TOKEN_KEY } from "../authStorage";
import { isAdmin } from "../authHelpers";

function formatTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export default function CarLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      navigate("/login", { state: { from: "/logs" } });
      return;
    }
    if (!isAdmin()) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get("/api/car-logs");
        if (!cancelled) setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              "Could not load logs. Is MongoDB running?"
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

  if (!localStorage.getItem(TOKEN_KEY) || !isAdmin()) {
    return null;
  }

  return (
    <PageLayout>
      <section className="section wide">
        <h1 className="page-title">Car activity (MongoDB)</h1>
        <p className="page-subtitle left">
          Admin-only. Recent <strong>view</strong>, <strong>create</strong>,{" "}
          <strong>update</strong>, and <strong>delete</strong> events.{" "}
          <Link to="/admin">Admin</Link> · <Link to="/">Home</Link>
        </p>

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p className="muted">
            No log entries yet. Open a car detail page or add a listing (with
            MongoDB running).
          </p>
        )}

        {logs.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Car ID</th>
                  <th>Name</th>
                  <th>User ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row._id}>
                    <td>{formatTime(row.createdAt)}</td>
                    <td>{row.action}</td>
                    <td>{row.carId ?? "—"}</td>
                    <td>{row.carName ?? "—"}</td>
                    <td>{row.userId ?? "—"}</td>
                    <td>{row.details ?? "—"}</td>
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
