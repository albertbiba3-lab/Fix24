import { useEffect, useMemo, useState } from "react";
import "./App.css";
import electricianImage from "./assets/category-electrician.jpg";
import mechanicImage from "./assets/category-mechanic.jpg";
import painterImage from "./assets/category-painter.jpg";
import plumberImage from "./assets/category-plumber.jpg";
import heroBackground from "./assets/fix24-cinematic-hero.jpg";
import { supabase } from "./supabaseClient";

const UiIcon = ({ name }) => {
  const icons = {
    star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />,
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />,
    verified: (
      <>
        <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    building: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M12 11v2" />
      </>
    ),
    message: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
  };

  return (
    <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
};

const categories = [
  {
    name: "Elektricist",
    image: electricianImage,
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M13 2L4 14h7l-1 8 10-13h-7l0-7z" />
      </svg>
    ),
    text: "Instalime, defekte, ndriçim",
  },
  {
    name: "Hidraulik",
    image: plumberImage,
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M7 3h10v4H7V3zm2 6h6v3l4 4v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3l4-4V9z" />
      </svg>
    ),
    text: "Ujë, ngrohje, banjo",
  },
  {
    name: "Mekanik",
    image: mechanicImage,
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M22 19.6l-6.3-6.3a6.5 6.5 0 0 1-8.5-8.5l4.1 4.1 2.8-2.8L10 2a6.5 6.5 0 0 1 8.5 8.5l6.3 6.3-2.8 2.8z" />
      </svg>
    ),
    text: "Makina, servis, riparime",
  },
  {
    name: "Bojaxhi",
    image: painterImage,
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

  const hasActiveFilters = Boolean(searchProfession.trim() || searchCity.trim());

  const clearFilters = () => {
    setSearchProfession("");
    setSearchCity("");
  };

  const showResults = () => {
    document.getElementById("professionals")?.scrollIntoView({ behavior: "smooth" });
  };

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
      <div className="page profile-view">
        <button className="ghost-btn profile-back" onClick={() => setSelectedPro(null)}>
          Kthehu te lista
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
              <div className="profile-badges">
                <span className="eyebrow">
                  {selectedPro.verified ? "I verifikuar" : "Profesionist Fix24"}
                </span>
                {selectedPro.is_premium && <span className="premium-badge">Premium</span>}
              </div>

              <h1>{selectedPro.name}</h1>
              {selectedPro.company_name && <h3>{selectedPro.company_name}</h3>}

              <p className="profile-subtitle">
                {selectedPro.profession} në {selectedPro.city}
              </p>

              <div className="profile-tags">
                {selectedPro.category && <span><UiIcon name="briefcase" />{selectedPro.category}</span>}
                {selectedPro.years_experience && (
                  <span><UiIcon name="verified" />{selectedPro.years_experience} vite eksperiencë</span>
                )}
                <span>
                  <UiIcon name="star" />
                  {selectedPro.reviews > 0
                    ? `${selectedPro.rating || 5}.0`
                    : "I ri në Fix24"}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-layout">
            <div className="profile-about">
              <span className="eyebrow">Profili</span>
              <h2>Rreth profesionistit</h2>
              <p>
                {selectedPro.description ||
                  "Ky profesionist është regjistruar në Fix24 dhe mund të kontaktohet direkt për shërbime."}
              </p>

              <div className="profile-contact-list">
                <div className="profile-contact-line"><UiIcon name="location" />{selectedPro.city}</div>
                <div className="profile-contact-line"><UiIcon name="phone" />{selectedPro.phone}</div>
                {selectedPro.email && <div className="profile-contact-line">{selectedPro.email}</div>}
              </div>

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
              <span className="eyebrow">Kontakt</span>
              <h3>Fol direkt me profesionistin</h3>
              <p>Zgjidh mënyrën më të shpejtë për të kërkuar shërbimin.</p>

              <a href={`tel:${selectedPro.phone}`} className="call-btn">
                <UiIcon name="phone" />
                Telefono
              </a>

              <a
                href={`https://wa.me/${getWhatsAppNumber(selectedPro)}`}
                target="_blank"
                rel="noreferrer"
                className="whatsapp-btn"
              >
                <UiIcon name="message" />
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
      <div className="page register-view">
        <div className="register-shell">
          <button className="ghost-btn register-back" onClick={() => setShowRegister(false)}>
            Kthehu
          </button>

          <div className="register-card">
            <div className="register-hero-copy">
              <span className="eyebrow">Fix24 Professional</span>
              <h1>Regjistro profilin tënd profesional</h1>
              <p>
                Krijo një profil të qartë për klientët: foto, qytet, profesion,
                kontakt direkt dhe përshkrim të shkurtër të shërbimeve.
              </p>
            </div>

            <div className="register-upload-grid">
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

                <div>
                  <strong>Foto profili ose logo</strong>
                  <p>Shfaqet te karta dhe profili yt publik.</p>
                  <label className="upload-label">
                    {uploading ? "Duke ngarkuar..." : "Ngarko foto"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadImage(e, "profile_image")}
                    />
                  </label>
                </div>
              </div>

              <div className="upload-box cover-upload-box">
                <div className="upload-preview cover-small">
                  {formData.cover_image ? (
                    <img src={formData.cover_image} alt="Cover preview" />
                  ) : (
                    <span>Cover</span>
                  )}
                </div>

                <div>
                  <strong>Foto cover</strong>
                  <p>Përdoret si sfond në faqen e profilit.</p>
                  <label className="upload-label">
                    {uploading ? "Duke ngarkuar..." : "Ngarko cover"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadImage(e, "cover_image")}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="register-form-head">
              <span>Të dhënat e profilit</span>
              <small>Fushat kryesore: emri, profesioni, qyteti dhe telefoni.</small>
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
                placeholder="Qyteti p.sh. Tiranë"
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
                    {cat.name}
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
              <div className="success">Regjistrimi u dërgua me sukses.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header
        id="top"
        className="hero hero-premium hero-cinematic"
        style={{ "--hero-background": `url(${heroBackground})` }}
      >
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
              <span className="title-line">Gjej mjeshtrin</span>
              <span className="title-line accent">e duhur.</span>
              <span className="title-line">Pranë teje.</span>
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

              <button className="main-btn" type="button" onClick={showResults}>
                Kërko
              </button>
            </div>

            {hasActiveFilters && (
              <button className="clear-search" type="button" onClick={clearFilters}>
                Pastro filtrat
              </button>
            )}

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

          <div className="hero-card cinematic-map" aria-hidden="true" />
        </div>
      </header>

      <section className="trust-strip">
        <span className="trust-item"><span className="trust-icon"><UiIcon name="star" /></span>Profesionistë lokalë</span>
        <span className="trust-item"><span className="trust-icon"><UiIcon name="location" /></span>Kërkim sipas qytetit</span>
        <span className="trust-item"><span className="trust-icon"><UiIcon name="phone" /></span>Kontakt direkt</span>
        <span className="trust-item"><span className="trust-icon"><UiIcon name="verified" /></span>Shërbime të verifikuara më vonë</span>
      </section>

      <section className="process-section" id="steps">
        <div className="process-heading">
          <div>
            <span className="process-eyebrow">Si funksionon</span>
            <h2>Gjej profesionistin në tre hapa.</h2>
          </div>
          <p>Kërko sipas shërbimit dhe qytetit, krahaso profilet dhe kontakto drejtpërdrejt.</p>
        </div>

        <div className="steps">
          <article className="step-card">
            <span className="step-number">01</span>
            <span className="step-icon"><UiIcon name="briefcase" /></span>
            <strong>Kërko</strong>
            <p>Zgjidh profesionin dhe qytetin.</p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <span className="step-icon"><UiIcon name="star" /></span>
            <strong>Krahaso</strong>
            <p>Shiko profilet dhe përshkrimin.</p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <span className="step-icon"><UiIcon name="message" /></span>
            <strong>Kontakto</strong>
            <p>Telefono ose shkruaj në WhatsApp.</p>
          </article>
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
              className={`category-card ${searchProfession === cat.name ? "active" : ""}`}
              type="button"
              onClick={() => {
                setSearchProfession(cat.name);
                showResults();
              }}
            >
              <span className="category-media">
                <img src={cat.image} alt="" />
                <span className="category-icon-wrap">{cat.icon}</span>
              </span>
              <span className="category-content">
                <strong>{cat.name}</strong>
                <p>{cat.text}</p>
              </span>
            </button>
          ))}
        </div>
      </section>


      <section className="section professionals-section" id="professionals">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Marketplace</span>
            <h2>Profesionistët e regjistruar</h2>
          </div>

          <span>{filteredProfessionals.length} rezultat/e</span>
        </div>

        {hasActiveFilters && (
          <div className="filter-bar">
            <div>
              {searchProfession.trim() && <span>Shërbimi: {searchProfession}</span>}
              {searchCity.trim() && <span>Qyteti: {searchCity}</span>}
            </div>
            <button type="button" onClick={clearFilters}>
              Pastro
            </button>
          </div>
        )}

        <div className="pro-grid">
          {filteredProfessionals.length === 0 ? (
            <div className="empty-state">
              <h3>Nuk u gjet asnjë profesionist</h3>
              <p>Provo një profesion ose qytet tjetër.</p>
              {hasActiveFilters && (
                <button className="ghost-btn" type="button" onClick={clearFilters}>
                  Pastro filtrat
                </button>
              )}
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
                  <div className="rating-summary">
                    <UiIcon name="star" />
                    <strong>
                      {pro.reviews > 0
                        ? `${pro.rating || 5}.0`
                        : "I ri në Fix24"}
                    </strong>
                    {pro.reviews > 0 && <small>({pro.reviews} vlerësime)</small>}
                  </div>

                  <div className="status-badges">
                    {pro.verified && <span className="verified-pill">✓ Verifikuar</span>}
                    {pro.is_premium && <span className="premium-pill">Premium</span>}
                  </div>
                </div>

                <div className="meta-row">
                  <span className="icon-text"><UiIcon name="location" />{pro.city}</span>
                  {pro.category && <b>{pro.category}</b>}
                </div>

                {pro.company_name && (
                  <div className="company-line icon-text"><UiIcon name="building" />{pro.company_name}</div>
                )}

                {pro.years_experience && (
                  <div className="company-line icon-text">
                    <UiIcon name="briefcase" />{pro.years_experience} vite eksperiencë
                  </div>
                )}

                {pro.description && <p className="pro-desc">{pro.description}</p>}

                <div className="phone-line icon-text"><UiIcon name="phone" />{pro.phone}</div>

                <div className="pro-actions">
                  <a
                    href={`tel:${pro.phone}`}
                    className="call-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UiIcon name="phone" />Telefono
                  </a>

                  <a
                    href={`https://wa.me/${getWhatsAppNumber(pro)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="whatsapp-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UiIcon name="message" />WhatsApp
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-copy">
          <span className="eyebrow">Rreth Fix24</span>
          <h2>Një platformë lokale për shërbime më të shpejta dhe më të qarta.</h2>
          <p>
            Fix24 lidh klientët me profesionistë lokalë sipas qytetit dhe shërbimit.
            Qëllimi është i thjeshtë: kërkim i shpejtë, kontakt direkt dhe profile të
            paraqitura pastër për çdo profesionist.
          </p>
        </div>

        <div className="about-grid">
          <article>
            <UiIcon name="location" />
            <strong>Afër klientit</strong>
            <span>Kërkim sipas qytetit për të gjetur shërbimin më pranë.</span>
          </article>
          <article>
            <UiIcon name="phone" />
            <strong>Kontakt direkt</strong>
            <span>Telefon ose WhatsApp pa hapa të panevojshëm.</span>
          </article>
          <article>
            <UiIcon name="verified" />
            <strong>Profile të qarta</strong>
            <span>Emër, profesion, qytet, përshkrim dhe foto në një vend.</span>
          </article>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div>
          <strong className="footer-logo">Fix<span>24</span></strong>
          <p>Platformë shqiptare për profesionistë lokalë dhe klientë që kërkojnë shërbim shpejt.</p>
        </div>

        <div className="footer-links">
          <a href="#top">Kreu</a>
          <a href="#steps">Si funksionon</a>
          <a href="#professionals">Profesionistët</a>
          <a href="#about">Rreth nesh</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
