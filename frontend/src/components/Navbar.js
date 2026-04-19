import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout as logoutAction } from "../store/authSlice";

const NAV_BREAKPOINT_PX = 768;

function CarLogoIcon() {
  return (
    <svg
      className="site-logo-icon"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 14.5c-.8-.5-1.5-1.2-1.9-2.1L2 11h2.2l1 1.2c.4.5.9.9 1.5 1.1l1.3.5M19 14.5c.8-.5 1.5-1.2 1.9-2.1L22 11h-2.2l-1 1.2c-.4.5-.9.9-1.5 1.1l-1.3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 15h12l1-3H5l1 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 15.5v2M16.5 15.5v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="18" r="1.25" fill="currentColor" />
      <circle cx="16" cy="18" r="1.25" fill="currentColor" />
      <path
        d="M8 11V9c0-1.2.8-2.2 2-2.5l2-.5h2l2 .5c1.2.3 2 1.3 2 2.5v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const userName = user?.name;
  const admin = user?.role === "admin";

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= NAV_BREAKPOINT_PX) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const logout = () => {
    dispatch(logoutAction());
    closeMenu();
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    `nav-link${isActive ? " nav-link--active" : ""}`;

  return (
    <header className="site-header">
      <div className="site-header-bar">
        <Link to="/" className="site-logo" onClick={closeMenu}>
          <CarLogoIcon />
          <span>Car Dealership</span>
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          aria-label={menuOpen ? "Mbyll menunë" : "Hap menunë"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="nav-toggle-bar" aria-hidden />
          <span className="nav-toggle-bar" aria-hidden />
          <span className="nav-toggle-bar" aria-hidden />
        </button>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Mbyll menunë"
          onClick={closeMenu}
        />
      ) : null}

      <nav
        id="primary-nav"
        className={`site-nav ${menuOpen ? "is-open" : ""}`}
      >
        <NavLink to="/" end className={navClass} onClick={closeMenu}>
          Home
        </NavLink>
        <Link to="/#inventory" className="nav-link" onClick={closeMenu}>
          Inventari
        </Link>
        <Link to="/#about" className="nav-link" onClick={closeMenu}>
          Rreth nesh
        </Link>
        <Link to="/contact" className="nav-link" onClick={closeMenu}>
          Kontakt
        </Link>

        {token ? (
          <>
            <Link to="/cars/new" className="nav-link" onClick={closeMenu}>
              Shto listim
            </Link>
            {admin ? (
              <>
                <Link to="/admin" className="nav-link nav-admin" onClick={closeMenu}>
                  Admin
                </Link>
                <Link to="/logs" className="nav-link" onClick={closeMenu}>
                  Logs
                </Link>
              </>
            ) : null}
            {userName ? (
              <span className="nav-greeting">
                Përshëndetje, {userName}
                {admin ? (
                  <span className="nav-role-badge" title="Administrator">
                    {" "}
                    · Admin
                  </span>
                ) : null}
              </span>
            ) : null}
            <button
              type="button"
              className="btn btn-ghost nav-logout"
              onClick={logout}
            >
              Dil
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={closeMenu}>
              Kyçu
            </Link>
            <Link to="/register" className="nav-link nav-link--cta" onClick={closeMenu}>
              Regjistrohu
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
