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
  email: "",
  whatsapp: "",
  category: "",
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
      !formData.name.trim() ||
      !formData.profession.trim() ||
      !formData.city.trim() ||
      !formData.phone.trim()
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
  email: "",
  whatsapp: "",
  category: "",
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearSearch = () => {
    setSearchProfession("");
    setSearchCity("");
  };

 const cleanPhone = (phone) => {
  return phone?.replace(/\D/g, "") || "";
};

const getWhatsAppNumber = (pro) => {
  return cleanPhone(pro.whatsapp || pro.phone);
};
  if (showRegister) {
    return (
      <div className="container">
        <button className="back-btn" onClick={() => setShowRegister(false)}>
          ← Kthehu
        </button>

        <div className="profile-card">
          <div className="form-badge">Regjistrim falas</div>

          <h1>Regjistrohu si profesionist</h1>

          <p className="muted">
            Krijo profilin tënd falas në Fix24 dhe bëhu i dukshëm për klientët
            që kërkojnë shërbime në qytetin tënd.
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
<input
  placeholder="Email"
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>

<input
  placeholder="WhatsApp (nëse ndryshon nga telefoni)"
  value={formData.whatsapp}
  onChange={(e) =>
    setFormData({ ...formData, whatsapp: e.target.value })
  }
/>

<select
  value={formData.category}
  onChange={(e) =>
    setFormData({ ...formData, category: e.target.value })
  }
>
  <option value="">Zgjidh kategorinë</option>
  <option value="Elektricist">⚡ Elektricist</option>
  <option value="Hidraulik">🚰 Hidraulik</option>
  <option value="Mekanik">🔧 Mekanik</option>
  <option value="Bojaxhi">🎨 Bojaxhi</option>
</select>
          <textarea
            placeholder="Përshkruaj shkurt shërbimet që ofron"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <button className="primary-btn full-btn" onClick={saveProfessional}>
            Dërgo regjistrimin
          </button>

          {submitted && (
            <p className="success">✅ Regjistrimi u dërgua me sukses.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="hero">
        <nav className="top-nav">
          <div className="logo">Fix24</div>

          <button className="nav-btn" onClick={() => setShowRegister(true)}>
            Regjistrohu falas
          </button>
        </nav>

        <div className="hero-content">
          <span className="hero-badge">Platformë shqiptare për shërbime</span>

          <h1>Gjej profesionistin e duhur pranë teje</h1>

          <p>
            Kërko sipas profesionit dhe qytetit. Kontakto direkt me telefon ose
            WhatsApp pa ndërmjetësim.
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

          {(searchProfession || searchCity) && (
            <button className="clear-btn" onClick={clearSearch}>
              Pastro kërkimin
            </button>
          )}
        </div>
      </header>

      <section className="info-section">
        <div className="info-card">
          <strong>1. Kërko</strong>
          <p>Zgjidh profesionin dhe qytetin ku të duhet shërbimi.</p>
        </div>

        <div className="info-card">
          <strong>2. Krahaso</strong>
          <p>Shiko profesionistët e regjistruar dhe përshkrimin e tyre.</p>
        </div>

        <div className="info-card">
          <strong>3. Kontakto</strong>
          <p>Telefono ose shkruaj direkt në WhatsApp.</p>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Kategoritë kryesore</h2>
          <span>Shërbimet më të kërkuara</span>
        </div>

        <div className="categories">
          <button
            className="category-card"
            onClick={() => setCategory("Elektricist")}
          >
            <span>⚡</span>
            Elektricist
          </button>

          <button
            className="category-card"
            onClick={() => setCategory("Hidraulik")}
          >
            <span>🚰</span>
            Hidraulik
          </button>

          <button className="category-card" onClick={() => setCategory("Mekanik")}>
            <span>🔧</span>
            Mekanik
          </button>

          <button className="category-card" onClick={() => setCategory("Bojaxhi")}>
            <span>🎨</span>
            Bojaxhi
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
              <h3>Nuk u gjet asnjë profesionist</h3>
              <p>Provo një profesion ose qytet tjetër.</p>
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

      <div className="rating">
        ⭐ {pro.reviews > 0 ? `${pro.rating || 5.0} (${pro.reviews} vlerësime)` : "I ri në Fix24"}
      </div>
    </div>
  </div>

  <div className="pro-meta">
    <span>📍 {pro.city}</span>

    {pro.category && (
      <span className="category-badge">
        {pro.category}
      </span>
    )}
  </div>

  {pro.description && (
    <p className="description">{pro.description}</p>
  )}

  <div className="pro-contact">
    <span>📞 {pro.phone}</span>
  </div>

  <div className="actions">
    <a href={`tel:${pro.phone}`} className="call-btn">
      Telefono
    </a>

    <a
      href={`https://wa.me/${getWhatsAppNumber(pro)}`}
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