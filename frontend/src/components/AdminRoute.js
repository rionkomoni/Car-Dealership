import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const role = useSelector((s) => s.auth.user?.role);
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
