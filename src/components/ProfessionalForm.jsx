import { useLoad } from '../lib/useLoad';
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { result, uploadPhoto } from '../lib/api';
import { friendlyError, phoneNumber, safeUrl, validatePhotos } from '../lib/utils';
import { categories } from '../lib/categories';
import { Field, LoadState, Notice, Shell } from './Common';
export default function ProfessionalForm({ user, navigate, onSaved }) {
  const state = useLoad(() => result(supabase.from('professionals').select('*').eq('user_id', user.id).maybeSingle()), [user.id]);
  return <Shell title="Profili yt profesional." subtitle="Trego çfarë bën dhe ku punon. Regjistrimi është falas. Kontaktet që vendos këtu do të shfaqen publikisht." navigate={navigate}>
    <LoadState {...state} retry={state.reload}/>{!state.loading && !state.error && <Editor key={state.data?.id || 'new'} existing={state.data} user={user} onSaved={onSaved} navigate={navigate}/>} 
  </Shell>;
}
function Editor({ existing, user, onSaved, navigate }) {
  const [images, setImages] = useState({ profile_image: existing?.profile_image || '', cover_image: existing?.cover_image || '' });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  async function upload(e, field) {
    const file = e.target.files?.[0]; if (!file) return;
    const invalid = validatePhotos([file]); if (invalid) {setError(invalid);return;}
    setUploading(true);setError('');
    try { const path = await uploadPhoto(file, 'profile-images', user.id); const {data} = supabase.storage.from('profile-images').getPublicUrl(path); setImages(v => ({...v,[field]:data.publicUrl})); }
    catch(e) {setError(friendlyError(e));} finally {setUploading(false);}
  }
  async function save(e) {
    e.preventDefault();setError('');setBusy(true);
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (phoneNumber(form.phone).length < 8 || phoneNumber(form.phone).length > 15) throw new Error('FIX24: Vendos një numër telefoni të vlefshëm, me prefiksin e shtetit.');
      if (!form.name.trim() || !form.city.trim() || form.description.trim().length < 20) throw new Error('FIX24: Plotëso emrin, qytetin dhe të paktën 20 shkronja për shërbimet.');
      for(const field of ['website','facebook','instagram']) if(form[field] && !safeUrl(form[field])) throw new Error('FIX24: Lidhja e faqes ose rrjetit social nuk është e vlefshme.');
      const data = { name:form.name.trim(),company_name:form.company_name.trim(),profession:form.profession,category:form.profession,city:form.city.trim(),phone:form.phone.trim(),email:form.email.trim(),whatsapp:form.whatsapp.trim(),years_experience:form.years_experience === '' ? null : Number(form.years_experience),description:form.description.trim(),website:safeUrl(form.website),facebook:safeUrl(form.facebook),instagram:safeUrl(form.instagram),...images };
      await result(existing ? supabase.from('professionals').update(data).eq('id',existing.id).eq('user_id',user.id).select().single() : supabase.from('professionals').insert({...data,user_id:user.id}).select().single());
      onSaved();navigate('dashboard');
    } catch(e) {setError(friendlyError(e));} finally {setBusy(false);}
  }
  return <form onSubmit={save} className="stack-form">
    <div className="register-upload-grid">{['profile_image','cover_image'].map(field => <div className="upload-box" key={field}><div className="upload-preview">{images[field] ? <img src={safeUrl(images[field])} alt={field==='profile_image'?'Foto profili':'Foto kopertine'}/> : <span>F24</span>}</div><Field label={field==='profile_image'?'Foto profili / logo':'Foto kopertine'} type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || busy} onChange={e=>upload(e,field)}/></div>)}</div>
    <p className="muted">JPG, PNG ose WebP, deri në 5 MB për foto.</p>
    <div className="form-grid">
      <Field label="Emri dhe mbiemri" name="name" required maxLength={100} defaultValue={existing?.name || user.user_metadata?.full_name || ''}/>
      <Field label="Kompania (opsionale)" name="company_name" maxLength={120} defaultValue={existing?.company_name}/>
      <Field label="Shërbimi kryesor"><select name="profession" required defaultValue={existing?.profession || ''}><option value="">Zgjidh shërbimin</option>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></Field>
      <Field label="Qyteti" name="city" required maxLength={80} defaultValue={existing?.city}/>
      <Field label="Telefoni publik" name="phone" type="tel" placeholder="+355…" required maxLength={25} defaultValue={existing?.phone}/>
      <Field label="Email publik (opsional)" name="email" type="email" maxLength={254} defaultValue={existing?.email}/>
      <Field label="WhatsApp (opsional)" name="whatsapp" type="tel" placeholder="+355…" maxLength={25} defaultValue={existing?.whatsapp}/>
      <Field label="Vite eksperiencë" name="years_experience" type="number" min="0" max="80" defaultValue={existing?.years_experience}/>
      <Field label="Website (opsional)" name="website" placeholder="https://…" maxLength={500} defaultValue={existing?.website}/>
      <Field label="Facebook (opsional)" name="facebook" maxLength={500} defaultValue={existing?.facebook}/>
      <Field label="Instagram (opsional)" name="instagram" maxLength={500} defaultValue={existing?.instagram}/>
      <Field label="Përshkruaj shërbimet"><textarea name="description" required minLength={20} maxLength={3000} defaultValue={existing?.description}/></Field>
    </div>
    <Notice error>{error}</Notice><button className="main-btn" disabled={busy||uploading}>{uploading?'Duke ngarkuar foton…':busy?'Duke ruajtur…':existing?'Ruaj ndryshimet':'Publiko profilin falas'}</button>
  </form>;
}
