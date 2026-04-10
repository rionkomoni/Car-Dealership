import { Link } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="navbar">
      <div className="logo">AutoSallon</div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/cars">Cars</Link>
        <Link to="/contact">Contact</Link>

        {!token ? <Link to="/login">Login</Link> : <Link to="/dashboard">Dashboard</Link>}
        {!token ? <Link to="/register">Register</Link> : <button onClick={logout}>Logout</button>}
      </nav>
    </header>
  );
}

export default Navbar;