const FEATURES = [
  {
    icon: "🔍",
    title: "Kërkim inteligjent",
    text: "Filtroni sipas çmimit, vitit, karburantit dhe renditni rezultatet në kohë reale nga API-ja.",
  },
  {
    icon: "⚖️",
    title: "Krahaso deri në 3",
    text: "Zgjidhni makina dhe krahasoni çmimin, vitin dhe kilometrat pa dalë nga faqja.",
  },
  {
    icon: "❤️",
    title: "Lista e dëshirave",
    text: "Ruani favoritet në databazë (pas kyçjes) ose lokale; shikoni listën te Llogaria ime.",
  },
  {
    icon: "🚗",
    title: "Test-drive online",
    text: "Rezervoni provë drejtimi direkt nga faqja e veturës — statusi shfaqet te Llogaria ime.",
  },
  {
    icon: "💳",
    title: "Blerje & trade-in",
    text: "Proces i plotë blerjeje me opsion këmbimi (trade-in) dhe llogaritje të shumës për të shtuar.",
  },
  {
    icon: "🛡️",
    title: "Role & siguri",
    text: "JWT, refresh token, panele Admin/Manager dhe audit për veprime kritike në sistem.",
  },
  {
    icon: "📷",
    title: "Ngarkim foto",
    text: "Admin ngarkon foto kryesore dhe galeri direkt në server — pa u mbështetur vetëm te URL të jashtme.",
  },
  {
    icon: "📊",
    title: "Grafika & analitika",
    text: "Paneli Admin shfaq blerje sipas muajit, inventarin, test-drive dhe llojet e karrocerisë.",
  },
  {
    icon: "📄",
    title: "Faturë PDF",
    text: "Manager dhe Admin shkarkojnë faturën e blerjes në PDF për çdo transaksion të regjistruar.",
  },
];

const STATS = [
  { value: "24/7", label: "Shfletim inventari" },
  { value: "100%", label: "Specifika të hapura" },
  { value: "3", label: "Role përdoruesi" },
  { value: "API", label: "OpenAPI / Swagger" },
];

export default function HomePlatformInfo() {
  return (
    <>
      <section className="showroom-trust" aria-label="Statistika platforme">
        <div className="showroom-trust-inner">
          {STATS.map((s) => (
            <div key={s.label} className="showroom-trust-item">
              <strong className="showroom-trust-value">{s.value}</strong>
              <span className="showroom-trust-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="showroom-why" aria-labelledby="why-heading">
        <div className="showroom-section-head">
          <h2 id="why-heading" className="showroom-section-title">
            Pse Car Dealership?
          </h2>
          <p className="showroom-section-lead">
            Më shumë se listim — një përvojë digjitale e plotë për blerës dhe ekipin
            e autosallonit.
          </p>
        </div>
        <div className="showroom-why-grid">
          <article className="showroom-why-card">
            <span className="showroom-why-icon" aria-hidden>
              ✓
            </span>
            <h3>Vetura të verifikuara</h3>
            <p>Kilometrazh, karburant dhe specifika teknike të dokumentuara për çdo listim.</p>
          </article>
          <article className="showroom-why-card">
            <span className="showroom-why-icon" aria-hidden>
              €
            </span>
            <h3>Transparencë çmimi</h3>
            <p>Pa surpriza: çmimi, viti dhe gjendja shfaqen qartë para se të kontaktoni.</p>
          </article>
          <article className="showroom-why-card">
            <span className="showroom-why-icon" aria-hidden>
              ★
            </span>
            <h3>Shërbim personal</h3>
            <p>Nga kërkesa e test-drive deri te finalizimi i blerjes me mbështetje të ekipit.</p>
          </article>
        </div>
      </section>

      <section className="showroom-platform" aria-labelledby="platform-heading">
        <div className="showroom-section-head">
          <h2 id="platform-heading" className="showroom-section-title">
            Çfarë ofron web-i?
          </h2>
          <p className="showroom-section-lead">
            Platforma kombinon frontend React, API REST me JWT dhe baza të dhënash
            MySQL + MongoDB — e përshtatshme për prezantim akademik dhe përdorim real.
          </p>
        </div>
        <div className="showroom-platform-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="showroom-platform-card">
              <span className="showroom-platform-icon" aria-hidden>
                {f.icon}
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
