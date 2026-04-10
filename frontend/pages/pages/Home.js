import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-text">
            <h1>Mirë se vini në AutoSallon</h1>
            <p>
              Shikoni veturat tona më të fundit dhe gjeni modelin që ju përshtatet më së miri.
            </p>
            <Link to="/cars">
              <button className="btn">Shiko veturat</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Pse të na zgjidhni ne?</h2>
        <div className="features">
          <div className="feature-box">
            <h3>Kualitet</h3>
            <p>Ofrojmë vetura të kontrolluara dhe të sigurta për klientët tanë.</p>
          </div>
          <div className="feature-box">
            <h3>Çmime të mira</h3>
            <p>Çmime konkurruese dhe oferta të mira për klientët.</p>
          </div>
          <div className="feature-box">
            <h3>Shërbim profesional</h3>
            <p>Komunikim i rregullt dhe ndihmë gjatë gjithë procesit.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;