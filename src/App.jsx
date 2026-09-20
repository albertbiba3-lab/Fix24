import { useLoad } from './lib/useLoad';
import { Component, useEffect, useState, useSyncExternalStore } from 'react';
import './App.css';
import './launch.css';
import { supabase } from './supabaseClient';
import { result } from './lib/api';
import { CONTACT_EMAIL } from './lib/utils';
import { LoadState, Notice, Shell } from './components/Common';
import Home from './components/Home';
import Auth from './components/Auth';
import Profile from './components/Profile';
import ProfessionalForm from './components/ProfessionalForm';
import RequestForm from './components/RequestForm';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
import Information from './components/Information';
const subscribe = cb => { window.addEventListener('popstate',cb); return ()=>window.removeEventListener('popstate',cb); };
function navigate(view, id, next) {
  const url = new URL(window.location.href); url.search=''; url.hash='';
  if(view!=='home')url.searchParams.set('view',view);
  if(id)url.searchParams.set('id',id);
  if(next)url.searchParams.set('next',next);
  window.history.pushState({},'',url);window.dispatchEvent(new PopStateEvent('popstate'));window.scrollTo(0,0);
}
class ErrorBoundary extends Component {
  state={error:false};
  static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<Shell title="Diçka nuk shkoi mirë." navigate={()=>location.assign('/')}><p>Rihap faqen ose na kontakto te <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p><button className="main-btn" onClick={()=>location.reload()}>Rihap faqen</button></Shell>:this.props.children;}
}
function AppContent() {
  const search=useSyncExternalStore(subscribe,()=>window.location.search);
  const params=new URLSearchParams(search),view=params.get('view')||'home';
  const [auth,setAuth]=useState({user:null,loading:true});
  const [sessionError,setSessionError]=useState('');
  const pros=useLoad(()=>result(supabase.from('professionals').select('*').order('created_at',{ascending:false})),[]);
  const profile=useLoad(()=>auth.user?result(supabase.from('user_profiles').select('*').eq('id',auth.user.id).maybeSingle()):Promise.resolve(null),[auth.user?.id]);
  useEffect(()=>{
    let active=true;
    supabase.auth.getSession().then(({data,error})=>{if(active){setAuth({user:data?.session?.user||null,loading:false});if(error)setSessionError('Nuk u verifikua sesioni. Provo të hysh përsëri.');}}).catch(()=>{if(active)setAuth({user:null,loading:false});});
    const {data}=supabase.auth.onAuthStateChange((event,session)=>{
      // Keep this callback synchronous; loading profile data happens in a separate effect.
      if(active)setAuth({user:session?.user||null,loading:false});
      if(event==='PASSWORD_RECOVERY')navigate('reset');
    });
    return ()=>{active=false;data.subscription.unsubscribe();};
  },[]);
  useEffect(()=>{document.title=view==='home'?'Fix24 — Gjej mjeshtrin e duhur. Pranë teje.':'Fix24 — Shërbime lokale';},[view]);
  async function signOut(){const {error}=await supabase.auth.signOut();if(error){setSessionError('Dalja nuk u krye. Provo përsëri.');return;}setAuth({user:null,loading:false});navigate('home');}
  const common={navigate,user:auth.user};
  const protectedView=['register','request','dashboard','admin'].includes(view);
  if(protectedView&&auth.loading)return <Shell title="Duke hapur llogarinë…" navigate={navigate}><LoadState loading/></Shell>;
  if(protectedView&&!auth.user)return <Auth {...common} next={view}/>;
  if(view==='auth'||view==='reset')return <Auth key={view} {...common} reset={view==='reset'} next={['register','request','dashboard'].includes(params.get('next'))?params.get('next'):'dashboard'}/>;
  if(view==='register')return <ProfessionalForm {...common} onSaved={()=>{pros.reload();profile.reload();}}/>;
  if(view==='request')return <RequestForm {...common}/>;
  if(view==='profile')return <Profile id={params.get('id')} navigate={navigate}/>;
  if(view==='privacy'||view==='terms')return <Information page={view} navigate={navigate}/>;
  if(view==='dashboard')return <Dashboard key={auth.user.id} {...common} profile={profile.data} signOut={signOut} professionals={pros.data||[]}/>;
  if(view==='admin')return profile.loading?<Shell title="Administrimi" navigate={navigate}><LoadState loading/></Shell>:profile.data?.role==='admin'?<Admin navigate={navigate} onSaved={pros.reload}/>:<Shell title="Akses i kufizuar." navigate={navigate}><p>Kjo faqe është vetëm për administratorin e Fix24.</p></Shell>;
  if(view!=='home')return <Shell title="Faqja nuk u gjet." navigate={navigate}><p>Kthehu te kreu për të vazhduar.</p></Shell>;
  return <><Notice error>{sessionError}</Notice><Home currentUser={auth.user} navigate={navigate} signOut={signOut} professionals={(pros.data||[]).filter(p=>p.is_active!==false&&p.verification_status!=='suspended')} loading={pros.loading} error={pros.error} reload={pros.reload}/></>;
}
export default function App(){return <ErrorBoundary><AppContent/></ErrorBoundary>;}
