import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import api from "../api";
import { getUser } from "../authHelpers";
import { useAppToast } from "../components/ui/AppToastProvider";

function formatTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function formatEuro(v) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "€0";
  return n.toLocaleString("sq-AL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function Manager() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [pendingTradeIns, setPendingTradeIns] = useState([]);
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    purchase: null,
    decision: "approved",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useAppToast();

  useEffect(() => {
    const role = getUser()?.role;
    if (role !== "manager" && role !== "admin") {
      navigate("/", { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [overviewRes, pendingRes] = await Promise.all([
          api.get("/api/manager/overview"),
          api.get("/api/manager/trade-ins/pending"),
        ]);
        if (!cancelled) {
          setOverview(overviewRes.data);
          setPendingTradeIns(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || "Manager data load failed.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const openReview = (purchase, decision) => {
    setReviewDialog({
      open: true,
      purchase,
      decision,
      note: "",
    });
  };

  const closeReview = () => {
    setReviewDialog({
      open: false,
      purchase: null,
      decision: "approved",
      note: "",
    });
  };

  const submitReview = async () => {
    if (!reviewDialog.purchase) return;
    setBusy(true);
    try {
      const { data } = await api.patch(
        `/api/manager/trade-ins/${reviewDialog.purchase.id}/decision`,
        {
          decision: reviewDialog.decision,
          review_note: reviewDialog.note.trim(),
        }
      );
      setPendingTradeIns((prev) =>
        prev.filter((p) => p.id !== reviewDialog.purchase.id)
      );
      showToast(data?.message || "Trade-in review completed.", "success");
      closeReview();
    } catch (e) {
      showToast(e.response?.data?.message || e.message || "Review failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageLayout>
      <section className="section wide">
        <h1 className="page-title left">Manager Dashboard</h1>
        <p className="page-subtitle left">
          View operational overview and recent purchases. <Link to="/admin">Admin panel</Link>
        </p>

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        {overview ? (
          <>
            <Grid container spacing={2} sx={{ marginBottom: "1rem" }}>
              {[
                ["Total Cars", overview.totalCars],
                ["Available", overview.availableCars],
                ["Sold", overview.soldCars],
                ["Purchases", overview.totalPurchases],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Card>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="h5">{value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <h2 className="spec-section-title">Latest purchases</h2>
            {overview.latestPurchases?.length ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Car</th>
                      <th>Buyer</th>
                      <th>Amount added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.latestPurchases.map((p) => (
                      <tr key={p.id}>
                        <td>{formatTime(p.created_at)}</td>
                        <td>{p.car_name || `Car #${p.car_id}`}</td>
                        <td>{p.buyer_name}</td>
                        <td>{formatEuro(p.amount_to_add)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">No purchases yet.</p>
            )}

            <h2 className="spec-section-title" style={{ marginTop: "2rem" }}>
              Pending trade-in approvals
            </h2>
            {pendingTradeIns.length ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Car</th>
                      <th>Buyer</th>
                      <th>Trade-in</th>
                      <th>Current amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTradeIns.map((p) => (
                      <tr key={p.id}>
                        <td>{formatTime(p.created_at)}</td>
                        <td>{p.car_name || `Car #${p.car_id}`}</td>
                        <td>
                          {p.buyer_name}
                          <br />
                          <span className="muted">{p.buyer_email}</span>
                        </td>
                        <td>
                          <strong>{p.trade_in_car}</strong>
                          {p.trade_in_year ? ` (${p.trade_in_year})` : ""}
                          <br />
                          <span className="muted">
                            {p.trade_in_mileage_km != null
                              ? `${Number(p.trade_in_mileage_km).toLocaleString()} km`
                              : "—"}
                            {" · "}
                            {formatEuro(p.trade_in_value)}
                          </span>
                        </td>
                        <td>{formatEuro(p.amount_to_add)}</td>
                        <td>
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => openReview(p, "approved")}
                            sx={{ mr: 1, mb: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => openReview(p, "rejected")}
                            sx={{ mb: 1 }}
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">No pending trade-ins.</p>
            )}
          </>
        ) : null}
        <Dialog open={reviewDialog.open} onClose={closeReview} maxWidth="sm" fullWidth>
          <DialogTitle>
            {reviewDialog.decision === "approved"
              ? "Approve trade-in"
              : "Reject trade-in"}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Purchase #{reviewDialog.purchase?.id} - {reviewDialog.purchase?.car_name}
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Manager note"
              value={reviewDialog.note}
              onChange={(e) =>
                setReviewDialog((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeReview} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submitReview} variant="contained" disabled={busy}>
              {busy ? "Saving..." : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>
      </section>
    </PageLayout>
  );
}

