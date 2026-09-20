export const CONTACT_EMAIL = 'albtirane2020@gmail.com';
export const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
export function safeUrl(value = '') {
  if (!value.trim() || (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:\/\//i.test(value))) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname.includes('.') && !url.username && !url.password && !/[\s:]/.test(url.hostname) && !value.includes('javascript:') ? url.href : '';
  } catch { return ''; }
}
export function phoneNumber(value = '') {
  let phone = String(value).replace(/\D/g, '');
  if (phone.startsWith('00')) phone = phone.slice(2);
  if (phone.startsWith('0')) phone = `355${phone.slice(1)}`;
  return phone;
}
export function validatePhotos(files) {
  if (files.length > 5) return 'Mund të shtosh deri në 5 foto.';
  if (files.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type))) return 'Përdor foto JPG, PNG ose WebP.';
  if (files.some(f => f.size > 5 * 1024 * 1024)) return 'Çdo foto duhet të jetë më e vogël se 5 MB.';
  return '';
}
export function validateBudget(min, max) {
  const values = [min, max].filter(v => v !== '' && v != null).map(Number);
  if (values.some(v => !Number.isFinite(v) || v < 0 || v > 99999999)) return 'Buxheti duhet të jetë një numër pozitiv i vlefshëm.';
  if (min !== '' && max !== '' && min != null && max != null && Number(min) > Number(max)) return 'Buxheti minimal nuk mund të jetë më i lartë se maksimal.';
  return '';
}
export const money = value => new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'ALL', maximumFractionDigits: 0 }).format(value);
export const statusLabels = { open: 'E hapur', quoted: 'Me oferta', booked: 'E rezervuar', in_progress: 'Në punë', awaiting_confirmation: 'Pret konfirmimin', completed: 'E përfunduar', cancelled: 'E anuluar', disputed: 'Në shqyrtim', resolved: 'E zgjidhur', draft: 'Draft' };
export function friendlyError(error) {
  const message = error?.message || String(error || '');
  if (/invalid login credentials/i.test(message)) return 'Email-i ose fjalëkalimi nuk është i saktë.';
  if (/email not confirmed/i.test(message)) return 'Konfirmo email-in përpara se të hysh.';
  if (/already registered/i.test(message)) return 'Ky email ka një llogari. Provo të hysh.';
  if (/rate limit|too many/i.test(message)) return 'Shumë përpjekje. Provo përsëri pas pak minutash.';
  if (/fetch|network|timeout|abort|load failed/i.test(message)) return 'Nuk u lidhëm me shërbimin. Provo përsëri pas pak.';
  if (/schema cache|does not exist|relation|PGRST|permission denied|row-level security/i.test(message)) return 'Ky shërbim nuk është ende i disponueshëm. Provo më vonë ose na kontakto.';
  if (/^FIX24:/.test(message)) return message.replace(/^FIX24:\s*/, '');
  return 'Veprimi nuk u krye. Provo përsëri ose na kontakto.';
}
