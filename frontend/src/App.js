import "./App.css";

import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login.js";
import Register from "./Pages/Register.js";
import Contact from "./Pages/Contact.js";
import AddCar from "./Pages/AddCar.js";
import CarDetail from "./Pages/CarDetail.js";
import CarLogs from "./Pages/CarLogs.js";
import Admin from "./Pages/Admin.js";
import BuyCar from "./Pages/BuyCar.js";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

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
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/cars/:id/buy" element={<BuyCar />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/cars/new" element={<AddCar />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/logs" element={<CarLogs />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
