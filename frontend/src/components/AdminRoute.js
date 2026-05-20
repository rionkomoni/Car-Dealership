import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminRoute() {
  const location = useLocation();
  const token = useSelector((s) => s.auth.token);
  const role = useSelector((s) => s.auth.user?.role);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
