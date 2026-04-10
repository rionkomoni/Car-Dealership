import { Link, useNavigate } from "react-router-dom";
import { TOKEN_KEY, USER_KEY } from "../authStorage";
import { getUser, isAdmin } from "../authHelpers";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);
  const user = getUser();
  const userName = user?.name;
  const admin = isAdmin();

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        Car Dealership
      </Link>
      <nav className="site-nav">
        <Link to="/">Home</Link>
        <Link to="/contact">Contact</Link>
        {token ? (
          <>
            <Link to="/cars/new">Add a listing</Link>
            {admin ? (
              <>
                <Link to="/admin" className="nav-admin">
                  Admin
                </Link>
                <Link to="/logs">Car logs</Link>
              </>
            ) : null}
            {userName ? (
              <span className="nav-greeting">
                Hi, {userName}
                {admin ? (
                  <span className="nav-role-badge" title="Administrator">
                    {" "}
                    · Admin
                  </span>
                ) : null}
              </span>
            ) : null}
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
