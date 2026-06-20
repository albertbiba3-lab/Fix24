import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

const categories = [
  {
    name: "Elektricist",
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M13 2L4 14h7l-1 8 10-13h-7l0-7z" />
      </svg>
    ),
    text: "Instalime, defekte, ndriçim",
  },
  {
    name: "Hidraulik",
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M7 3h10v4H7V3zm2 6h6v3l4 4v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3l4-4V9z" />
      </svg>
    ),
    text: "Ujë, ngrohje, banjo",
  },
  {
    name: "Mekanik",
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M22 19.6l-6.3-6.3a6.5 6.5 0 0 1-8.5-8.5l4.1 4.1 2.8-2.8L10 2a6.5 6.5 0 0 1 8.5 8.5l6.3 6.3-2.8 2.8z" />
      </svg>
    ),
    text: "Makina, servis, riparime",
  },
  {
    name: "Bojaxhi",
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M4 3h12a3 3 0 0 1 3 3v2H7v3H4V3zm3 10h12v4a4 4 0 0 1-8 0v-1H7v-3z" />
      </svg>
    ),
    text: "Lyerje, renovim, mure",
  },
];

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [selectedPro, setSelectedPro] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [searchProfession, setSearchProfession] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    profession: "",
    city: "",
    phone: "",
    email: "",
    whatsapp: "",
    category: "",
    years_experience: "",
    website: "",
    facebook: "",
    instagram: "",
    profile_image: "",
    cover_image: "",
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

  const featuredProfessional = professionals[0];

  const cleanPhone = (phone) => phone?.replace(/\D/g, "") || "";
  const getWhatsAppNumber = (pro) => cleanPhone(pro.whatsapp || pro.phone);

  const uploadImage = async (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    setFormData((prev) => ({
      ...prev,
      [fieldName]: data.publicUrl,
    }));

    setUploading(false);
  };

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
      company_name: "",
      profession: "",
      city: "",
      phone: "",
      email: "",
      whatsapp: "",
      category: "",
      years_experience: "",
      website: "",
      facebook: "",
      instagram: "",
      profile_image: "",
      cover_image: "",
      description: "",
    });

    fetchProfessionals();
  };

  if (selectedPro) {
    return (
      <div className="page">
        <button className="ghost-btn" onClick={() => setSelectedPro(null)}>
          ← Kthehu te lista
        </button>

        <section className="profile-page">
          <div className="profile-cover">
            {selectedPro.cover_image ? (
              <img src={selectedPro.cover_image} alt={selectedPro.name} />
            ) : (
              <div className="cover-fallback">Fix24 Professional</div>
            )}
          </div>

          <div className="profile-main">
            <div className="profile-photo">
              {selectedPro.profile_image ? (
                <img src={selectedPro.profile_image} alt={selectedPro.name} />
              ) : (
                <span>{selectedPro.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>

            <div className="profile-info">
              <span className="eyebrow">
                {selectedPro.verified ? "✓ I verifikuar" : "Profesionist Fix24"}
              </span>
{selectedPro.is_premium && (
  <span className="premium-badge">
    PREMIUM
  </span>
)}
              <h1>{selectedPro.name}</h1>

              {selectedPro.company_name && <h3>{selectedPro.company_name}</h3>}

              <p>
                {selectedPro.profession} në {selectedPro.city}
              </p>

              <div className="profile-tags">
                {selectedPro.category && <span>{selectedPro.category}</span>}
                {selectedPro.years_experience && (
                  <span>{selectedPro.years_experience} vite eksperiencë</span>
                )}
                <span>
                  ⭐{" "}
                  {selectedPro.reviews > 0
                    ? `${selectedPro.rating || 5}.0`
                    : "I ri në Fix24"}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-layout">
            <div className="profile-about">
              <h2>Rreth profesionistit</h2>
              <p>
                {selectedPro.description ||
                  "Ky profesionist është regjistruar në Fix24 dhe mund të kontaktohet direkt për shërbime."}
              </p>

              <h2>Kontakt</h2>
              <p>📍 {selectedPro.city}</p>
              <p>📞 {selectedPro.phone}</p>
              {selectedPro.email && <p>✉️ {selectedPro.email}</p>}

              <div className="social-links">
                {selectedPro.website && (
                  <a href={selectedPro.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                )}
                {selectedPro.facebook && (
                  <a href={selectedPro.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                )}
                {selectedPro.instagram && (
                  <a href={selectedPro.instagram} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                )}
              </div>
            </div>

            <div className="profile-contact-card">
              <h3>Kontakto direkt</h3>
              <p>Zgjidh mënyrën më të shpejtë për të folur me profesionistin.</p>

              <a href={`tel:${selectedPro.phone}`} className="call-btn">
                Telefono
              </a>

              <a
                href={`https://wa.me/${getWhatsAppNumber(selectedPro)}`}
                target="_blank"
                rel="noreferrer"
                className="whatsapp-btn"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
              Krijo një profil të pastër dhe profesional. Klientët mund të të
              gjejnë sipas qytetit, profesionit dhe kategorisë.
            </p>

            <div className="upload-box">
              <div className="upload-preview">
                {formData.profile_image ? (
                  <img src={formData.profile_image} alt="Profile preview" />
                ) : (
                  <span>
                    {formData.name ? formData.name.charAt(0).toUpperCase() : "F24"}
                  </span>
                )}
              </div>

              <label className="upload-label">
                {uploading ? "Duke ngarkuar..." : "Ngarko foto / logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => uploadImage(e, "profile_image")}
                />
              </label>
            </div>

            <div className="upload-box">
              <div className="upload-preview cover-small">
                {formData.cover_image ? (
                  <img src={formData.cover_image} alt="Cover preview" />
                ) : (
                  <span>Cover</span>
                )}
              </div>

              <label className="upload-label">
                {uploading ? "Duke ngarkuar..." : "Ngarko cover image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => uploadImage(e, "cover_image")}
                />
              </label>
            </div>

            <div className="form-grid">
              <input
                placeholder="Emri dhe mbiemri"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <input
                placeholder="Emri i kompanisë"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
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
                placeholder="Telefoni"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <input
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <input
                placeholder="WhatsApp"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
              />

              <input
                placeholder="Vite eksperiencë p.sh. 8"
                value={formData.years_experience}
                onChange={(e) =>
                  setFormData({ ...formData, years_experience: e.target.value })
                }
              />

              <input
                placeholder="Website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />

              <input
                placeholder="Facebook"
                value={formData.facebook}
                onChange={(e) =>
                  setFormData({ ...formData, facebook: e.target.value })
                }
              />

              <input
                placeholder="Instagram"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
              />

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
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
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <button className="main-btn full" onClick={saveProfessional}>
              Dërgo regjistrimin
            </button>

            {submitted && (
              <div className="success">✅ Regjistrimi u dërgua me sukses.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="hero hero-premium hero-cinematic">
        <nav className="nav cinematic-nav">
          <div className="brand cinematic-brand">
            <strong>
              Fix<span>24</span>
            </strong>
          </div>

          <div className="nav-links" aria-label="Navigimi kryesor">
            <a href="#top" className="active">Kreu</a>
            <a href="#steps">Si funksionon</a>
            <a href="#professionals">Profesionistët</a>
            <a href="#about">Rreth nesh</a>
            <a href="#contact">Kontakt</a>
          </div>

          <div className="nav-actions">
            <button className="nav-login" type="button">
              Hyr
            </button>
            <button className="nav-action" onClick={() => setShowRegister(true)}>
              Regjistrohu
            </button>
          </div>
        </nav>

        <div className="hero-grid cinematic-grid">
          <div className="hero-left cinematic-copy">
            <span className="eyebrow">Platforma #1 për shërbime</span>

            <h1>
              Gjej mjeshtrin <span>e duhur.</span> Pranë teje.
            </h1>

            <p>
              Profesionistë lokalë për çdo qytet. Kërko, krahaso dhe kontakto
              lehtë me telefon ose WhatsApp.
            </p>

            <div className="search-panel cinematic-search">
              <label>
                <span>Shërbimi</span>
                <input
                  placeholder="Çfarë po kërkon?"
                  value={searchProfession}
                  onChange={(e) => setSearchProfession(e.target.value)}
                />
              </label>

              <label>
                <span>Qyteti</span>
                <input
                  placeholder="Në cilin qytet?"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </label>

              <button className="main-btn">Kërko</button>
            </div>

            <div className="hero-stats cinematic-stats">
              <div>
                <span className="stat-icon">✓</span>
                <strong>{professionals.length || 214}+</strong>
                <span>Profesionistë të regjistruar</span>
              </div>
              <div>
                <span className="stat-icon">●</span>
                <strong>18</strong>
                <span>Qytete aktive</span>
              </div>
              <div>
                <span className="stat-icon">★</span>
                <strong>4.9/5</strong>
                <span>Vlerësim mesatar</span>
              </div>
            </div>
          </div>

          <div className="hero-card cinematic-map" aria-label="Qytete aktive në Shqipëri">
            {["Shkodër", "Kukës", "Lezhë", "Dibër", "Durrës", "Tiranë", "Elbasan", "Fier", "Berat", "Korçë", "Vlorë", "Gjirokastër"].map((city) => (
              <span key={city} className={`city city-${city.toLowerCase().replace("ë", "e").replace("ç", "c")}`}>
                {city}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="trust-strip" id="about">
        <span>⭐ Profesionistë lokalë</span>
        <span>📍 Kërkim sipas qytetit</span>
        <span>📞 Kontakt direkt</span>
        <span>🛠️ Shërbime të verifikuara më vonë</span>
      </section>

      <section className="steps" id="steps">
        <div>
          <span>01</span>
          <strong>Kërko</strong>
          <p>Zgjidh profesionin dhe qytetin.</p>
        </div>

        <div>
          <span>02</span>
          <strong>Krahaso</strong>
          <p>Shiko profilet dhe përshkrimin.</p>
        </div>

        <div>
          <span>03</span>
          <strong>Kontakto</strong>
          <p>Telefono ose shkruaj në WhatsApp.</p>
        </div>
      </section>

      <section className="section categories-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Kategoritë</span>
            <h2>Shërbimet më të kërkuara</h2>
          </div>

          <span>{categories.length} kategori</span>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="category-card"
              onClick={() => setSearchProfession(cat.name)}
            >
              <div>{cat.icon}</div>
              <strong>{cat.name}</strong>
              <p>{cat.text}</p>
            </button>
          ))}
        </div>
      </section>

      {featuredProfessional && (
        <section className="featured-section" id="contact">
          <div className="featured-card">
            <div className="featured-image">
              {featuredProfessional.profile_image ? (
                <img src={featuredProfessional.profile_image} alt={featuredProfessional.name} />
              ) : (
                <span>{featuredProfessional.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>

            <div>
              <span className="eyebrow">Profesionist i regjistruar</span>
              <h2>{featuredProfessional.name}</h2>
              <p>
                {featuredProfessional.profession} në {featuredProfessional.city}
              </p>
              <p className="featured-desc">
                {featuredProfessional.description || "Profil profesional në Fix24."}
              </p>

              <div className="featured-actions">
                <a href={`tel:${featuredProfessional.phone}`} className="call-btn">
                  Telefono
                </a>

                <a
                  href={`https://wa.me/${getWhatsAppNumber(featuredProfessional)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-btn"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section professionals-section" id="professionals">
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
              <article
                className="pro-card clickable-card"
                key={pro.id}
                onClick={() => setSelectedPro(pro)}
              >
                <div className="pro-header">
                  <div className="avatar">
                    {pro.profile_image ? (
                      <img src={pro.profile_image} alt={pro.name} />
                    ) : (
                      pro.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>

                  <div>
                    <h3>{pro.name}</h3>
                    <p>{pro.profession}</p>
                  </div>
                </div>

                <div className="rating-line">
  <span>⭐</span>

  <strong>
    {pro.reviews > 0
      ? `${pro.rating || 5}.0`
      : "I ri në Fix24"}
  </strong>

  {pro.reviews > 0 && (
    <small>({pro.reviews} vlerësime)</small>
  )}

  {pro.verified && (
    <span
      className="verified-pill"
    >
      ✓ Verifikuar
    </span>
  )}

  {pro.is_premium && (
    <span
      className="premium-pill"
    >
      PREMIUM
    </span>
  )}
</div>

                <div className="meta-row">
                  <span>📍 {pro.city}</span>
                  {pro.category && <b>{pro.category}</b>}
                </div>

                {pro.company_name && (
                  <div className="company-line">🏢 {pro.company_name}</div>
                )}

                {pro.years_experience && (
                  <div className="company-line">
                    🧰 {pro.years_experience} vite eksperiencë
                  </div>
                )}

                {pro.description && <p className="pro-desc">{pro.description}</p>}

                <div className="phone-line">📞 {pro.phone}</div>

                <div className="pro-actions">
                  <a
                    href={`tel:${pro.phone}`}
                    className="call-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Telefono
                  </a>

                  <a
                    href={`https://wa.me/${getWhatsAppNumber(pro)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="whatsapp-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    WhatsApp
                  </a>
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
