import './App.css';

import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import CarCard from "./components/CarCard.js";

function App() {
  return (
    <div className="App">

      <Navbar />

      <h1 style={{textAlign: "center"}}>Car Dealership</h1>

      <div style={{
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        marginTop: "20px"
      }}>
        <CarCard />
        <CarCard />
        <CarCard />
      </div>

      <Footer />

    </div>
  );
}

export default App;
