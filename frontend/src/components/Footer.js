import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="site-footer-brand">Car Dealership</p>
          <p className="site-footer-tagline">
            Vetura të verifikuara, transparencë e plotë dhe shërbim profesional
            nga zgjedhja deri te dorëzimi.
          </p>
        </div>
        <div className="site-footer-col">
          <h4>Navigim</h4>
          <Link to="/">Kryefaqja</Link>
          <Link to="/#inventory">Inventari</Link>
          <Link to="/contact">Kontakt</Link>
        </div>
        <div className="site-footer-col">
          <h4>Llogaria</h4>
          <Link to="/login">Kyçu</Link>
          <Link to="/register">Regjistrohu</Link>
          <Link to="/account">Llogaria ime</Link>
        </div>
      </div>
      <p className="site-footer-bottom">
        © {new Date().getFullYear()} Car Dealership · Të gjitha të drejtat e
        rezervuara.
      </p>
    </footer>
  );
}

export default Footer;
