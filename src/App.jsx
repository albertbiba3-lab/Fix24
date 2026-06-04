import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [searchProfession, setSearchProfession] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    city: "",
    phone: "",
    description: "",
  });

  const fetchProfessionals = async () => {
    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProfessionals(data || []);
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const saveProfessional = async () => {
    if (
      !formData.name ||
      !formData.profession ||
      !formData.city ||
      !formData.phone
    ) {
      alert("Ju lutem plotësoni emrin, profesionin, qytetin dhe telefonin.");
      return;
    }

    const { error } = await supabase.from("professionals").insert([formData]);

    if (error) {
      alert(error.message);
      return;
    }

    setSubmitted(true);
    setFormData({
      name: "",
      profession: "",
      city: "",
      phone: "",
      description: "",
    });

    fetchProfessionals();
  };

  const filteredProfessionals = professionals.filter((pro) => {
    const professionMatch = pro.profession
      ?.toLowerCase()
      .includes(searchProfession.toLowerCase());

    const cityMatch = pro.city
      ?.toLowerCase()
      .includes(searchCity.toLowerCase());

    return professionMatch && cityMatch;
  });

  const setCategory = (category) => {
    setSearchProfession(category);
  };

  if (showRegister) {
    return (
      <div className="container">
        <button className="back-btn" onClick={() => setShowRegister(false)}>
          ← Kthehu
        </button>

        <div className="profile-card">
          <h1>Regjistrohu si profesionist</h1>
          <p className="muted">
            Regjistrimi është falas. Më vonë do të shtohen opsione premium.
          </p>

          <input
            placeholder="Emri dhe mbiemri"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            placeholder="Profesioni p.sh. Hidraulik"
            value={formData.profession}
            onChange={(e) =>
              setFormData({ ...formData, profession: e.target.value })
            }
          />

          <input
            placeholder="Qyteti p.sh. Frankfurt"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />

          <input
            placeholder="Numri i telefonit"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <textarea
            placeholder="Përshkruaj shërbimet që ofron"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <button className="primary-btn" onClick={saveProfessional}>
            Dërgo regjistrimin
          </button>

          {submitted && <p className="success">✅ Regjistrimi u dërgua me sukses.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="hero">
        <div className="logo">Fix24</div>

        <h1>Gjej profesionistin e duhur pranë teje</h1>
        <p>
          Platformë shqiptare për të gjetur elektricistë, hidraulikë,
          mekanikë, bojaxhinj dhe profesionistë të tjerë.
        </p>

        <div className="search">
          <input
            placeholder="Kërko profesion..."
            value={searchProfession}
            onChange={(e) => setSearchProfession(e.target.value)}
          />

          <input
            placeholder="Qyteti..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />

          <button className="primary-btn">Kërko</button>
        </div>

        <button className="register-btn" onClick={() => setShowRegister(true)}>
          Regjistrohu falas si profesionist
        </button>
      </header>

      <section>
        <h2>Kategoritë</h2>

        <div className="categories">
          <button className="category-card" onClick={() => setCategory("Elektricist")}>
            ⚡ Elektricist
          </button>

          <button className="category-card" onClick={() => setCategory("Hidraulik")}>
            🚰 Hidraulik
          </button>

          <button className="category-card" onClick={() => setCategory("Mekanik")}>
            🔧 Mekanik
          </button>

          <button className="category-card" onClick={() => setCategory("Bojaxhi")}>
            🎨 Bojaxhi
          </button>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Profesionistët e regjistruar</h2>
          <span>{filteredProfessionals.length} rezultat/e</span>
        </div>

        <div className="professionals-grid">
          {filteredProfessionals.length === 0 ? (
            <div className="empty-card">
              Nuk u gjet asnjë profesionist me këtë kërkim.
            </div>
          ) : (
            filteredProfessionals.map((pro) => (
              <div className="pro-card" key={pro.id}>
                <div className="pro-top">
                  <div className="avatar">
                    {pro.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <h3>{pro.name}</h3>
                    <p>{pro.profession}</p>
                  </div>
                </div>

                <p className="location">📍 {pro.city}</p>

                {pro.description && (
                  <p className="description">{pro.description}</p>
                )}

                <div className="actions">
                  <a href={`tel:${pro.phone}`} className="call-btn">
                    Telefono
                  </a>

                  <a
                    href={`https://wa.me/${pro.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="whatsapp-btn"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default App;