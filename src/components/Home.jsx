import { useMemo, useState } from 'react';
import heroBackground from '../assets/fix24-cinematic-hero.jpg';
import { UiIcon } from './catalog';
import { categories } from '../lib/categories';
import { LoadState } from './Common';
import { CONTACT_EMAIL, normalize, phoneNumber, safeUrl } from '../lib/utils';
export default function Home({ currentUser, navigate, signOut, professionals, loading, error, reload }) {
  const [searchProfession, setSearchProfession] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const filteredProfessionals = useMemo(() => professionals.filter(p => normalize(`${p.name} ${p.profession} ${p.category || ''}`).includes(normalize(searchProfession)) && normalize(p.city).includes(normalize(searchCity))), [professionals, searchProfession, searchCity]);
  const hasActiveFilters = Boolean(searchProfession.trim() || searchCity.trim());
  const clearFilters = () => { setSearchProfession(''); setSearchCity(''); };
  const showResults = () => document.getElementById('professionals')?.scrollIntoView({ behavior: 'smooth' });
  const getWhatsAppNumber = pro => phoneNumber(pro.whatsapp || pro.phone);
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
            {currentUser ? (
              <button className="nav-login" type="button" onClick={signOut}>
                Dil
              </button>
            ) : (
              <button className="nav-login" type="button" onClick={() => navigate('auth')}>
                Hyr
              </button>
            )}
            <button className="nav-login" type="button" onClick={() => navigate('request')}>
              Kërkesë
            </button>
            <button className="nav-action" onClick={() => navigate(currentUser ? 'dashboard' : 'register')}>
              {currentUser ? 'Paneli im' : 'Regjistrohu falas'}
            </button>
          </div>
        </nav>

        <div className="hero-grid cinematic-grid">
          <div className="hero-left cinematic-copy">
            <span className="eyebrow">Profesionistë lokalë. Kontakt direkt.</span>

            <h1>
              <span className="title-line">Gjej mjeshtrin</span>
              <span className="title-line accent">e duhur.</span>
              <span className="title-line">Pranë teje.</span>
            </h1>

            <p>
              Profesionistë lokalë për çdo qytet. Kërko, krahaso dhe kontakto
              lehtë me telefon ose WhatsApp.
            </p>

            <form className="search-panel cinematic-search" onSubmit={e => { e.preventDefault(); showResults(); }}>
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

              <button className="main-btn" type="submit">
                Kërko
              </button>
            </form>

            {hasActiveFilters && (
              <button className="clear-search" type="button" onClick={clearFilters}>
                Pastro filtrat
              </button>
            )}

            <div className="hero-stats cinematic-stats">
              <div>
                <span className="stat-icon">✓</span>
                <strong>{loading || error ? '—' : professionals.length}</strong>
                <span>Profesionistë të regjistruar</span>
              </div>
              <div>
                <span className="stat-icon">●</span>
                <strong>{loading || error ? '—' : new Set(professionals.map(p => normalize(p.city))).size}</strong>
                <span>Qytete aktive</span>
              </div>
              <div>
                <span className="stat-icon">★</span>
                <strong>Falas</strong>
                <span>Regjistrimi në platformë</span>
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
        <span className="trust-item"><span className="trust-icon"><UiIcon name="verified" /></span>Regjistrim falas</span>
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
                <img src={cat.image} alt="" loading="lazy" />
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

        <LoadState loading={loading} error={error} retry={reload} />
        <div className="pro-grid">
          {loading || error ? null : filteredProfessionals.length === 0 ? (
            <div className="empty-state">
              <h3>Nuk u gjet asnjë profesionist</h3>
              <p>{hasActiveFilters ? "Provo një shërbim ose qytet tjetër." : "Bëhu ndër profesionistët e parë në qytetin tënd."}</p>
              {!hasActiveFilters && <button className="main-btn" onClick={() => navigate("register")}>Krijo profil falas</button>}
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
                tabIndex={0} role="link" aria-label={`Shiko profilin e ${pro.name}`}
                onKeyDown={e => { if (e.target === e.currentTarget && e.key === "Enter") navigate("profile", pro.id); }}
                key={pro.id}
                onClick={() => navigate('profile', pro.id)}
              >
                <div className="pro-header">
                  <div className="avatar">
                    {pro.profile_image ? (
                      <img src={safeUrl(pro.profile_image)} alt={pro.name} loading="lazy" />
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
                        ? Number(pro.rating).toFixed(1)
                        : "I ri në Fix24"}
                    </strong>
                    {pro.reviews > 0 && <small>({pro.reviews} vlerësime)</small>}
                  </div>

                  <div className="status-badges">
                    {(pro.verified || pro.verification_status === 'approved') && <span className="verified-pill">✓ Verifikuar</span>}
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

      <section className="section launch-cta"><div><span className="eyebrow">Për profesionistët</span><h2>Puna jote meriton të gjendet.</h2><p>Krijo profilin, trego shërbimet e tua dhe merr kërkesa nga klientë në qytetin tënd. Regjistrimi është falas.</p></div><button className="main-btn" onClick={() => navigate('register')}>Bëhu pjesë e Fix24 →</button></section>
      <section className="section faq-section"><span className="eyebrow">Pyetje të shpeshta</span><h2>Gjithçka fillon me një kërkesë.</h2>
      <details><summary>A ka pagesë për regjistrimin?</summary><p>Jo. Në fazën e hapjes, klientët dhe profesionistët mund të regjistrohen falas. Çmimin e punës e dakordëson drejtpërdrejt me profesionistin.</p></details>
      <details><summary>Si zgjedh profesionistin?</summary><p>Kërko sipas shërbimit dhe qytetit ose publiko një kërkesë. Krahaso profilet dhe ofertat; prano vetëm ofertën që të përshtatet.</p></details>
      <details><summary>Si funksionojnë vlerësimet?</summary><p>Klienti mund të vlerësojë profesionistin pasi puna e rezervuar në Fix24 është konfirmuar e përfunduar.</p></details>
      <details><summary>Kur ndahet adresa ime?</summary><p>Adresa dhe telefoni i kërkesës i shfaqen profesionistit që zgjedh pasi pranon ofertën. Mos i shkruaj këto të dhëna në përshkrimin publik.</p></details>
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
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <button className="text-button" onClick={() => navigate('privacy')}>Privatësia</button>
          <button className="text-button" onClick={() => navigate('terms')}>Përdorimi i platformës</button>
          <span>© {new Date().getFullYear()} Fix24</span>
        </div>
      </footer>
    </div>
  );
}
