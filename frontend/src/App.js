import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CarCard from "./components/CarCard";

import Login from "./pages/Login.js";



function Home() {
  return (
    <div>
      <Navbar />

      <h1 style={{ textAlign: "center" }}>Car Dealership</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <CarCard />
        <CarCard />
        <CarCard />
      </div>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
