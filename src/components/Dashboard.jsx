import { useLoad } from '../lib/useLoad';
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { attachRequestPhotos, result } from '../lib/api';
import { friendlyError, money, statusLabels, validatePhotos } from '../lib/utils';
import { Field, LoadState, Notice, Shell } from './Common';
export default function Dashboard({ user, profile, navigate, signOut, professionals }) {
  const ownPro = professionals.find(p=>p.user_id===user.id);
  const state=useLoad(async()=>{
    const [requests,offers,matches]=await Promise.all([
      result(supabase.from('service_requests').select('*').order('created_at',{ascending:false})),
      result(supabase.from('service_offers').select('*').order('created_at',{ascending:false})),
      result(supabase.rpc('matching_requests')),
    ]);
    return {requests,offers,matches};
  },[user.id]);
  return <Shell title={`Përshëndetje, ${profile?.full_name?.split(' ')[0]||user.user_metadata?.full_name?.split(' ')[0]||'mirë se erdhe'}.`} subtitle="Kërkesat, ofertat dhe punët e tua — të gjitha në një vend." navigate={navigate} eyebrow="Paneli im">
    <div className="dashboard-actions"><button className="main-btn" onClick={()=>navigate('request')}>+ Kërkesë e re</button><button className="ghost-btn" onClick={()=>navigate('register')}>{ownPro?'Ndrysho profilin profesional':'Krijo profil profesional'}</button>{ownPro&&<button className="ghost-btn" onClick={()=>navigate('profile',ownPro.id)}>Shiko profilin tim</button>}{profile?.role==='admin'&&<button className="ghost-btn" onClick={()=>navigate('admin')}>Administrimi</button>}<button className="text-button" onClick={signOut}>Dil nga llogaria</button></div>
    <LoadState {...state} retry={state.reload}/>
    {state.data&&<>
      <h2>Kërkesat dhe punët e mia</h2>
      {!state.data.requests.length&&<div className="empty-state"><h3>Ende asnjë punë.</h3><p>Publiko një kërkesë ose dërgo një ofertë për të filluar.</p></div>}
      <div className="request-list">{state.data.requests.map(r=><RequestCard key={r.id+':'+r.status} request={r} user={user} offers={state.data.offers.filter(o=>o.request_id===r.id)} professionals={professionals} reload={state.reload}/>)}</div>
      {ownPro&&<><h2>Kërkesa për {ownPro.profession} në {ownPro.city}</h2><p className="muted">Kërkesa që përputhen me profilin tënd. Kontaktet private shfaqen pasi klienti zgjedh ofertën tënde.</p><div className="request-list">{state.data.matches.length?state.data.matches.map(r=><RequestCard key={r.id} request={r} user={user} offers={state.data.offers.filter(o=>o.request_id===r.id)} professionals={professionals} reload={state.reload} matching/>):<div className="empty-state"><p>Nuk ka kërkesa të hapura që përputhen tani. Kontrollo sërish më vonë.</p></div>}</div></>}
    </>}
  </Shell>;
}
function RequestCard({request:r,user,offers,professionals,reload,matching=false}) {
  const [expanded,setExpanded]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[confirmOffer,setConfirmOffer]=useState(null),[message,setMessage]=useState('');
  const owner=r.client_id===user.id;
  const selected=r.selected_provider_user_id===user.id;
  const ownOffer=offers.find(o=>o.professional_user_id===user.id);
  async function act(name,args) {
    setBusy(true);setError('');setMessage('');
    try { await result(supabase.rpc(name,args)); setConfirmOffer(null); reload(); }
    catch(e){setError(friendlyError(e));}finally{setBusy(false);}
  }
  function offer(e) {e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));act('submit_offer',{request_id:r.id,offer_amount:Number(f.amount),offer_message:f.message.trim()});}
  return <article className="request-list-card work-card"><div className="work-heading"><span className={`status-badge status-${r.status}`}>{statusLabels[r.status]||r.status}</span><span className="muted">{new Date(r.created_at).toLocaleDateString('sq-AL')}</span></div><h3>{r.title}</h3><p>{r.category} · {r.city}{r.area?` · ${r.area}`:''}</p><p className="work-description">{r.description}</p>
    <div className="work-meta">{r.budget_min!=null&&<span>Nga {money(r.budget_min)}</span>}{r.budget_max!=null&&<span>Deri {money(r.budget_max)}</span>}{r.preferred_date&&<span>Data: {r.preferred_date}</span>}{r.preferred_time&&<span>{r.preferred_time}</span>}<span>{r.urgency==='normal'?'Pa urgjencë':'Urgjente'}</span></div>
    <button className="ghost-btn" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?'Mbyll detajet':owner?`Detaje dhe oferta (${offers.length})`:matching?'Shiko / dërgo ofertë':'Hap punën'}</button>
    {expanded&&<div className="work-details">
      {(owner||selected)&&<><p><strong>Kontakt privat:</strong> {r.client_phone?<a href={`tel:${r.client_phone}`}>{r.client_phone}</a>:'—'}</p><p><strong>Adresa:</strong> {r.address_details||'Dakordësohet me klientin'}</p><RequestPhotos request={r} owner={owner}/></>}
      {owner&&offers.length>0&&<div className="offers-list"><h4>Ofertat</h4>{offers.map(o=>{const pro=professionals.find(p=>p.user_id===o.professional_user_id);return <div className="offer-card" key={o.id}><strong>{pro?.name||'Profesionist Fix24'} · {money(o.amount)}</strong><p>{o.message}</p>{pro&&<a href={`?view=profile&id=${encodeURIComponent(pro.id)}`} target="_blank" rel="noreferrer">Shiko profilin ↗</a>}{r.selected_offer_id===o.id?<span className="status-badge">Oferta e zgjedhur</span>:['open','quoted'].includes(r.status)&&<button className="main-btn" disabled={busy} onClick={()=>setConfirmOffer(o)}>Zgjidh këtë ofertë</button>}</div>;})}</div>}
      {confirmOffer&&<div className="confirm-box"><p>Do ta rezervosh këtë punë për <strong>{money(confirmOffer.amount)}</strong>? Telefoni dhe adresa jote do t’i shfaqen këtij profesionisti. Pagesa bëhet sipas marrëveshjes mes jush.</p><button className="main-btn" disabled={busy} onClick={()=>act('accept_offer',{offer_id:confirmOffer.id})}>Konfirmo rezervimin</button><button className="ghost-btn" onClick={()=>setConfirmOffer(null)}>Kthehu</button></div>}
      {matching&&<>{ownOffer?<Notice>Oferta jote: {money(ownOffer.amount)}. Klienti do ta shohë në panelin e tij.</Notice>:<form className="stack-form" onSubmit={offer}><Field label="Çmimi i ofertës (lekë)" name="amount" type="number" min="1" max="99999999" required/><Field label="Çfarë përfshin oferta?"><textarea name="message" required minLength={10} maxLength={2000}/></Field><button className="main-btn" disabled={busy}>Dërgo ofertën</button></form>}</>}
      {selected&&r.status==='booked'&&<button className="main-btn" disabled={busy} onClick={()=>act('transition_request',{request_id:r.id,next_status:'in_progress'})}>Fillo punën</button>}
      {selected&&r.status==='in_progress'&&<button className="main-btn" disabled={busy} onClick={()=>act('transition_request',{request_id:r.id,next_status:'awaiting_confirmation'})}>Puna u krye — kërko konfirmimin</button>}
      {owner&&r.status==='awaiting_confirmation'&&<><p>Profesionisti e ka shënuar punën të kryer. Konfirmoje pasi ta kesh kontrolluar.</p><button className="main-btn" disabled={busy} onClick={()=>act('transition_request',{request_id:r.id,next_status:'completed'})}>Konfirmoj përfundimin</button></>}
      {owner&&['open','quoted','booked'].includes(r.status)&&<button className="text-button danger" disabled={busy} onClick={()=>act('transition_request',{request_id:r.id,next_status:'cancelled'})}>Anulo kërkesën</button>}
      {owner&&r.status==='completed'&&<ReviewForm request={r}/>}
    </div>}
    <Notice error>{error}</Notice><Notice>{message}</Notice>
  </article>;
}
function RequestPhotos({request,owner}) {
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const state=useLoad(async()=>{const photos=await result(supabase.from('service_request_photos').select('*').eq('request_id',request.id));return Promise.all(photos.map(async p=>({...p,...await result(supabase.storage.from('request-photos').createSignedUrl(p.storage_path,600))})));},[request.id]);
  async function add(e){const files=Array.from(e.target.files||[]);const invalid=validatePhotos(files);if(invalid){setError(invalid);return;}if(!files.length)return;setBusy(true);setError('');try{const failed=await attachRequestPhotos(request.id,files);setMessage(failed?'Disa foto nuk u ngarkuan. Provo sërish.':'Fotot u shtuan.');state.reload();}catch(e){setError(friendlyError(e));}finally{setBusy(false);}}
  return <div><LoadState {...state} retry={state.reload}/><div className="request-photos">{state.data?.map(p=><a href={p.signedUrl} target="_blank" rel="noreferrer" key={p.id}><img src={p.signedUrl} alt="Foto e punës" loading="lazy"/></a>)}</div>{owner&&['open','quoted'].includes(request.status)&&<Field label="Shto foto të punës" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={add}/>}<Notice>{message}</Notice><Notice error>{error}</Notice></div>;
}
function ReviewForm({request}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const state=useLoad(()=>result(supabase.from('service_reviews').select('id,rating,comment').eq('request_id',request.id).maybeSingle()),[request.id]);
  async function submit(e){e.preventDefault();setBusy(true);setError('');const f=Object.fromEntries(new FormData(e.currentTarget));try{await result(supabase.rpc('review_completed_request',{request_id:request.id,review_rating:Number(f.rating),review_comment:f.comment.trim()}));state.reload();}catch(e){setError(friendlyError(e));}finally{setBusy(false);}}
  return <div><LoadState {...state} retry={state.reload}/>{state.data?<Notice>Vlerësimi yt: {state.data.rating}/5. Faleminderit!</Notice>:!state.loading&&!state.error&&<form className="stack-form" onSubmit={submit}><h4>Vlerëso punën e kryer</h4><Field label="Vlerësimi"><select name="rating" defaultValue="5">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></Field><Field label="Përvoja jote"><textarea name="comment" required minLength={10} maxLength={2000}/></Field><button className="main-btn" disabled={busy}>Publiko vlerësimin</button></form>}<Notice error>{error}</Notice></div>;
}
