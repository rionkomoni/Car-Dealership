import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ManagerRoute() {
  const role = useSelector((s) => s.auth.user?.role);
  if (role !== "manager" && role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

