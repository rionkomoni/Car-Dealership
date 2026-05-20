export default function HomeSearchStrip({ filters, onChange, onClear }) {
  return (
    <form
      className="showroom-search"
      onSubmit={(e) => e.preventDefault()}
      aria-label="Kërko dhe filtro inventarin"
    >
      <div className="showroom-search-inner">
        <label className="showroom-search-field showroom-search-field--wide">
          <span className="showroom-search-label">Kërko</span>
          <input
            type="search"
            className="showroom-search-input"
            placeholder="Emri, motori, ngjyra…"
            value={filters.q}
            onChange={(e) => onChange("q", e.target.value)}
          />
        </label>
        <label className="showroom-search-field">
          <span className="showroom-search-label">Çmimi min</span>
          <input
            type="number"
            min="0"
            className="showroom-search-input"
            placeholder="€"
            value={filters.minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
          />
        </label>
        <label className="showroom-search-field">
          <span className="showroom-search-label">Çmimi max</span>
          <input
            type="number"
            min="0"
            className="showroom-search-input"
            placeholder="€"
            value={filters.maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
          />
        </label>
        <label className="showroom-search-field">
          <span className="showroom-search-label">Viti</span>
          <input
            type="number"
            min="1950"
            className="showroom-search-input"
            placeholder="Min"
            value={filters.minYear}
            onChange={(e) => onChange("minYear", e.target.value)}
          />
        </label>
        <label className="showroom-search-field">
          <span className="showroom-search-label">Karburanti</span>
          <input
            className="showroom-search-input"
            placeholder="Petrol, Diesel…"
            value={filters.fuel}
            onChange={(e) => onChange("fuel", e.target.value)}
          />
        </label>
        <label className="showroom-search-field">
          <span className="showroom-search-label">Rendit</span>
          <select
            className="showroom-search-input"
            value={filters.sort}
            onChange={(e) => onChange("sort", e.target.value)}
          >
            <option value="latest">Më të rejat</option>
            <option value="price_asc">Çmimi ↑</option>
            <option value="price_desc">Çmimi ↓</option>
            <option value="year_desc">Viti ↓</option>
            <option value="mileage_asc">KM ↑</option>
          </select>
        </label>
        <div className="showroom-search-actions">
          <label className="showroom-search-check">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(e) => onChange("availableOnly", e.target.checked)}
            />
            Vetëm në dispozicion
          </label>
          <button type="button" className="btn btn-ghost showroom-search-clear" onClick={onClear}>
            Pastro
          </button>
        </div>
      </div>
    </form>
  );
}
