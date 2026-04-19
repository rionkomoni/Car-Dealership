import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login.js";
import Register from "./Pages/Register.js";
import Contact from "./Pages/Contact.js";
import AddCar from "./Pages/AddCar.js";
import CarDetail from "./Pages/CarDetail.js";
import CarLogs from "./Pages/CarLogs.js";
import Admin from "./Pages/Admin.js";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/cars/new" element={<AddCar />} />
        </Route>
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/logs" element={<CarLogs />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
