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
      {pro.reviews > 0 ? `${pro.rating || 5}.0` : "I ri në Fix24"}
    </strong>
    {pro.reviews > 0 && (
      <small>({pro.reviews} vlerësime)</small>
    )}
  </div>

  <div className="meta-row">
    <span>📍 {pro.city}</span>
    {pro.category && <b>{pro.category}</b>}
  </div>

  {pro.company_name && (
    <div className="company-line">
      🏢 {pro.company_name}
    </div>
  )}

  {pro.years_experience && (
    <div className="company-line">
      🧰 {pro.years_experience} vite eksperiencë
    </div>
  )}

  {pro.description && (
    <p className="pro-desc">{pro.description}</p>
  )}

  <div className="phone-line">
    📞 {pro.phone}
  </div>

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