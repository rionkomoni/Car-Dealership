import { useState } from "react";
import api from "../services/api";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/contact", form);
      alert("Mesazhi u dërgua me sukses");
      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Gabim gjatë dërgimit");
    }
  };

  return (
    <section className="section form-section">
      <h2>Na Kontaktoni</h2>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Emri juaj"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <textarea
          name="message"
          rows="5"
          placeholder="Mesazhi juaj"
          value={form.message}
          onChange={handleChange}
        ></textarea>
        <button type="submit" className="btn">Dërgo</button>
      </form>
    </section>
  );
}

export default Contact;