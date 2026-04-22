import "./App.css";

import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Home from "./Pages/Home";
import AdminRoute from "./components/AdminRoute";
import ManagerRoute from "./components/ManagerRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppToastProvider } from "./components/ui/AppToastProvider";

const Login = lazy(() => import("./Pages/Login.js"));
const Register = lazy(() => import("./Pages/Register.js"));
const Contact = lazy(() => import("./Pages/Contact.js"));
const AddCar = lazy(() => import("./Pages/AddCar.js"));
const CarDetail = lazy(() => import("./Pages/CarDetail.js"));
const CarLogs = lazy(() => import("./Pages/CarLogs.js"));
const Admin = lazy(() => import("./Pages/Admin.js"));
const Manager = lazy(() => import("./Pages/Manager.js"));
const BuyCar = lazy(() => import("./Pages/BuyCar.js"));

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <AppToastProvider>
      <BrowserRouter>
        <ScrollToHash />
        <Suspense fallback={<div className="section narrow">Loading page…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/cars/:id/buy" element={<BuyCar />} />
            </Route>
            <Route element={<ManagerRoute />}>
              <Route path="/manager" element={<Manager />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/cars/new" element={<AddCar />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/logs" element={<CarLogs />} />
            </Route>
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppToastProvider>
  );
}

export default App;
