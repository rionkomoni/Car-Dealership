import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PageLayout({ children }) {
  return (
    <div className="app-page">
      <Navbar />
      <div className="app-page-body">{children}</div>
      <Footer />
    </div>
  );
}
