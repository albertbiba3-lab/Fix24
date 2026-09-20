import { useLoad } from '../lib/useLoad';
import { supabase } from '../supabaseClient';
import { result } from '../lib/api';
import { phoneNumber, safeUrl } from '../lib/utils';
import { UiIcon } from './catalog';
import { Shell, LoadState } from './Common';
export default function Profile({ id, navigate }) {
  const state=useLoad(()=>result(supabase.from('professionals').select('*').eq('id',id).maybeSingle()),[id]);
  const selectedPro=state.data;
  const getWhatsAppNumber=pro=>phoneNumber(pro.whatsapp||pro.phone);
  if(!selectedPro) return <Shell title="Profili profesional" navigate={navigate}><LoadState {...state} retry={state.reload}/>{!state.loading&&!state.error&&<p>Ky profil nuk është i disponueshëm.</p>}</Shell>;
    return (
      <div className="page profile-view">
        <button className="ghost-btn profile-back" onClick={() => navigate('home')}>
          Kthehu te lista
        </button>

        <section className="profile-page">
          <div className="profile-cover">
            {selectedPro.cover_image ? (
              <img src={safeUrl(selectedPro.cover_image)} alt={selectedPro.name} />
            ) : (
              <div className="cover-fallback">Fix24 Professional</div>
            )}
          </div>

          <div className="profile-main">
            <div className="profile-photo">
              {selectedPro.profile_image ? (
                <img src={safeUrl(selectedPro.profile_image)} alt={selectedPro.name} />
              ) : (
                <span>{selectedPro.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>

            <div className="profile-info">
              <div className="profile-badges">
                <span className="eyebrow">
                  {(selectedPro.verified || selectedPro.verification_status === 'approved') ? "I verifikuar" : "Profesionist Fix24"}
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
                    ? Number(selectedPro.rating).toFixed(1)
                    : "I ri në Fix24"}
                </span>
              </div>

              <div className="profile-highlights">
                <span>
                  <small>Qyteti</small>
                  <strong>{selectedPro.city}</strong>
                </span>
                <span>
                  <small>Shërbimi</small>
                  <strong>{selectedPro.profession}</strong>
                </span>
                <span>
                  <small>Kontakt</small>
                  <strong>Direkt</strong>
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
                  <a href={safeUrl(selectedPro.website)} target="_blank" rel="noreferrer">
                    Website
                  </a>
                )}
                {selectedPro.facebook && (
                  <a href={safeUrl(selectedPro.facebook)} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                )}
                {selectedPro.instagram && (
                  <a href={safeUrl(selectedPro.instagram)} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                )}
              </div>
            </div>

            <div className="profile-contact-card">
              <span className="eyebrow">Kontakt</span>
              <h3>Fol direkt me profesionistin</h3>
              <p>Zgjidh mënyrën më të shpejtë për të kërkuar shërbimin.</p>

              <div className="profile-phone-preview">
                <UiIcon name="phone" />
                <span>
                  <small>Numri i kontaktit</small>
                  <strong>{selectedPro.phone}</strong>
                </span>
              </div>

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
          <Reviews userId={selectedPro.user_id}/>
        </section>
      </div>
    );
  
}
function Reviews({userId}) {
 const state=useLoad(()=>userId?result(supabase.from('service_reviews').select('id,rating,comment,created_at').eq('professional_user_id',userId).order('created_at',{ascending:false})):Promise.resolve([]),[userId]);
 return <section className="profile-reviews"><h2>Vlerësime nga punë të përfunduara</h2><LoadState {...state} retry={state.reload}/>{state.data?.length?state.data.map(r=><article className="review-card" key={r.id}><strong>★ {r.rating}/5</strong><span>Klient Fix24 · {new Date(r.created_at).toLocaleDateString('sq-AL')}</span><p>{r.comment}</p></article>):!state.loading&&!state.error&&<p className="muted">Ky profesionist nuk ka ende vlerësime nga punë në platformë.</p>}</section>;
}
