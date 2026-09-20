import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Field, Notice, Shell } from './Common';
import { friendlyError } from '../lib/utils';
export default function Auth({ navigate, user, reset = false, next = 'dashboard' }) {
  const [mode, setMode] = useState(reset ? 'reset' : next === 'register' ? 'signup' : 'signin');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setError(''); setMessage(''); setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(f.email.trim(), { redirectTo: `${location.origin}/?view=reset` });
        if (error) throw error;
        setMessage('Nëse ky email ka një llogari, do të marrësh lidhjen për rivendosjen e fjalëkalimit.');
      } else if (mode === 'reset') {
        if (f.password !== f.confirm) throw new Error('FIX24: Fjalëkalimet nuk përputhen.');
        const { error } = await supabase.auth.updateUser({ password: f.password });
        if (error) throw error;
        setMessage('Fjalëkalimi u ndryshua. Mund të vazhdosh në panel.');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: f.email.trim(), password: f.password, options: { emailRedirectTo: `${location.origin}/?view=dashboard`, data: { full_name: f.full_name.trim(), role: f.role } } });
        if (error) throw error;
        if (data.session) navigate(next);
        else setMessage('Kontrollo email-in për të konfirmuar llogarinë. Nëse je regjistruar më parë, përdor Hyr ose rikthe fjalëkalimin.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
        if (error) throw error;
        navigate(next);
      }
    } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  const titles = { signin: 'Mirë se u ktheve.', signup: 'Bëhu pjesë e Fix24.', forgot: 'Rikthe fjalëkalimin.', reset: 'Vendos fjalëkalimin e ri.' };
  return <Shell title={titles[mode]} subtitle="Një llogari për të kërkuar shërbime, për të marrë oferta dhe për të ndjekur punët e tua." navigate={navigate}>
    {!reset && <div className="auth-tabs">{['signin','signup'].map(m => <button key={m} type="button" className={mode === m ? 'active' : ''} onClick={() => { setMode(m); setError(''); setMessage(''); }}>{m === 'signin' ? 'Hyr' : 'Krijo llogari falas'}</button>)}</div>}
    {mode === 'reset' && !user ? <Notice error>Lidhja e rikthimit mungon ose ka skaduar. <button className="text-button" onClick={() => setMode('forgot')}>Kërko lidhje të re</button></Notice> : <form onSubmit={submit} className="stack-form">
      {mode === 'signup' && <><Field label="Emri dhe mbiemri" name="full_name" autoComplete="name" required maxLength={100}/><Field label="Dua të regjistrohem si"><select name="role" defaultValue={next === 'register' ? 'professional' : 'client'}><option value="client">Klient — kërkoj shërbime</option><option value="professional">Profesionist — ofroj shërbime</option></select></Field></>}
      {mode !== 'reset' && <Field label="Email" type="email" name="email" autoComplete="email" required maxLength={254}/>}
      {mode !== 'forgot' && <Field label="Fjalëkalimi" name="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={mode === 'signin' ? 1 : 8} maxLength={128}/>}
      {mode === 'reset' && <Field label="Përsërit fjalëkalimin" name="confirm" type="password" autoComplete="new-password" required minLength={8}/>}
      {mode === 'signup' && <label className="checkbox-field"><input type="checkbox" required/>E kuptoj që të dhënat e profilit profesional do të jenë publike. Kam lexuar <a href="?view=privacy" target="_blank" rel="noreferrer">privatësinë</a> dhe <a href="?view=terms" target="_blank" rel="noreferrer">rregullat e përdorimit</a>.</label>}
      <button className="main-btn" disabled={busy}>{busy ? 'Duke punuar…' : ({signin:'Hyr', signup:'Krijo llogarinë', forgot:'Dërgo lidhjen', reset:'Ruaj fjalëkalimin'})[mode]}</button>
      {mode === 'signin' && <button className="text-button" type="button" onClick={() => {setMode('forgot');setError('');setMessage('');}}>Ke harruar fjalëkalimin?</button>}
    </form>}
    <Notice error>{error}</Notice><Notice>{message}</Notice>
    {user && <button className="ghost-btn full" onClick={() => navigate('dashboard')}>Shko te paneli im</button>}
  </Shell>;
}
