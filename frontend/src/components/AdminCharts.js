function BarChart({ title, items, valueKey = "value", labelKey = "label" }) {
  if (!items?.length) {
    return (
      <div className="admin-chart-card">
        <h3 className="admin-chart-title">{title}</h3>
        <p className="muted small">Nuk ka të dhëna.</p>
      </div>
    );
  }
  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);

  return (
    <div className="admin-chart-card">
      <h3 className="admin-chart-title">{title}</h3>
      <ul className="admin-bar-chart">
        {items.map((item) => {
          const val = Number(item[valueKey]) || 0;
          const pct = Math.round((val / max) * 100);
          return (
            <li key={item[labelKey]} className="admin-bar-row">
              <span className="admin-bar-label">{item[labelKey]}</span>
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill"
                  style={{ width: `${pct}%` }}
                  title={`${val}`}
                />
              </div>
              <span className="admin-bar-value">{val}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AdminCharts({ charts, revenue }) {
  if (!charts) return null;

  const inventoryItems = charts.inventoryByStatus
    ? [
        { label: "Në dispozicion", value: charts.inventoryByStatus.available },
        { label: "Shitur", value: charts.inventoryByStatus.sold },
      ]
    : [];

  return (
    <section className="admin-charts-section" aria-label="Grafika statistikore">
      <h2 className="spec-section-title">Grafika & analitika</h2>
      {revenue ? (
        <p className="muted admin-revenue-line">
          Të ardhura neto (blerje):{" "}
          <strong>
            {Number(revenue.totalRevenueNet || 0).toLocaleString("sq-AL")} €
          </strong>
          {" · "}
          Mesatarja për blerje:{" "}
          <strong>{Number(revenue.averageAmountToAdd || 0).toLocaleString()} €</strong>
        </p>
      ) : null}
      <div className="admin-charts-grid">
        <BarChart title="Blerje sipas muajit" items={charts.purchasesByMonth} />
        <BarChart title="Inventari" items={inventoryItems} />
        <BarChart title="Test-drive sipas statusit" items={charts.testDrivesByStatus} />
        <BarChart title="Llojet e karrocerisë" items={charts.topBodyTypes} />
      </div>
    </section>
  );
}
