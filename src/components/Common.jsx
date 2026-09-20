export function Notice({ children, error = false }) {
  return children ? <div className={`notice ${error ? 'notice-error' : ''}`} role={error ? 'alert' : 'status'}>{children}</div> : null;
}
export function Field({ label, children, ...props }) {
  return <label className="field"><span>{label}</span>{children || <input {...props} />}</label>;
}
export function Shell({ title, subtitle, navigate, children, eyebrow = 'Fix24' }) {
  return <div className="page register-view"><div className="register-shell"><button className="ghost-btn register-back" onClick={() => navigate('home')}>← Kreu</button><section className="register-card"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{subtitle && <p className="intro">{subtitle}</p>}{children}</section></div></div>;
}
export function LoadState({ loading, error, retry }) {
  if (loading) return <p className="loading-state" role="status">Duke ngarkuar…</p>;
  if (error) return <Notice error>{error} <button className="ghost-btn" onClick={retry}>Provo përsëri</button></Notice>;
  return null;
}
