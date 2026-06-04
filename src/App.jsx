import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

const categories = [
  { name: "Elektricist", icon: "⚡", text: "Instalime, defekte, ndriçim" },
  { name: "Hidraulik", icon: "🚰", text: "Ujë, ngrohje, banjo" },
  { name: "Mekanik", icon: "🔧", text: "Makina, servis, riparime" },
  { name: "Bojaxhi", icon: "🎨", text: "Lyerje, renovim, mure" },
];

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

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((pro) => {
      const professionText = `${pro.profession || ""} ${pro.category || ""}`.toLowerCase();
      const cityText = `${pro.city || ""}`.toLowerCase();

      return (
        professionText.includes(searchProfession.toLowerCase()) &&
        cityText.includes(searchCity.toLowerCase())
      );
    });
  }, [professionals, searchProfession, searchCity]);

  const cleanPhone = (phone) => phone?.replace(/\D/g, "") || "";

  const getWhatsAppNumber = (pro) => cleanPhone(pro.whatsapp || pro.phone);

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

  if (showRegister) {
    return (
      <div className="page">
        <div className="register-shell">
          <button className="ghost-btn" onClick={() => setShowRegister(false)}>
            ← Kthehu
          </button>

          <div className="register-card">
            <span className="eyebrow">Fix24 Professional</span>
            <h1>Regjistro profilin tënd profesional</h1>
            <p>
              Plotëso të dhënat bazë. Profili yt do të shfaqet në platformë dhe klientët
              mund të të kontaktojnë direkt.
            </p>

            <div className="form-grid">
              <input placeholder="Emri dhe mbiemri" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input placeholder="Profesioni p.sh. Hidraulik" value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} />
              <input placeholder="Qyteti p.sh. Frankfurt" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <input placeholder="Telefoni" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input placeholder="WhatsApp" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />

              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Zgjidh kategorinë</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Përshkruaj shkurt shërbimet që ofron"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button className="main-btn full" onClick={saveProfessional}>
              Dërgo regjistrimin
            </button>

            {submitted && <div className="success">✅ Regjistrimi u dërgua me sukses.</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <div className="brand-mark">F24</div>
            <div>
              <strong>Fix24</strong>
              <span>Professional Services</span>
            </div>
          </div>

          <button className="nav-action" onClick={() => setShowRegister(true)}>
            Regjistro profesionist
          </button>
        </nav>

        <div className="hero-grid">
          <div className="hero-left">
            <span className="eyebrow">Platformë moderne për shërbime</span>
            <h1>Gjej profesionistin e duhur, shpejt dhe me besim.</h1>
            <p>
              Kërko sipas profesionit dhe qytetit. Krahaso profilet, shiko të dhënat dhe
              kontakto direkt me telefon ose WhatsApp.
            </p>

            <div className="search-panel">
              <input
                placeholder="Çfarë shërbimi kërkon?"
                value={searchProfession}
                onChange={(e) => setSearchProfession(e.target.value)}
              />

              <input
                placeholder="Në cilin qytet?"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />

              <button className="main-btn">Kërko</button>
            </div>

            <div className="hero-stats">
              <div><strong>{professionals.length}+</strong><span>Profesionistë</span></div>
              <div><strong>24/7</strong><span>Kërkim online</span></div>
              <div><strong>0€</strong><span>Kontakt direkt</span></div>
            </div>
          </div>

          <div className="hero-card">
            <div className="mini-card active">
              <span>Verified</span>
              <strong>Hidraulik në qytetin tënd</strong>
              <p>Telefon & WhatsApp direkt</p>
            </div>
            <div className="mini-card">
              <span>Fast match</span>
              <strong>Kërkim sipas lokacionit</strong>
              <p>Rezultate të filtrueshme</p>
            </div>
          </div>
        </div>
      </header>

      <section className="steps">
        <div><span>01</span><strong>Kërko</strong><p>Zgjidh profesionin dhe qytetin.</p></div>
        <div><span>02</span><strong>Krahaso</strong><p>Shiko profilet dhe përshkrimin.</p></div>
        <div><span>03</span><strong>Kontakto</strong><p>Telefono ose shkruaj në WhatsApp.</p></div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Kategoritë</span>
            <h2>Shërbimet më të kërkuara</h2>
          </div>
          <span>{categories.length} kategori</span>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <button key={cat.name} className="category-card" onClick={() => setSearchProfession(cat.name)}>
              <div>{cat.icon}</div>
              <strong>{cat.name}</strong>
              <p>{cat.text}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Marketplace</span>
            <h2>Profesionistët e regjistruar</h2>
          </div>
          <span>{filteredProfessionals.length} rezultat/e</span>
        </div>

        <div className="pro-grid">
          {filteredProfessionals.length === 0 ? (
            <div className="empty-state">
              <h3>Nuk u gjet asnjë profesionist</h3>
              <p>Provo një profesion ose qytet tjetër.</p>
            </div>
          ) : (
            filteredProfessionals.map((pro) => (
              <article className="pro-card" key={pro.id}>
                <div className="pro-header">
                  <div className="avatar">{pro.name?.charAt(0)?.toUpperCase()}</div>
                  <div>
                    <h3>{pro.name}</h3>
                    <p>{pro.profession}</p>
                  </div>
                </div>

                <div className="rating-line">
                  <span>⭐</span>
                  <strong>{pro.reviews > 0 ? `${pro.rating || 5}.0` : "I ri në Fix24"}</strong>
                  {pro.reviews > 0 && <small>({pro.reviews} vlerësime)</small>}
                </div>

                <div className="meta-row">
                  <span>📍 {pro.city}</span>
                  {pro.category && <b>{pro.category}</b>}
                </div>

                {pro.description && <p className="pro-desc">{pro.description}</p>}

                <div className="phone-line">📞 {pro.phone}</div>

                <div className="pro-actions">
                  <a href={`tel:${pro.phone}`} className="call-btn">Telefono</a>
                  <a href={`https://wa.me/${getWhatsAppNumber(pro)}`} target="_blank" rel="noreferrer" className="whatsapp-btn">WhatsApp</a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default App;