import { useLoad } from '../lib/useLoad';
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { result } from '../lib/api';
import { friendlyError } from '../lib/utils';
import { Shell, Notice, LoadState } from './Common';
export default function Admin({navigate,onSaved}) {
  const state=useLoad(()=>result(supabase.from('professionals').select('*').order('created_at',{ascending:false})),[]);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function moderate(pro,verification,active){setBusy(true);setError('');try{await result(supabase.rpc('moderate_professional',{profile_id:String(pro.id),verification,active}));state.reload();onSaved();}catch(e){setError(friendlyError(e));}finally{setBusy(false);}}
  return <Shell title="Administrimi i Fix24." subtitle="Verifiko vetëm profilet për të cilat ke kontrolluar informacionin e biznesit." navigate={navigate}><LoadState {...state} retry={state.reload}/><Notice error>{error}</Notice><div className="request-list">{state.data?.map(p=><article className="work-card" key={p.id}><h3>{p.name}</h3><p>{p.profession} · {p.city} · {p.phone}</p><p>{p.verification_status} · {p.is_active?'Aktiv':'Joaktiv'}</p><div className="dashboard-actions"><button className="ghost-btn" disabled={busy} onClick={()=>moderate(p,'approved',true)}>Shëno të verifikuar</button><button className="ghost-btn" disabled={busy} onClick={()=>moderate(p,'unverified',true)}>Aktiv, pa verifikim</button><button className="ghost-btn" disabled={busy} onClick={()=>moderate(p,'suspended',false)}>Pezullo profilin</button></div></article>)}</div></Shell>;
}
