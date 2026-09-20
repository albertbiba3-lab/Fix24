import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { result, attachRequestPhotos } from '../lib/api';
import { friendlyError, phoneNumber, validateBudget, validatePhotos } from '../lib/utils';
import { categories } from '../lib/categories';
import { Field, Notice, Shell } from './Common';
export default function RequestForm({ user, navigate }) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[created,setCreated]=useState(null),[warning,setWarning]=useState('');
  async function submit(e) {
    e.preventDefault();setError('');
    const form = new FormData(e.currentTarget);
    const data=Object.fromEntries(form); const files=form.getAll('photos').filter(f=>f.size);
    const invalid=validateBudget(data.budget_min,data.budget_max)||validatePhotos(files);
    if(invalid){setError(invalid);return;}
    if(phoneNumber(data.client_phone).length<8){setError('Vendos një numër telefoni të vlefshëm.');return;}
    if(data.title.trim().length<8||data.description.trim().length<20||!data.city.trim()){setError('Titulli kërkon 8 shkronja, përshkrimi 20 dhe qyteti duhet plotësuar.');return;}
    setBusy(true);
    try {
      delete data.photos;
      const request=await result(supabase.from('service_requests').insert({...data,title:data.title.trim(),description:data.description.trim(),city:data.city.trim(),client_id:user.id,status:'open',budget_min:data.budget_min===''?null:Number(data.budget_min),budget_max:data.budget_max===''?null:Number(data.budget_max),preferred_date:data.preferred_date||null}).select().single());
      // Persist success before uploads: a failed photo must never duplicate the request.
      setCreated(request.id);
      const failed=await attachRequestPhotos(request.id,files);
      if(failed)setWarning(`Kërkesa u ruajt. ${failed} foto nuk u ngarkuan. Mund t’i shtosh nga paneli.`);
    }catch(e){setError(friendlyError(e));}finally{setBusy(false);}
  }
  return <Shell title="Çfarë duhet rregulluar?" subtitle="Përshkruaj punën dhe merr oferta nga profesionistët e shërbimit dhe qytetit tënd." navigate={navigate} eyebrow="Kërkesë e re">
    {created?<><Notice>{warning||'Kërkesa u publikua me sukses.'}</Notice><button className="main-btn full" disabled={busy} onClick={()=>navigate('dashboard')}>{busy?'Duke ngarkuar fotot…':'Shiko kërkesën dhe ofertat'}</button></>:<form onSubmit={submit} className="stack-form"><div className="form-grid">
      <Field label="Shërbimi"><select name="category" required defaultValue=""><option value="">Zgjidh shërbimin</option>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></Field>
      <Field label="Titulli i kërkesës" name="title" placeholder="P.sh. Riparim i rubinetit në kuzhinë" required minLength={8} maxLength={160}/>
      <Field label="Qyteti" name="city" required maxLength={80}/><Field label="Zona (opsionale)" name="area" maxLength={120}/>
      <Field label="Data e preferuar" type="date" name="preferred_date" min={new Date().toLocaleDateString('en-CA')}/><Field label="Orari i preferuar" name="preferred_time" placeholder="P.sh. 10:00–14:00" maxLength={80}/>
      <Field label="Sa shpejt të duhet?"><select name="urgency"><option value="normal">Pa urgjencë</option><option value="urgent">Sa më shpejt</option><option value="emergency">Urgjente</option></select></Field>
      <Field label="Mënyra e çmimit"><select name="pricing_preference"><option value="on_site_check">Pas kontrollit në vend</option><option value="fixed_price">Çmim fiks</option></select></Field>
      <Field label="Buxheti minimal (lekë)" name="budget_min" type="number" min="0" max="99999999" step="1"/><Field label="Buxheti maksimal (lekë)" name="budget_max" type="number" min="0" max="99999999" step="1"/>
      <Field label="Telefoni privat" name="client_phone" type="tel" placeholder="+355…" required maxLength={25}/><Field label="Adresa private (opsionale)" name="address_details" maxLength={300}/>
      <Field label="Përshkrimi i punës"><textarea name="description" required minLength={20} maxLength={3000} placeholder="Shpjego problemin, pa përfshirë telefon ose adresë të plotë."/></Field>
      <Field label="Foto (deri në 5, maksimumi 5 MB secila)" name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp"/>
    </div><p className="muted">Telefoni, adresa e plotë dhe fotot ndahen vetëm me profesionistin që zgjedh. Publikimi nuk kryen pagesë ose rezervim automatik.</p><Notice error>{error}</Notice><button className="main-btn" disabled={busy}>{busy?'Duke publikuar…':'Publiko kërkesën falas'}</button></form>}
  </Shell>;
}
