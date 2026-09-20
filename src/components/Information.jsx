import { CONTACT_EMAIL } from '../lib/utils';
import { Shell } from './Common';
export default function Information({page,navigate}) {
  return <Shell title={page==='privacy'?'Privatësia në Fix24.':'Përdorimi i Fix24.'} navigate={navigate}><div className="reading-copy">{page==='privacy'?<>
    <h2>Të dhënat që përdorim</h2><p>Fix24 përdor email-in e llogarisë për hyrjen dhe rikthimin e aksesit. Ruajmë të dhënat që vendos në profil, kërkesat, ofertat, fotot dhe vlerësimet për të ofruar shërbimet e platformës.</p>
    <h2>Çfarë bëhet publike</h2><p>Profili profesional dhe kontaktet që vendos në të janë publike. Përshkrimi i kërkesës, shërbimi, qyteti dhe buxheti u shfaqen profesionistëve të përshtatshëm. Adresa private, telefoni i kërkesës dhe fotot shfaqen për ty dhe profesionistin që zgjedh. Vlerësimet e punëve të përfunduara shfaqen te profili i profesionistit.</p>
    <h2>Ruajtja dhe aksesi</h2><p>Përdorim Supabase për llogaritë, databazën dhe fotot; faqja shërbehet përmes Vercel. Shfletuesi ruan sesionin e hyrjes për të mbajtur llogarinë të hapur. Mos ndaj fjalëkalimin tënd dhe dil nga llogaria në pajisje të përbashkëta.</p>
    <h2>Kërkesa për të dhënat e tua</h2><p>Për korrigjim, kopje ose fshirje të të dhënave, shkruaj nga email-i i llogarisë në <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Nevoja për verifikimin e kërkesës dhe të dhënat që lidhen me punë në proces shqyrtohen përpara fshirjes.</p>
  </>:<>
    <h2>Si funksionon platforma</h2><p>Fix24 lidh klientë me profesionistë lokalë. Regjistrimi është falas gjatë fazës së hapjes. Çmimi, afati, mënyra e pagesës dhe kushtet e punës dakordësohen mes klientit dhe profesionistit. Fix24 nuk mbledh pagesa online në këtë fazë.</p>
    <h2>Informacion i saktë</h2><p>Përdor vetëm të dhënat dhe fotot që ke të drejtë të publikosh. Mos publiko kontakte ose adresa private të personave të tjerë. Profilet dhe kërkesat abuzive mund të pezullohen pas shqyrtimit.</p>
    <h2>Rezervime dhe vlerësime</h2><p>Pranimi i ofertës e lidh kërkesën me profesionistin e zgjedhur. Konfirmo përfundimin vetëm pasi ke kontrolluar punën. Vlerësimet duhet të përshkruajnë përvojën reale të shërbimit.</p>
    <h2>Ndihmë dhe raportime</h2><p>Për problem me llogarinë, profil të pasaktë ose mosmarrëveshje, shkruaj në <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> dhe përfshi të dhënat e kërkesës. Për rrezik të menjëhershëm, përdor shërbimet lokale të emergjencës.</p>
  </>}</div></Shell>;
}
