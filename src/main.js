// ===== KAYIP TELEFON — Bölüm 0: Kilit =====
import { initAudio, sfx, ambience, stopAmbience, ringtone, whisper } from './audio.js';

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem('kt_' + k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('kt_' + k, JSON.stringify(v)); } catch (e) {} } };
const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

const PIN = '070541';
const S = { attempts: 0, called: false, lockUntil: 0, entry: '', view: 'lock', bat: 31, mins: 3 * 60 + 17, unlocked: false, flipped: false, sawVideo: false };

// ---------- medya (varsa gerçek, yoksa yer tutucu) ----------
const MEDIA = { wallpaper: 'media/wallpaper.jpg', oldphoto: 'media/oldphoto.jpg', intro: 'media/intro.mp4', scare: 'media/scare.jpg', village: 'media/village.jpg', notebook: 'media/notebook.jpg', mine: 'media/mine.jpg', forest: 'media/forest.mp4', selfie: 'media/selfie_maden.jpg', g317: 'media/galeri317.jpg', defter: 'media/defter_son.jpg', miners: 'media/madenciler.jpg', dedeWin: 'media/dede_pencere.jpg', harita: 'media/harita.jpg', ayrim: 'media/tunel_ayrim.jpg', denizArka: 'media/deniz_arka.jpg', kapiIc: 'media/kapi_ic.jpg', figUzak: 'media/figur_uzak.jpg', figYakin: 'media/figur_yakin.jpg' };
const has = {};
function probeImg(key) { return new Promise(res => { const i = new Image(); i.onload = () => { has[key] = true; res(true); }; i.onerror = () => res(false); i.src = MEDIA[key]; }); }
async function probeMedia() {
  await Promise.all(['wallpaper', 'oldphoto', 'scare'].map(probeImg));
  try { const r = await fetch(MEDIA.intro, { method: 'HEAD' }); has.intro = r.ok; } catch (e) { has.intro = false; }
  const wall = has.wallpaper ? `url(${MEDIA.wallpaper})` : PLACE_WALL;
  for (const id of ['lockWall', 'pinWall', 'homeWall']) $(id).style.backgroundImage = wall;
  $('cpFront').style.backgroundImage = has.oldphoto ? `url(${MEDIA.oldphoto})` : PLACE_OLD;
}
const PLACE_WALL = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 190' preserveAspectRatio='xMidYMid slice'><defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#7d97a3'/><stop offset='.6' stop-color='#c9cfc4'/><stop offset='1' stop-color='#4c6346'/></linearGradient></defs><rect width='90' height='190' fill='url(#s)'/><path d='M0 110 Q20 90 40 104 T90 96 V190 H0Z' fill='#5d7a52' opacity='.8'/><path d='M0 130 Q30 112 55 126 T90 120 V190 H0Z' fill='#3d5a37'/><rect x='18' y='108' width='34' height='26' fill='#6b4a2e'/><path d='M14 110 L35 96 L56 110Z' fill='#4a3322'/><circle cx='36' cy='140' r='5' fill='#e8c9a8'/><rect x='31' y='145' width='10' height='22' rx='3' fill='#2e6b4a'/><circle cx='52' cy='142' r='4.5' fill='#e2c3a0'/><rect x='48' y='147' width='9' height='21' rx='3' fill='#5a4a3a'/><rect x='0' y='0' width='90' height='190' fill='white' opacity='.12'/></svg>`)}")`;
const PLACE_OLD = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 40'><rect width='30' height='40' fill='#a89a80'/><rect x='4' y='18' width='22' height='22' fill='#7a6b55'/><circle cx='15' cy='13' r='4' fill='#d8cbb0'/><rect x='11' y='17' width='8' height='14' fill='#4a4036'/><rect x='10.5' y='9' width='9' height='2.5' fill='#3a3028'/></svg>`)}")`;

// videolar: yalnızca gerçekten oynarken görünsün (Android'in oynat simgesi çıkmasın)
document.getElementById('s-intro').style.background = '#000 url(media/intro_poster.jpg) center/cover';
for (const id of ['introVid', 'vwVid']) { const v = document.getElementById(id); v.controls = false; v.addEventListener('playing', () => v.classList.add('playing')); v.addEventListener('emptied', () => v.classList.remove('playing')); }

// ---------- yağmur / ışık efekti (başlık ekranı) ----------
const fx = $('fx'), fctx = fx.getContext('2d');
let drops = [], flash = 0, fxOn = true;
function fxResize() { const r = fx.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); fx.width = r.width * d; fx.height = r.height * d; drops = Array.from({ length: 140 }, () => ({ x: Math.random() * fx.width, y: Math.random() * fx.height, l: 10 + Math.random() * 22, v: 9 + Math.random() * 9 })); }
function fxLoop() {
  if (fxOn) {
    const W = fx.width, H = fx.height;
    fctx.clearRect(0, 0, W, H);
    if (flash > 0) { fctx.fillStyle = `rgba(200,220,255,${flash * 0.35})`; fctx.fillRect(0, 0, W, H); flash -= 0.04; }
    fctx.strokeStyle = 'rgba(170,190,210,.35)'; fctx.lineWidth = 1.2; fctx.beginPath();
    for (const d of drops) { fctx.moveTo(d.x, d.y); fctx.lineTo(d.x - d.l * 0.18, d.y + d.l); d.y += d.v; d.x -= d.v * 0.18; if (d.y > H) { d.y = -20; d.x = Math.random() * W * 1.2; } }
    fctx.stroke();
    if (Math.random() < 0.003) { flash = 1; setTimeout(() => sfx('thunder'), 300 + Math.random() * 900); }
  }
  requestAnimationFrame(fxLoop);
}
addEventListener('resize', fxResize); fxResize(); requestAnimationFrame(fxLoop);

// ---------- ekran yönetimi ----------
function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('show', s.id === id)); fxOn = id === 's-title'; if (!fxOn) fctx.clearRect(0, 0, fx.width, fx.height); }
function view(id) { S.view = id; document.querySelectorAll('.view').forEach(v => v.classList.toggle('show', v.id === 'v-' + id)); }
let toastT;
function toast(msg, ms = 2200) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms); }
function banner(app, title, text, dark, appName = 'MESAJLAR') {
  const b = $('banner');
  b.innerHTML = `<div class="nt-h"><span class="nt-ic" style="background:${dark ? '#333' : '#34c759'}">${app}</span>${appName}<span class="tm">şimdi</span></div><b>${title}</b><p>${text}</p>`;
  b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 3800);
}

// ---------- oyun saati ve pil ----------
const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
function clock() {
  const h = String(Math.floor(S.mins / 60) % 24).padStart(2, '0'), m = String(S.mins % 60).padStart(2, '0');
  $('sbTime').textContent = $('lkTime').textContent = `${h}:${m}`;
  $('sbPct').textContent = S.bat + '%'; $('sbBat').querySelector('b').style.width = S.bat + '%'; $('sbBat').classList.toggle('low', S.bat <= 20);
}
setInterval(() => { S.mins++; clock(); }, 20000);
setInterval(() => { if (S.view && $('s-device').classList.contains('show') && S.bat > 15) { S.bat--; clock(); } }, 45000);

// ---------- başlık ----------
if (store.get('stage', null)) $('bContinue').classList.remove('hidden');
$('bStart').onclick = () => { initAudio(); sfx('tap'); store.set('stage', null); startIntro(); };
$('bContinue').onclick = () => { initAudio(); sfx('tap'); enterDevice(true); };
document.addEventListener('pointerdown', () => { initAudio(); }, { once: true });
setTimeout(() => { initAudio(); }, 0);
document.addEventListener('click', function once() { ambience('rain'); document.removeEventListener('click', once); });

// ---------- giriş sahnesi ----------
let introStop = false;
async function startIntro() {
  scr('s-intro'); ambience('rain'); introStop = false;
  if (has.intro) {
    const v = $('introVid'); v.src = MEDIA.intro; v.muted = false; v.style.display = 'block'; $('introCv').style.display = 'none';
    v.onended = () => endIntro();
    try { await v.play(); } catch (e) { v.muted = true; v.play().catch(() => endIntro()); }
    await typeCaption(['03:14 — Karagöl yaylası yolu', 'Çamurun içinde bir ışık yanıp sönüyordu.'], 1200);
    return;
  }
  $('introVid').style.display = 'none'; const cv = $('introCv'); cv.style.display = 'block';
  proceduralIntro(cv);
  await typeCaption(['03:14 — Karagöl yaylası yolu', 'Yağmur dinmeyecek gibiydi.', 'Çamurun içinde bir ışık yanıp sönüyordu.']);
  if (!introStop) { sfx('pickup'); await sleep(900); endIntro(); }
}
async function typeCaption(lines, hold = 1500) {
  const c = $('introCap');
  for (const ln of lines) {
    if (introStop) return; c.textContent = '';
    for (const ch of ln) { if (introStop) return; c.textContent += ch; if (ch !== ' ') sfx('key'); await sleep(55); }
    await sleep(hold);
  }
  c.textContent = '';
}
function proceduralIntro(cv) {
  const d = Math.min(2, devicePixelRatio || 1), ctx = cv.getContext('2d');
  const R = cv.getBoundingClientRect(); cv.width = R.width * d; cv.height = R.height * d;
  const W = cv.width, H = cv.height, t0 = performance.now();
  const rain = Array.from({ length: 220 }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 14 + Math.random() * 30, v: 14 + Math.random() * 12 }));
  const draw = (n) => {
    if (introStop || !$('s-intro').classList.contains('show')) return;
    const t = (n - t0) / 1000;
    ctx.fillStyle = '#020304'; ctx.fillRect(0, 0, W, H);
    // zemin (çamur)
    const g = ctx.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, '#05070a'); g.addColorStop(1, '#14100c'); ctx.fillStyle = g; ctx.fillRect(0, H * 0.45, W, H);
    // el feneri konisi süpürüyor
    const fx0 = W * (0.15 + 0.35 * Math.min(1, t / 5)), fy0 = H * (0.72 - 0.06 * Math.sin(t * 1.7));
    const fl = ctx.createRadialGradient(fx0, fy0, 10, fx0, fy0, W * 0.55);
    fl.addColorStop(0, 'rgba(255,245,210,.32)'); fl.addColorStop(0.4, 'rgba(255,240,200,.1)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fl; ctx.fillRect(0, 0, W, H);
    // çamurdaki telefon
    const px = W * 0.5, py = H * 0.74, buzz = Math.sin(t * 60) * (Math.sin(t * 2.2) > 0.3 ? 2 * d : 0);
    const lit = Math.sin(t * 2.2) > 0.3;
    ctx.save(); ctx.translate(px + buzz, py); ctx.rotate(-0.25); ctx.scale(1, 0.55);
    ctx.fillStyle = '#0b0b0c'; ctx.fillRect(-36 * d, -70 * d, 72 * d, 140 * d);
    ctx.fillStyle = lit ? 'rgba(160,200,255,.85)' : 'rgba(40,50,60,.6)'; ctx.fillRect(-32 * d, -64 * d, 64 * d, 128 * d);
    if (lit) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = `${12 * d}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('Annem', 0, -10 * d); ctx.fillText('arıyor…', 0, 8 * d); }
    ctx.restore();
    if (lit) { const gl = ctx.createRadialGradient(px, py, 5, px, py, 180 * d); gl.addColorStop(0, 'rgba(120,170,255,.25)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H); if (Math.floor(t * 2.2 / (Math.PI * 2) * 4) % 4 === 0 && Math.random() < 0.05) sfx('vibrate'); }
    // yağmur
    ctx.strokeStyle = 'rgba(180,200,220,.28)'; ctx.lineWidth = 1.3 * d; ctx.beginPath();
    for (const r of rain) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.l * 0.15, r.y + r.l); r.y += r.v; r.x -= r.v * 0.15; if (r.y > H) { r.y = -30; r.x = Math.random() * W * 1.2; } }
    ctx.stroke();
    // film kumlanması
    for (let i = 0; i < 160; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; ctx.fillRect(Math.random() * W, Math.random() * H, 2 * d, 2 * d); }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
$('bSkip').onclick = () => { introStop = true; endIntro(); };
let introEnded = false;
function endIntro() { if (introEnded) return; introEnded = true; introStop = true; const v = $('introVid'); try { v.pause(); } catch (e) {} enterDevice(false); }

// ---------- cihaz / kilit ekranı ----------
function enterDevice(resume) {
  scr('s-device'); ambience('rain');
  clock();
  if (resume && store.get('stage', null)) { S.unlocked = true; S.sawVideo = store.get('stage') !== 'home'; view('home'); buildHome(); ambience('room'); if (store.get('stage') === 'ch0done') setTimeout(startCh1, 1500); if (store.get('stage') === 'ch1done') setTimeout(startCh2, 1500); if (store.get('stage') === 'ch2' && !store.get('c2called', false)) setTimeout(dedeCall, 2500); return; }
  view('lock'); buildNotifs();
  setTimeout(() => { if (S.view === 'lock' || S.view === 'pin') darkNotif(); }, 7000);
  setTimeout(() => { if (!S.called && !S.unlocked && (S.view === 'lock' || S.view === 'pin')) incomingCall(); }, 65000);
}
const NOTIFS = [
  { ic: '📞', bg: '#34c759', app: 'TELEFON', tm: '5 dk önce', t: 'Annem', p: '37 cevapsız arama', stack: true },
  { ic: '💬', bg: '#34c759', app: 'MESAJLAR', tm: '2 sa önce', t: 'Annem', p: 'Kızım neredesin? Deden sabahtan beri "Deniz nerede" diye sayıklıyor. Bir ses ver ne olur…' },
  { ic: '💬', bg: '#34c759', app: 'MESAJLAR', tm: 'dün', t: 'Ece 🌻', p: 'Deniz o sesi ben de duydum, şaka değil bu. Lütfen geri dön, o madene…' },
  { ic: '📸', bg: 'linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2)', app: 'FOTOGRAM', tm: 'dün', t: 'Anılar', p: "8 yıl önce bugün: \"Karabaş'la ilk günümüz 🐶\" — anını hatırla" },
];
function notifEl(n, dark) {
  const d = document.createElement('div'); d.className = 'nt' + (n.stack ? ' stack' : '') + (dark ? ' dark' : '');
  d.innerHTML = `<div class="nt-h"><span class="nt-ic" style="background:${n.bg}">${n.ic}</span>${n.app}<span class="tm">${n.tm}</span></div><b>${n.t}</b><p>${n.p}</p>`;
  d.onclick = () => { sfx('tap'); toast('Görmek için kilidi aç'); };
  return d;
}
async function buildNotifs() {
  const box = $('notifs'); box.innerHTML = '';
  for (const n of NOTIFS) { await sleep(450); box.appendChild(notifEl(n)); sfx('notif'); }
}
function darkNotif() {
  if ($('notifs').querySelector('.dark')) return;
  const el = notifEl({ ic: '?', bg: '#222', app: 'MESAJLAR', tm: 'şimdi', t: 'Bilinmeyen Numara', p: 'Onu açma.' }, true);
  $('notifs').prepend(el); sfx('darknotif'); sfx('vibrate'); vib([300, 200, 300]);
  setTimeout(() => sfx('heart'), 800); setTimeout(() => sfx('heart'), 1700);
}

// yukarı kaydırma
(() => {
  const el = $('v-lock'); let y0 = null;
  el.addEventListener('pointerdown', (e) => { if (e.target.closest('button,.nt')) return; y0 = e.clientY; });
  el.addEventListener('pointerup', (e) => { if (y0 !== null && y0 - e.clientY > 70) openPin(); y0 = null; });
  $('swipeHint').onclick = openPin;
})();
function openPin() { sfx('whoosh'); view('pin'); renderPin(); }
$('bPinBack').onclick = () => { sfx('tap'); S.entry = ''; view('lock'); };
$('bEmerg1').onclick = $('bEmerg2').onclick = () => { sfx('tap'); view('emerg'); };
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { sfx('tap'); view(b.dataset.go); if (b.dataset.go === 'pin') renderPin(); });
$('bEmCall').onclick = () => { sfx('static'); toast('Arama başarısız — Şebeke yok. Yalnızca SOS.'); };
$('bFlash').onclick = () => {
  sfx('tap'); const on = $('bFlash').classList.toggle('on');
  let l = $('v-lock').querySelector('.flashlight'); if (on && !l) { l = document.createElement('div'); l.className = 'flashlight'; $('v-lock').appendChild(l); } else if (!on && l) l.remove();
};

// şifre ekranı
const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['', ''], ['0', '+'], ['⌫', '']];
(() => {
  const k = $('keys');
  for (const [n, l] of KEYS) {
    const b = document.createElement('button'); b.className = 'key' + (n === '' ? ' empty' : '');
    b.innerHTML = n === '⌫' ? '<span style="font-size:22px">⌫</span>' : `${n}<small>${l}</small>`;
    if (n) b.onclick = () => press(n);
    k.appendChild(b);
  }
})();
function renderPin() {
  const d = $('dots'); d.innerHTML = '';
  for (let i = 0; i < 6; i++) { const e = document.createElement('i'); if (i < S.entry.length) e.className = 'on'; d.appendChild(e); }
  lockTick();
}
function lockTick() {
  const left = Math.ceil((S.lockUntil - Date.now()) / 1000);
  const locked = left > 0;
  $('keys').classList.toggle('locked', locked);
  $('pinTitle').textContent = locked ? `Telefon devre dışı · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} sonra tekrar dene` : (S.attempts ? 'Yanlış Şifre' : 'Şifreyi Girin');
  if (locked) setTimeout(lockTick, 500);
}
function press(n) {
  if (Date.now() < S.lockUntil) return;
  sfx('key'); vib(8);
  if (n === '⌫') { S.entry = S.entry.slice(0, -1); renderPin(); return; }
  if (S.entry.length >= 6) return;
  S.entry += n; renderPin();
  if (S.entry.length === 6) setTimeout(check, 180);
}
function check() {
  if (S.entry === PIN) { unlock(false); return; }
  S.attempts++; S.entry = '';
  const d = $('dots'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake');
  sfx('error'); vib([60, 40, 60]);
  if (S.attempts % 3 === 0) { S.lockUntil = Date.now() + 30000 * (S.attempts / 3); sfx('buzz'); }
  renderPin();
  if (S.attempts === 2 && !S.called) setTimeout(incomingCall, 1400);
  if (S.attempts === 4) setTimeout(() => { banner('?', 'Bilinmeyen Numara', 'Onu en çok kim severdi? Acil durumuna bak.', true); sfx('darknotif'); }, 900);
  if (S.attempts === 7) setTimeout(() => { banner('?', 'Bilinmeyen Numara', 'Arkasına bak.', true); sfx('darknotif'); vib([200, 100, 200]); }, 900);
}

// güvenlik sorusu (gizli yol)
$('bForgot').onclick = () => { sfx('tap'); view('question'); $('qIn').value = ''; $('qErr').textContent = ''; };
$('bQok').onclick = () => {
  const v = $('qIn').value.trim().toLocaleLowerCase('tr').replace(/\s+/g, '').replace(/ş/g, 's');
  if (v === 'karabas') { store.set('ach_karabas', true); toast('🏅 Gizli yol bulundu: Karabaş', 3000); unlock(true); }
  else { sfx('error'); vib(80); $('qErr').textContent = 'Yanıt eşleşmiyor.'; }
};

// telefonu çevir
$('bFlip').onclick = () => { sfx('flip'); $('s-device').classList.add('flipped'); S.flipped = true; };
$('bFlipBack').onclick = () => { sfx('flip'); $('s-device').classList.remove('flipped'); S.flipped = false; };
$('casePhoto').onclick = () => {
  sfx('flip'); const c = $('casePhoto'); const turned = c.classList.toggle('turn');
  $('backTip').textContent = turned ? 'Arkasında solmuş mürekkeple bir not var.' : 'Kılıfın arasına eski bir fotoğraf sıkıştırılmış. Dokun.';
};

// ---------- gelen arama ----------
let prevView = 'lock';
function incomingCall() {
  if (S.called || S.unlocked) return; S.called = true;
  if (S.flipped) $('bFlipBack').onclick();
  prevView = S.view === 'call' ? 'lock' : S.view; view('call');
  $('callSub').textContent = 'gelen arama…'; $('callCap').textContent = ''; $('callBtns').style.display = 'flex';
  $('bAnswer').style.display = ''; $('bDecline').firstChild.textContent = '✕';
  ringtone(true); vib([800, 400, 800, 400, 800]);
}
$('bDecline').onclick = () => endCall(true);
$('bAnswer').onclick = async () => {
  ringtone(false); vib(0); sfx('tap'); ambience('static');
  $('bAnswer').style.display = 'none';
  let s = 0; const tick = setInterval(() => { s++; $('callSub').textContent = `00:${String(s).padStart(2, '0')}`; }, 1000);
  callTick = tick;
  const cap = $('callCap');
  await sleep(1800); cap.textContent = '(rüzgâr… cızırtı…)';
  await sleep(1800); cap.textContent = '…geri koy onu…';
  const vo = new Audio('media/audio/ses_geri_koy.mp3'); vo.volume = 1; callVo = vo;
  vo.play().catch(() => whisper('geri koy onu… bulduğun yere'));
  await sleep(2400); cap.textContent = '…bulduğun yere… geri koy.';
  await sleep(3000); sfx('glitch'); $('screen').classList.add('glitch'); setTimeout(() => $('screen').classList.remove('glitch'), 1000);
  endCall(false);
};
let callTick = null, callVo = null;
function endCall(declined) {
  ringtone(false); vib(0); clearInterval(callTick);
  try { speechSynthesis.cancel(); } catch (e) {}
  try { callVo && callVo.pause(); } catch (e) {}
  $('callSub').textContent = 'Arama sona erdi'; $('callBtns').style.display = 'none';
  setTimeout(() => {
    ambience('rain'); view(prevView === 'call' ? 'lock' : prevView); if (S.view === 'pin') renderPin();
    if (declined) { const el = notifEl({ ic: '📞', bg: '#ff3b30', app: 'TELEFON', tm: 'şimdi', t: 'Bilinmeyen Numara', p: 'Cevapsız arama' }); $('notifs').prepend(el); }
  }, 1300);
}

// ---------- kilit açılışı ----------
async function unlock(secret) {
  S.unlocked = true; store.set('stage', 'home');
  sfx('glitch'); vib([30, 30, 30]);
  const sc = $('screen'); sc.classList.add('glitch');
  await sleep(700); sc.classList.remove('glitch');
  sfx('unlock'); view('home'); buildHome();
  ambience('room');
  await sleep(2600);
  banner('?', 'Bilinmeyen Numara', 'Onu açtın.', true); sfx('darknotif'); vib([300, 150, 300]);
  await sleep(3200);
  await jumpScare();
  await sleep(600);
  banner('?', 'Bilinmeyen Numara', 'Şimdi geri koy.', true); sfx('darknotif');
  await sleep(5200);
  if (!S.sawVideo) { banner('🖼️', 'Galeri', '1 video kurtarıldı: VID_0314.mp4', false, 'GALERİ'); sfx('notif'); badges.Galeri = 1; buildHome(); }
}

// ani korkutma
async function jumpScare() {
  const s = $('scare'); s.innerHTML = '';
  s.classList.add('on'); stopAmbience(); sfx('heart');
  await sleep(1100); sfx('heart'); await sleep(900);
  const cv = document.createElement('canvas'); const R = s.getBoundingClientRect(); cv.width = R.width; cv.height = R.height; s.appendChild(cv);
  const ctx = cv.getContext('2d');
  sfx('sting'); vib([500]);
  const t0 = performance.now();
  await new Promise(res => {
    const draw = (n) => {
      const t = (n - t0) / 1000, W = cv.width, H = cv.height;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      if (has.scare) { /* gerçek görsel varsa onu titreterek göster */
        const img = scareImg; const k = 1.05 + t * 0.3; ctx.globalAlpha = Math.random() < 0.15 ? 0.3 : 1;
        ctx.drawImage(img, W / 2 - W * k / 2 + (Math.random() - 0.5) * 20, H / 2 - H * k / 2, W * k, H * k); ctx.globalAlpha = 1;
      } else drawFace(ctx, W, H, t);
      for (let y = 0; y < H; y += 3) { ctx.fillStyle = `rgba(0,0,0,${0.25 + Math.random() * 0.2})`; ctx.fillRect(0, y, W, 1); }
      if (Math.random() < 0.3) { const y = Math.random() * H; ctx.drawImage(cv, 0, y, W, 20, (Math.random() - 0.5) * 40, y, W, 20); }
      if (t < 0.75) requestAnimationFrame(draw); else res();
    };
    requestAnimationFrame(draw);
  });
  s.classList.remove('on'); s.innerHTML = '';
  $('screen').classList.add('glitch'); sfx('glitch'); setTimeout(() => $('screen').classList.remove('glitch'), 1000);
  ambience('room');
}
let scareImg = null;
probeMedia().then(() => { if (has.scare) { scareImg = new Image(); scareImg.src = MEDIA.scare; } });
function drawFace(ctx, W, H, t) {
  const cx = W / 2 + (Math.random() - 0.5) * 12, cy = H * 0.46, s = Math.min(W, H) * (0.36 + t * 0.12);
  const g = ctx.createRadialGradient(cx, cy, s * 0.1, cx, cy, s * 1.2); g.addColorStop(0, '#8a8f86'); g.addColorStop(0.55, '#2c302b'); g.addColorStop(1, '#000');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, s * 0.62, s * 0.85, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sx * s * 0.24, cy - s * 0.12, s * 0.13, s * 0.17, sx * 0.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.85)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sx * s * 0.24, cy - s * 0.1, s * 0.018, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.38, s * 0.12, s * 0.22 + Math.sin(t * 40) * s * 0.02, 0, 0, Math.PI * 2); ctx.fill();
}

// ---------- ana ekran ----------
const APPS = [
  ['Mesajlar', '💬', '#34c759', 12], ['Galeri', '🖼️', 'linear-gradient(135deg,#ffd54f,#ff7043,#ab47bc,#42a5f5)', 0], ['Sesli Notlar', '🎙️', '#1c1c1e', 3], ['Notlar', '📝', '#ffd60a', 0],
  ['Harita', '🗺️', 'linear-gradient(#a5d6a7,#64b5f6)', 0], ['E-posta', '✉️', '#0a84ff', 4], ['Fotogram', '📸', 'linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2)', 9], ['Hava', '⛅', 'linear-gradient(#4fc3f7,#1976d2)', 0],
  ['Saat', '🕓', '#1c1c1e', 0], ['Ayarlar', '⚙️', '#8e8e93', 0], ['Fener', '🔦', '#2c2c2e', 0], ['Takvim', '📅', '#fff', 1],
];
const DOCK = [['Telefon', '📞', '#34c759', 38], ['Tarayıcı', '🧭', '#fff', 0], ['Kamera', '📷', '#8e8e93', 0], ['Müzik', '🎵', 'linear-gradient(#ff5e62,#ff2d55)', 0]];
const badges = { Galeri: 0 };
function appEl([n, ic, bg, badge]) {
  const a = document.createElement('button'); a.className = 'app';
  const b = n in badges ? badges[n] : badge;
  a.innerHTML = `<i style="background:${bg}">${ic}${b ? `<em>${b}</em>` : ''}</i><span>${n}</span>`;
  a.onclick = () => { sfx('tap'); openApp(n); };
  return a;
}
function buildHome() {
  if (store.get('stage', null) === 'home' && !S.sawVideo && !S.galSeen) badges.Galeri = 1;
  const g = $('apps'); g.innerHTML = ''; APPS.forEach(a => g.appendChild(appEl(a)));
  const d = $('dock'); d.innerHTML = ''; DOCK.forEach(a => d.appendChild(appEl(a)));
}

// ---------- uygulamalar (Bölüm 0'da sınırlı ama hikâyeye bağlı) ----------
function sheet(title, html) { if (sheetCleanup) { const f = sheetCleanup; sheetCleanup = null; f(); } chatOpen = false; $('shTitle').textContent = title; $('shBody').innerHTML = html; $('sheet').classList.add('on'); S.view = 'app'; }
let sheetCleanup = null;
function closeSheet() { if (sheetCleanup) { const f = sheetCleanup; sheetCleanup = null; f(); } chatOpen = false; $('sheet').classList.remove('on'); S.view = 'home'; }
$('bShClose').onclick = () => { sfx('tap'); closeSheet(); };
const row = (a, b = '', cls = '') => `<div class="row ${cls}"><span>${a}</span><small>${b}</small></div>`;
const LOCKED = (t) => `<div class="lock">🔒</div><p class="center">${t}</p><p class="center red" style="margin-top:10px">Galeri'de kurtarılan bir video var. Önce onu izle.</p>`;
const APP_PAGES = {
  'Mesajlar': () => sheet('Mesajlar', `${row('<b>Annem</b><br><span class="mut">Kızım neredesin? Bir ses ver ne olur…</span>', '2 sa')}${row('<b>Ece 🌻</b><br><span class="mut">Deniz o sesi ben de duydum…</span>', 'dün')}${row('<b class="red">Bilinmeyen Numara</b><br><span class="mut">Şimdi geri koy.</span>', 'şimdi')}${row('<b>Dedem 🤍</b><br><span class="mut">Sesli mesaj · 0:12</span>', '5 gün')}<div class="sec">ŞİFRELİ</div>${LOCKED('Bu konuşmalar ikinci bir şifreyle korunuyor.')}`),
  'Galeri': () => openGallery(),
  'Sesli Notlar': () => { sheet('Sesli Notlar', `${row('madene_giris.m4a', '5 Kasım · 03:02')}${row('dedem_anlatiyor_3.m4a', '2 Kasım')}${row('dedem_anlatiyor_2.m4a', '1 Kasım')}${row('dedem_anlatiyor_1.m4a', '1 Kasım')}<p class="red center" style="margin-top:18px">Dosyalar bozuk. Onarım gerekiyor.</p>`); sfx('static'); },
  'Notlar': () => sheet('Notlar', `<div class="paper">Dedem 1941 göçüğünü hiç anlatmazdı.<br><s>Kimse çıkamadı</s> — <b>biri</b> çıktı.<br>Defterini buldum. Son sayfada aynı cümle tekrar tekrar yazıyor:<br><i>"Onu açma."</i><br><br>Yarın gece ocağa gidiyorum. Ece gelmiyor.</div><p class="mut" style="margin-top:12px">Son düzenleme: 4 Kasım 23:48</p>`),
  'Harita': () => sheet('Harita', `<div class="big">📍</div><p class="center"><b>Eski Bakır Ocağı</b><br><span class="mut">Karagöl yaylası · 1.920 m</span></p>${row('Son konum', '5 Kasım · 03:14')}${row('Konum paylaşımı', 'KAPALI', 'red')}<p class="mut center" style="margin-top:12px">Konum paylaşımı 03:16'da kapatıldı.</p>`),
  'E-posta': () => sheet('E-posta', `${row('<b>Kültür Arşivi</b><br><span class="mut">RE: 1941 Karagöl maden kazası kayıtları</span>', '3 Kas')}${row('<b>Foto Karadeniz</b><br><span class="mut">Eski negatifleriniz hazır</span>', '29 Eki')}<p class="mut center" style="margin-top:16px">Ağ yok. Yeni postalar alınamıyor.</p>`),
  'Fotogram': () => sheet('Fotogram', `<div class="big">📸</div><p class="center">Son paylaşım: <b>"Dedemin köyü 🌿"</b><br><span class="mut">4 gün önce · 212 beğeni</span></p><p class="mut center" style="margin-top:14px">En son yorum (Bilinmeyen): <span class="red">"arkanda"</span></p>`),
  'Hava': () => sheet('Hava', `<p class="center mut" style="margin-top:20px">KARAGÖL YAYLASI</p><div class="big">9°</div><p class="center">Sağanak yağış</p><p class="center mut">5 gündür aralıksız</p>`),
  'Saat': () => sheet('Saat', `<div class="sec">ALARMLAR</div>${row('<span style="font-size:34px;font-weight:200">03:17</span><br><span class="red">UYAN. ORADAN ÇIK.</span>', 'her gün')}${row('<span style="font-size:34px;font-weight:200;color:#666">07:30</span><br><span class="mut">ilaçlar — dedem</span>', 'kapalı')}`),
  'Ayarlar': () => sheet('Ayarlar', `${row('Cihaz adı', 'Deniz’in Telefonu')}${row('Pil', S.bat + '%')}${row('Bul (konum)', 'KAPALI', 'red')}${row('Son yedekleme', '5 Kasım 03:15')}${row('Kayıtlı yüz', '2 yüz')}<p class="mut center" style="margin-top:14px">Yüz Tanıma'da Deniz'den başka biri kayıtlı.</p>`),
  'Fener': () => { $('bFlash').onclick(); toast($('bFlash').classList.contains('on') ? 'Fener açık' : 'Fener kapalı'); },
  'Takvim': () => sheet('Takvim', `${row('<b>7 Mayıs</b><br><span class="mut">Dedemin doğum günü 🎂</span>', 'her yıl')}${row('<b>5 Kasım · 02:30</b><br><span class="mut">Ocak — dedem bilmesin</span>', '', 'red')}${row('<b>9 Kasım</b><br><span class="mut">Ankara’ya dönüş ✈️</span>', '')}`),
  'Telefon': () => sheet('Son Aramalar', `${row('<b>Annem</b> (37)', 'bugün', 'red')}${row('<b class="red">Bilinmeyen Numara</b>', S.called ? 'şimdi' : 'dün')}${row('<b>112</b><br><span class="mut">bağlanamadı</span>', '5 Kas 03:15')}${row('<b>Dedem 🤍</b>', '5 Kas 02:41')}`),
  'Tarayıcı': () => sheet('Geçmiş', `${row('karagöl bakır ocağı 1941 göçük')}${row('madende kaybolan işçiler isimleri')}${row('"onu açma" ne demek')}${row('telefonu biri başka yerden açabilir mi')}<p class="mut center" style="margin-top:14px">Ağ yok.</p>`),
  'Kamera': () => { sfx('glitch'); $('screen').classList.add('glitch'); setTimeout(() => $('screen').classList.remove('glitch'), 600); toast('Kamera şu anda başka bir uygulama tarafından kullanılıyor.', 3000); },
  'Müzik': () => sheet('Müzik', `<div class="big">🎵</div><p class="center"><b>dedemin_kaseti_A.mp3</b><br><span class="mut">Bilinmeyen Sanatçı · Kemençe</span></p><p class="red center" style="margin-top:14px">Çalınamıyor — dosya bozuk.</p>`),
};
function openApp(n) {
  const st = store.get('stage', null) || '';
  if (st.startsWith('ch2') && CH2_PAGES[n]) { badges[n] = 0; buildHome(); return CH2_PAGES[n](); }
  const ch1 = ['ch1', 'ch1done'].includes(st) || st.startsWith('ch2');
  if (ch1 && CH1_PAGES[n]) { badges[n] = 0; buildHome(); return CH1_PAGES[n](); }
  (APP_PAGES[n] || (() => toast(n)))();
}

// galeri
function openGallery() {
  const isNew = !S.sawVideo;
  sheet('Galeri', `<div class="sec">SON EKLENENLER</div><div class="grid">
    <button data-v="forest" class="${isNew ? 'new' : ''}" style="background-image:url(${MEDIA.mine})"><em>▶ 0:20</em></button>
    <button data-i="village" style="background-image:url(${MEDIA.village})"></button>
    <button data-i="notebook" style="background-image:url(${MEDIA.notebook})"></button>
    <button data-i="wallpaper" style="background-image:url(${MEDIA.wallpaper})"></button>
    <button data-i="oldphoto" style="background-image:url(${MEDIA.oldphoto})"></button>
    ${store.get('gx', []).map(k => `<button data-i="${k}" style="background-image:url(${MEDIA[k]})"></button>`).join('')}
    <button class="broken" data-x>⚠︎</button>
  </div><p class="mut center" style="margin-top:14px">${6 + store.get('gx', []).length} öğe · 214 öğe kilitli albümde</p>`);
  badges.Galeri = 0; S.galSeen = true;
  $('shBody').querySelectorAll('[data-i]').forEach(b => b.onclick = () => { sfx('tap'); viewImage(b.dataset.i); });
  $('shBody').querySelector('[data-x]').onclick = () => { sfx('static'); toast('Dosya okunamıyor: IMG_0317.jpg'); };
  $('shBody').querySelector('[data-v]').onclick = () => { sfx('tap'); playFootage(); };
}
const CAPS = { harita: 'Dedemin defteri — maden haritası', selfie: '5 Kasım · 03:16', g317: '317', defter: 'Dedemin defteri — son sayfa', miners: 'Karagöl Bakır Ocağı, 1941', village: 'Dedemin köyü 🌿', notebook: 'Dedemin defteri. 1941.', wallpaper: 'Dedemle 🤍', oldphoto: 'Dedem, 20 yaşında.' };
function vwOpen() { $('viewer').classList.add('on'); $('vwImg').style.display = 'none'; $('vwVid').style.display = 'none'; $('vwRec').style.display = 'none'; $('vwCap').textContent = ''; }
function vwClose() { const v = $('vwVid'); try { v.pause(); } catch (e) {} v.onended = v.ontimeupdate = null; $('viewer').classList.remove('on'); }
$('bVwClose').onclick = () => { sfx('tap'); if (footageOn) return; vwClose(); };
function viewImage(k) { vwOpen(); const i = $('vwImg'); i.src = MEDIA[k]; i.style.display = 'block'; $('vwCap').textContent = CAPS[k] || ''; }
let footageOn = false;
function playFootage() {
  vwOpen(); footageOn = true; $('bVwClose').style.opacity = .2;
  const v = $('vwVid'); v.src = MEDIA.forest; v.style.display = 'block'; $('vwRec').style.display = 'flex'; v.muted = false; v.currentTime = 0;
  stopAmbience();
  const caps = [[1, '(nefes sesleri)'], [6, '"Dede… buraya mı geldin o gece?"'], [12, '"Biri mi var orada?"'], [17, '']];
  v.ontimeupdate = () => {
    const t = v.currentTime; $('vwTc').textContent = '00:' + String(Math.floor(t)).padStart(2, '0');
    for (const [at, c] of caps) if (t >= at && t < at + 0.35) $('vwCap').textContent = c;
  };
  v.onended = () => footageEnd();
  v.play().catch(() => { v.muted = true; v.play().catch(() => footageEnd()); });
}
async function footageEnd() {
  const v = $('vwVid'); v.onended = v.ontimeupdate = null;
  $('vwCap').textContent = ''; sfx('static');
  $('screen').classList.add('glitch'); await sleep(500);
  await jumpScare();
  vwClose(); footageOn = false; $('bVwClose').style.opacity = '';
  $('screen').classList.remove('glitch'); closeSheet();
  S.sawVideo = true; store.set('stage', 'ch0done');
  await sleep(1200);
  endCard();
}
const ENDS = {
  0: { ch: 'BÖLÜM 0', title: 'KİLİT', next: 'Bölüm 1 — Mesajlar', soon: 'Hazır', btn: 'BÖLÜM 1\'E GEÇ',
    text: 'Telefonun sahibi <b>Deniz Aydın</b>.<br>5 Kasım gecesi, dedesinin 1941\'de kapanan bakır ocağına girdi.<br>O geceden beri biri bu telefonu izliyor.<br><br><span style="color:#8a1c1c">Ve artık seni de biliyor.</span>' },
  1: { ch: 'BÖLÜM 1', title: 'MESAJLAR', next: 'Bölüm 2 — Karagöl', soon: 'Hazır', btn: 'BÖLÜM 2\'YE GEÇ',
    text: '1941\'de altı kişi girdi. İki kişi çıktı.<br>Hasan Aydın 85 yıl bir sırrı sakladı.<br>Deniz o kapıyı açık bıraktı.<br><br><span style="color:#8a1c1c">Ve şimdi kapının bu tarafında<br>telefonu tutan tek kişi sensin.</span>' },
};
let endShown = 0;
function endCard(n = 0) {
  endShown = n; const d = typeof ENDS[n] === 'function' ? ENDS[n]() : ENDS[n], e = $('endcard');
  $('ecCh').textContent = d.ch; $('ecTitle').textContent = d.title; $('ecText').innerHTML = d.text;
  $('ecNext').textContent = d.next; $('ecSoon').textContent = d.soon; $('bEcBack').textContent = d.btn;
  e.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add('show')));
  ambience('rain'); sfx('thunder');
}
$('bEcBack').onclick = () => {
  sfx('tap'); const e = $('endcard'); e.classList.remove('show'); setTimeout(() => e.classList.remove('on'), 600); ambience('room');
  if (endShown === 0 && store.get('stage', null) === 'ch0done') setTimeout(startCh1, 1400);
  if (endShown === 1 && store.get('stage', null) === 'ch1done') setTimeout(startCh2, 1400);
  if (String(endShown).startsWith('S') && store.get('endings', []).length < 3) setTimeout(finalChoice, 900);
};

// ===================== BÖLÜM 1 — MESAJLAR =====================
const CLIPS = [
  { id: 'dede_1', name: 'dedem_anlatiyor_1.m4a', date: '1 Kasım', target: 34, sub: ['Kızım… kaydediyor mu bu?', 'Peki. Bin dokuz yüz kırk bir. Yaz sonuydu.', 'Karagöl\'ün bakır ocağında çalışırdık.', 'O sabah… altı kişi girdik ocağa.'] },
  { id: 'dede_2', name: 'dedem_anlatiyor_2.m4a', date: '1 Kasım', target: 72, sub: ['Önce su geldi… sonra tavan çöktü.', 'Karanlıkta beş gün bekledik.', 'Beşinci gece… içeriden biri bizi adımızla çağırmaya başladı.', 'Ama biz altı kişiydik kızım. Ve hepimiz… oradaydık.'] },
  { id: 'dede_3', name: 'dedem_anlatiyor_3.m4a', date: '2 Kasım', target: 17, sub: ['Üç yüz on yedi numaralı galeri.', 'Orada bir kapı var kızım… taştan.', 'Ben onu açtım. Çıktım… ötekiler gelmedi.', 'Ama o… o da benimle çıktı.', 'Sakın gitme oraya. Sakın… açma onu.'] },
  { id: 'deniz_maden', name: 'madene_giris.m4a', date: '5 Kasım · 03:14', target: 58, sub: ['Saat üçü on dört geçiyor.', 'Dedemin dediği galeriyi buldum… üç yüz on yedi.', 'Kapı… kapı zaten açık.', 'Bir saniye…', 'Biri… biri içeriden adımı söylüyor.'] },
];
const fixed = () => store.get('fixed', []);
function startCh1() {
  if (store.get('stage', null) !== 'ch0done') return;
  store.set('stage', 'ch1'); S.view = 'home';
  badges['Sesli Notlar'] = 4; buildHome();
  setTimeout(() => { banner('🎙️', 'Sesli Notlar', '4 kayıt kısmen kurtarıldı. Onarılabilir.', false, 'SESLİ NOTLAR'); sfx('notif'); }, 1200);
}

// --- ses onarımı ---
let AC1 = null;
const ac1 = () => { if (!AC1) AC1 = new (window.AudioContext || window.webkitAudioContext)(); if (AC1.state === 'suspended') AC1.resume(); return AC1; };
function noiseLoop() {
  const a = ac1(), len = a.sampleRate * 2, b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.002 ? 3 : 1);
  const src = a.createBufferSource(); src.buffer = b; src.loop = true;
  const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.6;
  const g = a.createGain(); g.gain.value = 0.4; src.connect(f); f.connect(g); g.connect(a.destination); src.start();
  return { g, stop: () => { try { src.stop(); } catch (e) {} } };
}
function playSubs(au, c, box) {
  au.ontimeupdate = () => { const d = au.duration || 12; const k = Math.min(c.sub.length - 1, Math.floor(au.currentTime / d * c.sub.length)); box.textContent = c.sub[k]; };
  au.onended = () => { box.textContent = ''; $('rpPlay') && ($('rpPlay').textContent = '▶ Tekrar dinle'); };
}
function openRepair(c) {
  const done = fixed().includes(c.id);
  sheet('Ses Onarımı', `<div class="rp"><div class="rp-name">🎙️ ${c.name}<br><small>${c.date}</small></div><canvas id="rpWave"></canvas>
    <div class="rp-stat ${done ? 'ok' : ''}" id="rpStat">${done ? 'ONARILDI ✓' : 'SİNYAL %0'}</div>
    ${done ? '' : `<input type="range" id="rpSl" min="0" max="100" value="${c.target > 50 ? 4 : 96}"><div class="rp-hint">Cızırtı kaybolana kadar frekansı yavaşça kaydır</div>`}
    <div class="rp-sub" id="rpSub"></div>${done ? '<button class="rp-btn" id="rpPlay">▶ Dinle</button>' : ''}</div>`);
  stopAmbience();
  const au = new Audio(`media/audio/${c.id}.mp3`); au.preload = 'auto';
  const cv = $('rpWave'), R = cv.getBoundingClientRect(), dp = Math.min(2, devicePixelRatio || 1); cv.width = R.width * dp; cv.height = R.height * dp;
  const ctx = cv.getContext('2d'); let clarity = done ? 1 : 0, alive = true, hold = 0, solved = done, nz = null;
  const draw = () => {
    if (!alive) return; const W = cv.width, H = cv.height; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const playing = !au.paused; ctx.fillStyle = clarity > 0.92 ? '#30d158' : '#ff453a';
    for (let x = 0; x < W; x += 4 * dp) {
      const clean = playing ? (0.25 + 0.6 * Math.abs(Math.sin(x * 0.013 + performance.now() / 180) * Math.sin(x * 0.004 + performance.now() / 700))) : 0.05;
      const h = (clean * clarity + Math.random() * (1 - clarity)) * H * 0.85; ctx.fillRect(x, (H - h) / 2, 2.4 * dp, h);
    }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  sheetCleanup = () => { alive = false; au.pause(); au.src = ''; if (nz) nz.stop(); ambience('room'); };
  if (done) { $('rpPlay').onclick = () => { sfx('tap'); au.currentTime = 0; au.volume = 1; au.play().catch(() => {}); playSubs(au, c, $('rpSub')); $('rpPlay').textContent = '■ Oynatılıyor'; }; return; }
  nz = noiseLoop(); au.loop = true; au.volume = 0.05; au.play().catch(() => {});
  const sl = $('rpSl'), stat = $('rpStat');
  const upd = () => {
    if (solved) return;
    const d = Math.abs(sl.value - c.target); clarity = Math.max(0, 1 - d / 22);
    au.volume = Math.min(1, 0.04 + 0.96 * clarity * clarity); nz.g.gain.value = 0.02 + 0.45 * (1 - clarity);
    stat.textContent = `SİNYAL %${Math.round(clarity * 100)}`; stat.classList.toggle('near', clarity > 0.6);
    $('rpSub').textContent = clarity > 0.55 ? c.sub[Math.min(c.sub.length - 1, Math.floor((au.currentTime / (au.duration || 12)) * c.sub.length))].replace(/[a-zçğıöşü]/gi, ch => Math.random() > clarity ? '▒' : ch) : '';
  };
  sl.oninput = () => { upd(); vib(4); };
  const iv = setInterval(() => {
    if (!alive) return clearInterval(iv);
    upd();
    if (Math.abs(sl.value - c.target) <= 3) { hold += 100; if (hold >= 1200 && !solved) { solved = true; clearInterval(iv); finishRepair(c, au, nz); } } else hold = 0;
  }, 100);
}
function finishRepair(c, au, nz) {
  nz.g.gain.value = 0; sfx('unlock'); vib([20, 40, 20]);
  const st = $('rpStat'); st.textContent = 'ONARILDI ✓'; st.className = 'rp-stat ok';
  $('rpSl').disabled = true; document.querySelector('.rp-hint').textContent = 'Kayıt onarıldı.';
  store.set('fixed', [...new Set([...fixed(), c.id])]);
  au.loop = false; au.currentTime = 0; au.volume = 1; au.play().catch(() => {}); playSubs(au, c, $('rpSub'));
  if (c.id === 'dede_3') setTimeout(() => { if (!store.get('msgOpen', false)) { banner('?', 'Bilinmeyen Numara', 'Hasan saati hep o rakama kurardı.', true); sfx('darknotif'); } }, (au.duration || 16) * 1000 + 1500);
  if (c.id === 'deniz_maden') setTimeout(() => { banner('?', 'Bilinmeyen Numara', 'Onu ben çağırdım.', true); sfx('darknotif'); vib([200, 100, 200]); }, (au.duration || 15) * 1000 + 1200);
}

// --- gizli sohbetler kodu ---
function openCodePad() {
  let code = '';
  sheet('Gizli Sohbetler', `<div class="lock" style="margin-top:20px">🔒</div><p class="center">Gizli sohbetler 4 haneli kodla korunuyor.</p><div class="cdots" id="cdots"></div><div class="cpad" id="cpad"></div><p class="center red" id="cerr" style="min-height:22px"></p>`);
  const dots = () => { $('cdots').innerHTML = [0, 1, 2, 3].map(i => `<i class="${i < code.length ? 'on' : ''}"></i>`).join(''); };
  dots();
  for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']) {
    const b = document.createElement('button'); b.textContent = k; if (!k) b.style.visibility = 'hidden';
    b.onclick = () => {
      sfx('key'); vib(6);
      if (k === '⌫') code = code.slice(0, -1); else if (code.length < 4) code += k;
      dots();
      if (code.length === 4) setTimeout(() => {
        if (code === '0317') { sfx('unlock'); store.set('msgOpen', true); openMessages(); setTimeout(() => { banner('?', 'Bilinmeyen Numara', 'Benim de mesajlarım var.', true); sfx('darknotif'); badges['Mesajlar'] = 1; }, 6000); }
        else { sfx('error'); vib([60, 40, 60]); $('cerr').textContent = 'Yanlış kod'; code = ''; dots(); const d = $('cdots'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); }
      }, 200);
    };
    $('cpad').appendChild(b);
  }
}

// --- mesajlar ---
function openMessages() {
  const open = store.get('msgOpen', false), cDone = store.get('chatDone', false);
  sheet('Mesajlar', `${row('<b>Annem</b><br><span class="mut">Kızım neredesin? Bir ses ver ne olur…</span>', '2 sa')}
    ${open ? `<button class="row-btn" id="mEce">${row('<b>Ece 🌻</b><br><span class="mut">Deniz??</span>', 'dün')}</button>
    <button class="row-btn" id="mUnk">${row(`<b class="red">Bilinmeyen Numara</b><br><span class="mut">${cDone ? 'Gel de gör.' : 'Benim de mesajlarım var.'}</span>`, 'şimdi')}</button>`
    : `<button class="row-btn" id="mLock">${row('<b>🔒 Gizli Sohbetler</b><br><span class="mut">2 sohbet · kod gerekli</span>', '')}</button>`}`);
  if (open) { $('mEce').onclick = () => { sfx('tap'); openEce(); }; $('mUnk').onclick = () => { sfx('tap'); openUnknown(); }; }
  else $('mLock').onclick = () => { sfx('tap'); openCodePad(); };
}
const ECE = [
  ['t', '5 Kasım · 02:51'], ['o', 'Ece geldim. Ocağın girişindeyim.'], ['i', 'Deniz deli misin?? Dön geri'], ['o', 'Dedem 85 yıl bunu tek başına taşıdı. Bilmem lazım.'],
  ['i', 'O ses kaydını dinledim. Senin adını söylüyordu, şaka değil bu!!'], ['t', '03:10'], ['o', '317\'yi buldum'], ['o', 'Ece bu kapı içeriden açılmış'],
  ['t', '03:16'], ['oi', 'selfie'], ['o', 'arkamda biri var mı söyle'], ['i', 'DENİZ'], ['i', 'ÇIK ORADAN'], ['i', 'DENİZ CEVAP VER'], ['t', 'Dün'], ['i', 'Deniz??'],
];
function bubble(kind, v) {
  if (kind === 't') return `<div class="c-time">${v}</div>`;
  if (kind === 'oi' || kind === 'ii') return `<div class="msg img ${kind === 'oi' ? 'out' : 'in red'}"><img src="${MEDIA[v]}" data-k="${v}"></div>`;
  return `<div class="msg ${kind === 'o' ? 'out' : kind === 'u' ? 'in red' : 'in'}">${v}</div>`;
}
function wireImgs() { $('shBody').querySelectorAll('.msg img').forEach(im => im.onclick = () => { sfx('tap'); viewImage(im.dataset.k); }); }
function openEce() {
  sheet('Ece 🌻', `<div class="chat">${ECE.map(([k, v]) => bubble(k, v)).join('')}</div>`);
  wireImgs(); addGx('selfie'); const b = $('shBody'); b.scrollTop = b.scrollHeight;
  sheetCleanup = () => { setTimeout(openMessages, 50); };
}
function addGx(k) { const g = store.get('gx', []); if (!g.includes(k)) { g.push(k); store.set('gx', g); } }

// --- Bilinmeyen ile canlı sohbet ---
let chatOpen = false, chatRunning = false, pendingChoice = null;
const CHAT = [];
function renderChat() {
  sheet('Bilinmeyen Numara', `<div class="chat" id="chat">${CHAT.map(([k, v]) => bubble(k, v)).join('')}<div class="typing hidden" id="typing"><i></i><i></i><i></i></div></div><div class="choices" id="choices"></div>`);
  chatOpen = true; wireImgs(); if (pendingChoice) showChoices(); scrollChat();
  sheetCleanup = () => { chatOpen = false; };
}
function scrollChat() { const b = $('shBody'); if (b) b.scrollTop = b.scrollHeight; }
function pushMsg(k, v) {
  CHAT.push([k, v]);
  if (k === 'ii') addGx(v);
  if (chatOpen) { $('typing').insertAdjacentHTML('beforebegin', bubble(k, v)); wireImgs(); scrollChat(); }
  if (k === 'u' || k === 'ii') { sfx('darknotif'); vib(40); if (!chatOpen) { banner('?', 'Bilinmeyen Numara', k === 'u' ? v : '📷 Fotoğraf', true); badges['Mesajlar'] = 1; buildHome(); } }
}
async function say(text, wait) {
  if (chatOpen) { $('typing').classList.remove('hidden'); scrollChat(); }
  await sleep(wait ?? Math.min(3200, 700 + text.length * 45));
  if (chatOpen) $('typing').classList.add('hidden');
  pushMsg('u', text); await sleep(500);
}
async function sendImg(k) { if (chatOpen) $('typing').classList.remove('hidden'); await sleep(1600); if (chatOpen) $('typing').classList.add('hidden'); pushMsg('ii', k); await sleep(900); }
function showChoices() {
  const box = $('choices'); if (!box || !pendingChoice) return;
  box.innerHTML = ''; pendingChoice.opts.forEach((o, i) => { const b = document.createElement('button'); b.textContent = o; b.onclick = () => { sfx('key'); const p = pendingChoice; pendingChoice = null; box.innerHTML = ''; pushMsg('o', o); p.res(i); }; box.appendChild(b); });
  scrollChat();
}
const choose = (opts) => new Promise(res => { pendingChoice = { opts, res }; if (chatOpen) showChoices(); });
function openUnknown() {
  renderChat();
  if (!chatRunning) { chatRunning = true; CHAT.length = 0; renderChat(); runChat(); }
}
async function runChat() {
  await sleep(800);
  await say('Sesleri dinledin.');
  await say('Hasan sana her şeyi anlatmadı. Ben anlatayım mı?');
  let c = await choose(['Sen kimsin?', 'Deniz nerede?']);
  if (c === 0) { await say('1941\'de altı kişi girdi.'); await say('İki kişi çıktı.'); await say('Hasan… ve ben.'); }
  else { await say('Kapının öbür tarafında.'); await say('Hasan\'ın yerini aldı.'); await say('Biri hep kalmak zorunda.'); }
  await say('Sana bir şey göstereyim.'); await sendImg('g317'); await say('Deniz kapıyı açık bıraktı.');
  c = await choose(['Onu geri ver.', 'Polisi arayacağım.']);
  if (c === 0) { await say('Takas.'); await say('Bir can… bir can.'); }
  else { S.bat = Math.max(4, S.bat - 7); clock(); sfx('glitch'); $('screen').classList.add('glitch'); setTimeout(() => $('screen').classList.remove('glitch'), 500); await say('Şebeken yok.'); await say('Hiç olmadı.'); }
  await say('Defterin son sayfasını gördün mü?'); await sendImg('defter'); await say('Hasan bunu 85 yıl yazdı. Kimse dinlemedi.');
  c = await choose(['Ne istiyorsun?', 'Telefonu kapatıyorum.']);
  if (c === 1) { sfx('glitch'); vib([80, 40, 80]); toast('Kapatma menüsü yanıt vermiyor.', 2600); await sleep(1400); await say('Kapatamazsın.'); await say('Peki… ne istediğimi soracaktın.'); }
  await say('Geri koy onu.'); await say('Bulduğun yere.');
  await sleep(900);
  if (chatOpen) $('typing').classList.remove('hidden');
  await sleep(1800); if (chatOpen) $('typing').classList.add('hidden');
  pushMsg('u', '🎤 Sesli mesaj · 0:06');
  const vo = new Audio('media/audio/ses_sen_de.mp3'); stopAmbience(); vo.play().catch(() => {});
  await sleep(7000); ambience('room');
  await say('Bu fotoğrafa iyi bak.'); await sendImg('miners'); await say('Sağdaki benim.');
  c = await choose(['Neden yüzün yok?', '…']);
  await say(c === 0 ? 'Çünkü henüz seçmedim.' : 'Korkma.', 1800);
  await say('Gel de gör.', 2200);
  store.set('chatDone', true);
  await sleep(1200);
  finale();
}

// --- final: 317 numaralı kapı ---
async function finale() {
  if (S.view === 'app') closeSheet();
  vwOpen(); footageOn = true; $('bVwClose').style.opacity = .15;
  const im = $('vwImg'); im.src = MEDIA.g317; im.style.display = 'block'; im.classList.add('kb');
  $('vwRec').style.display = 'flex';
  let dark = $('vwDark'); if (!dark) { dark = document.createElement('div'); dark.id = 'vwDark'; $('viewer').appendChild(dark); }
  stopAmbience(); ambience('static');
  const t0 = Date.now(); let fl = true;
  const tc = setInterval(() => { $('vwTc').textContent = '03:' + String(16 + Math.floor((Date.now() - t0) / 1000) % 44).padStart(2, '0'); }, 300);
  $('vwCap').textContent = '(canlı)';
  for (let i = 0; i < 16; i++) { // fener titremesi, giderek kötüleşiyor
    dark.style.opacity = Math.random() < 0.25 + i * 0.03 ? (0.6 + Math.random() * 0.4).toFixed(2) : (0.05 + i * 0.02).toFixed(2);
    if (i % 4 === 0) sfx('heart');
    await sleep(220 + Math.random() * 260);
  }
  $('vwCap').textContent = '';
  dark.style.opacity = 1; stopAmbience(); await sleep(1400);
  await jumpScare();
  clearInterval(tc); dark.style.opacity = 0; im.classList.remove('kb');
  vwClose(); footageOn = false; $('bVwClose').style.opacity = '';
  store.set('stage', 'ch1done');
  await sleep(1300); endCard(1);
}

const CH1_PAGES = {
  'Sesli Notlar': () => {
    const f = fixed();
    sheet('Sesli Notlar', CLIPS.map((c, i) => `<button class="row-btn" data-c="${i}">${row(`${c.name}<br><span class="mut">${c.date}</span>`, f.includes(c.id) ? '<span style="color:#30d158">▶ Dinle</span>' : '<span class="red">⚠︎ Onar</span>')}</button>`).join('') + `<p class="mut center" style="margin-top:14px">${f.length}/4 kayıt onarıldı</p>`);
    $('shBody').querySelectorAll('[data-c]').forEach(b => b.onclick = () => { sfx('tap'); openRepair(CLIPS[+b.dataset.c]); });
  },
  'Mesajlar': () => openMessages(),
  'Saat': () => sheet('Saat', `<div class="sec">ALARMLAR</div>${row('<span style="font-size:34px;font-weight:200">03:17</span><br><span class="red">UYAN. ORADAN ÇIK.</span>', 'her gün')}${row('<span style="font-size:34px;font-weight:200;color:#666">07:30</span><br><span class="mut">ilaçlar — dedem</span>', 'kapalı')}<p class="mut center" style="margin-top:14px">Alarm sahibi: Hasan Aydın'ın telefonundan aktarıldı.</p>`),
};

// ===================== BÖLÜM 2 — KARAGÖL =====================
function subsAt(lines, dur, t) {
  const L = lines.map(l => l.length), tot = L.reduce((a, b) => a + b, 0); let acc = 0;
  for (let i = 0; i < lines.length; i++) { acc += L[i]; if (t <= acc / tot * dur) return lines[i]; }
  return lines[lines.length - 1];
}
function playAudio(src, lines, box) {
  return new Promise(res => {
    const au = new Audio(src); let done = false; const fin = () => { if (done) return; done = true; if (box) box.textContent = ''; res(); };
    au.ontimeupdate = () => { if (box && lines) box.textContent = subsAt(lines, au.duration || 10, au.currentTime); };
    au.onended = fin; au.onerror = fin; au.play().catch(() => { if (box && lines) { let k = 0; const iv = setInterval(() => { box.textContent = lines[k++] || ''; if (k > lines.length) { clearInterval(iv); fin(); } }, 2600); } else fin(); });
  });
}
// tam ekran video (vwVid) — bitene kadar bekler
function playVid(name, cap = '', rec = true) {
  return new Promise(res => {
    vwOpen(); footageOn = true; $('bVwClose').style.opacity = .15;
    const v = $('vwVid'); v.poster = `media/${name}_poster.jpg`; v.src = `media/${name}.mp4`; v.style.display = 'block'; v.muted = false; v.currentTime = 0;
    $('vwRec').style.display = rec ? 'flex' : 'none'; $('vwCap').textContent = cap;
    v.ontimeupdate = () => { $('vwTc').textContent = '00:' + String(Math.floor(v.currentTime)).padStart(2, '0'); };
    let done = false; const fin = () => { if (done) return; done = true; v.onended = v.ontimeupdate = null; vwClose(); footageOn = false; $('bVwClose').style.opacity = ''; res(); };
    v.onended = fin; v.onerror = fin;
    v.play().catch(() => { v.muted = true; v.play().catch(fin); });
  });
}
function startCh2() {
  if (store.get('stage', null) !== 'ch1done') return;
  store.set('stage', 'ch2'); store.set('c2called', false);
  setTimeout(dedeCall, 2500);
}

// --- dedenin araması ---
const DEDE_LINES = ['Deniz? Kızım… sen misin?', '…Deniz?', 'Sen… sen Deniz değilsin. Kimsin sen?', 'O telefonu nerede buldun?', 'Dinle beni evlat. Onu bulduğun yere geri koymazsan, o seni takip eder.', 'Seksen beş yıl beni takip etti.', 'Haritayı defterde bıraktım. İki sol, bir sağ.', 'Ve sakın… sakın onun sesine kanma.', 'O herkesin sesini taklit eder. Benimkini bile.'];
function dedeCall() {
  if (S.view === 'app') closeSheet();
  const c = $('callx'); $('cxName').textContent = 'Dedem 🤍'; $('cxAva').textContent = 'H'; $('cxSub').textContent = 'gelen arama…'; $('cxCap').textContent = '';
  $('cxBtns').style.display = 'flex'; $('cxYes').style.display = ''; c.classList.add('on');
  stopAmbience(); ringtone(true); vib([800, 400, 800, 400, 800]);
  $('cxNo').onclick = () => { ringtone(false); vib(0); sfx('tap'); c.classList.remove('on'); ambience('room'); setTimeout(() => { banner('📞', 'Dedem 🤍', 'Cevapsız arama (2)', false, 'TELEFON'); setTimeout(dedeCall, 2500); }, 1500); };
  $('cxYes').onclick = async () => {
    ringtone(false); vib(0); sfx('tap'); $('cxYes').style.display = 'none'; $('cxNo').firstChild.textContent = '✕';
    $('cxNo').onclick = null; let s = 0; const tick = setInterval(() => { s++; $('cxSub').textContent = `00:${String(s).padStart(2, '0')}`; }, 1000);
    ambience('rain');
    await playAudio('media/audio/dede_ara.mp3', DEDE_LINES, $('cxCap'));
    clearInterval(tick); $('cxSub').textContent = 'Arama sona erdi'; $('cxBtns').style.display = 'none'; sfx('static');
    await sleep(1300); c.classList.remove('on'); ambience('room'); store.set('c2called', true);
    await sleep(2500);
    banner('?', 'Bilinmeyen Numara', '📹 Ben de onu izliyorum.', true); sfx('darknotif'); vib([200, 100, 200]);
    await sleep(2200);
    await playVid('v_dede', '(Karagöl · Aydın evi · şimdi)');
    $('screen').classList.add('glitch'); sfx('glitch'); setTimeout(() => $('screen').classList.remove('glitch'), 700);
    await sleep(1600);
    banner('🗺️', 'Harita', 'Kaydedilmiş rota: Eski Bakır Ocağı', false, 'HARİTA'); sfx('notif'); badges['Harita'] = 1; buildHome();
  };
}

// --- maden ---
const MN = { j: 0, alive: false };
const ROUTE = ['L', 'L', 'R'];
function mine(on) { $('mine').classList.toggle('on', on); MN.alive = on; if (on) S.view = 'mine'; else S.view = 'home'; }
function mnBg(key, flip) { const b = $('mnBg'); b.style.backgroundImage = `url(${MEDIA[key]})`; b.style.transform = flip ? 'scaleX(-1)' : ''; b.classList.remove('drift'); void b.offsetWidth; b.classList.add('drift'); }
function mnTop(t) { $('mnStep').textContent = t; $('mnBat').textContent = `🔋 ${S.bat}%`; }
function mnBtns(list) {
  const box = $('mnBtns'); box.innerHTML = '';
  return new Promise(res => list.forEach(([label, val, cls]) => { const b = document.createElement('button'); b.textContent = label; if (cls) b.className = cls; b.onclick = () => { sfx('key'); vib(8); box.innerHTML = ''; res(val); }; box.appendChild(b); }));
}
async function flicker(n = 6) { const d = $('mnDark'); for (let i = 0; i < n; i++) { d.style.opacity = Math.random() < 0.5 ? 0.92 : 0.15; await sleep(70 + Math.random() * 140); } d.style.opacity = 0.15; }
async function enterMine() {
  closeSheet(); mine(true); stopAmbience(); ambience('static');
  $('mnDark').style.opacity = 1; mnTop('KARAGÖL · ESKİ BAKIR OCAĞI'); $('mnCap').textContent = 'Rota yükleniyor…';
  await sleep(1400); $('mnCap').textContent = '';
  await playVid('v_tunel', '(Deniz\'in rotası · 5 Kasım · 03:05)');
  $('mnDark').style.opacity = 0.15;
  MN.j = 0;
  while (MN.j < 3) {
    const j = MN.j; mnBg('ayrim', j === 1); mnTop(`AYRIM ${j + 1}/3`);
    if (j === 2) {
      $('mnCap').textContent = '';
      await sleep(900); sfx('darknotif'); vib([200, 100, 200]);
      $('mnCap').innerHTML = '<span class="red">🎤 Deniz — sesli mesaj</span>';
      await sleep(600);
      await playAudio('media/audio/deniz_taklit.mp3', ['"Buradayım! Soldaki tünelden gel!"', '"Ne olur çabuk… çok karanlık burası!"', '"Sola gel, sola!"'], $('mnCap'));
    }
    $('mnCap').textContent = ['Su sesi iki yandan da geliyor.', 'Raylar ikiye ayrılıyor.', 'Dedenin sesi kulağında: "Onun sesine kanma."'][j];
    const pick = await mnBtns([['◀ SOL', 'L'], ['SAĞ ▶', 'R']]);
    if (pick === ROUTE[j]) { sfx('whoosh'); $('mnCap').textContent = ''; await flicker(3); MN.j++; continue; }
    // yanlış yol
    S.bat = Math.max(3, S.bat - 6); clock(); mnTop(`AYRIM ${j + 1}/3`);
    if (j === 2) {
      $('mnCap').textContent = '"Deniz?"'; await sleep(1400);
      const sc = $('scare'); sc.innerHTML = `<img src="${MEDIA.scare}" style="width:100%;height:100%;object-fit:cover">`; sc.classList.add('on'); sfx('sting'); vib([400]);
      await sleep(260); sc.classList.remove('on'); sc.innerHTML = ''; await flicker(8);
      $('mnCap').textContent = 'O Deniz değildi. Geri dönüyorsun…';
    } else { sfx('error'); sfx('heart'); await flicker(6); $('mnCap').textContent = 'Çıkmaz. Su yükseliyor. Geri dönüyorsun…'; }
    await sleep(2200);
  }
  // Deniz
  mnBg('denizArka'); mnTop('GALERİ 317\'YE YAKIN'); $('mnCap').textContent = 'Fenerin ışığında biri duruyor. Yeşil yağmurluk…';
  await sleep(1200);
  await mnBtns([['"Deniz?" diye seslen', 1], ['Omzuna dokun', 2]]);
  await playVid('v_deniz', '', true);
  // kamera
  stopAmbience(); $('mnBg').style.backgroundImage = 'none'; $('mnDark').style.opacity = 1; mnTop('FENER SÖNDÜ');
  $('mnCap').textContent = 'Fener söndü. Görebilmek için kamerayı kullan.'; await sleep(1200);
  $('mnDark').style.opacity = 0;
  for (let shot = 0; shot < 3; shot++) {
    $('mnBg').style.backgroundImage = 'none'; $('mine').classList.add('camui'); mnTop('KAMERA · GECE MODU');
    await mnBtns([['', 1, 'shutter']]);
    const fl = document.createElement('div'); fl.className = 'flash'; $('mine').appendChild(fl); sfx('tap'); setTimeout(() => fl.remove(), 400);
    if (shot === 2) { $('mine').classList.remove('camui'); await playVid('v_figur', '', true); break; }
    mnBg(shot === 0 ? 'figUzak' : 'figYakin'); $('mnBg').classList.add('photo'); sfx('heart');
    $('mnCap').textContent = shot === 0 ? 'Fotoğrafta… biri var.' : 'Daha yakın.';
    await sleep(2300); $('mnBg').classList.remove('photo'); $('mnCap').textContent = shot === 0 ? 'Tekrar çek.' : 'Bir daha çekme. Ya da çek.';
  }
  $('mine').classList.remove('camui');
  $('screen').classList.add('glitch'); sfx('glitch'); setTimeout(() => $('screen').classList.remove('glitch'), 800);
  $('mnDark').style.opacity = 1; mnTop('RAYLAR BİTTİ'); $('mnCap').textContent = 'Raylar bitti. Önünde taştan bir kapı.'; await sleep(2000);
  await playVid('v_kapi', '(317)');
  store.set('c2door', true);
  finalChoice();
}
function holdBtns(list) {
  const box = $('mnBtns'); box.innerHTML = ''; box.classList.add('holds'); $('mnCap').style.bottom = 'calc(275px + env(safe-area-inset-bottom))';
  return new Promise(res => list.forEach(([ic, label, val]) => {
    const b = document.createElement('button'); b.className = 'hold';
    b.innerHTML = `<i></i><span class="hi">${ic}</span><span class="hl">${label}</span><small>basılı tut</small>`;
    let t0 = 0, raf = 0, done = false;
    const step = () => { const p = Math.min(1, (performance.now() - t0) / 1500); b.style.setProperty('--p', (p * 100) + '%'); if (Math.random() < 0.25) vib(8); if (p >= 1) { done = true; box.classList.remove('holds'); box.innerHTML = ''; sfx('unlock'); vib([60, 40, 120]); res(val); return; } raf = requestAnimationFrame(step); };
    const start = (e) => { e.preventDefault(); if (done) return; t0 = performance.now(); sfx('key'); raf = requestAnimationFrame(step); };
    const stop = () => { if (done) return; cancelAnimationFrame(raf); b.style.setProperty('--p', '0%'); };
    b.addEventListener('pointerdown', start); b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop); b.addEventListener('pointercancel', stop);
    b.oncontextmenu = (e) => e.preventDefault();
    box.appendChild(b);
  }));
}
const WHISPERS = ['…Hasan?', '…yedi…', '…bizi bırakma…', '…geri ver…', '…sen de olursun…', '…üşüyoruz…', '…Deniz burada…', '…açık bırak…'];
async function finalChoice() {
  mine(true); stopAmbience(); ambience('static');
  if (S.bat < 14 || S.bat > 30) S.bat = 15;
  mnBg('kapiIc'); const bg = $('mnBg'); bg.classList.remove('drift'); bg.classList.remove('push'); void bg.offsetWidth; bg.classList.add('push');
  $('mnDark').style.opacity = 0.6; mnTop('317'); $('mnWh').textContent = ''; $('mnBtns').innerHTML = '';
  $('mnCap').textContent = 'Kapı aralık.'; await sleep(1400); $('mnDark').style.opacity = 0.15;
  $('mnCap').textContent = 'İçeride beş kişi, sırtları sana dönük… bekliyor.'; await sleep(2200);
  $('mnCap').textContent = '';
  await playAudio('media/audio/ses_geri_koy.mp3', ['…geri koy onu…', '…bulduğun yere…', '…geri koy.'], $('mnWh'));
  $('mnCap').innerHTML = '<span class="red">Karar ver. Pil bitmeden.</span>';
  let drained = false, wi = 0, alive = true;
  const zero = new Promise(res => {
    const tick = () => {
      if (!alive) return;
      S.bat = Math.max(0, S.bat - 1); clock(); mnTop('317'); sfx('heart');
      if (S.bat <= 5) { vib([80]); $('mnBat').classList.add('low'); }
      if (S.bat <= 0) { drained = true; return res('C'); }
      setTimeout(tick, S.bat <= 5 ? 900 : 1700);
    };
    setTimeout(tick, 1700);
  });
  const whIv = setInterval(() => { if (!alive) return; const w = $('mnWh'); w.classList.remove('show'); void w.offsetWidth; w.textContent = WHISPERS[wi++ % WHISPERS.length]; w.classList.add('show'); if (Math.random() < 0.5) flicker(3); }, 3600);
  const c = await Promise.race([holdBtns([['📱', 'Telefonu eşiğe bırak', 'A'], ['🚪', 'Kapıyı kapat', 'B'], ['🔓', 'Kapıyı aç', 'C']]), zero]);
  alive = false; clearInterval(whIv); $('mnCap').style.bottom = ''; $('mnBtns').innerHTML = ''; $('mnBtns').classList.remove('holds'); $('mnWh').textContent = ''; $('mnBat').classList.remove('low');
  if (drained) { $('mnDark').style.opacity = 1; stopAmbience(); $('mnCap').textContent = 'Pil bitti. Ekran karardı.'; await sleep(2200); $('mnCap').textContent = 'Karanlıkta soğuk bir el, telefonu elinden aldı.'; await sleep(2600); }
  const e = store.get('endings', []); if (!e.includes(c)) { e.push(c); store.set('endings', e); }
  store.set('stage', 'ch2done');
  if (c === 'A') {
    $('mnCap').textContent = 'Telefonu taşın üstüne bıraktın. Ekran kendiliğinden karardı.'; await sleep(2600);
    $('mnBg').style.backgroundImage = 'none'; $('mnDark').style.opacity = 1; mnTop(''); $('mnCap').textContent = '3 gün sonra'; await sleep(2200);
    sfx('notif'); $('mnCap').innerHTML = '<span style="color:#30d158">🎤 Annem — sesli mesaj</span>'; await sleep(900);
    await playAudio('media/audio/anne_bulundu.mp3', ['Deniz bulundu! Kızım bulundu!', 'Yayla yolunun kenarında… İyi, çok şükür iyi.', 'Ama hiçbir şey hatırlamıyor.', 'Sadece bir şey diyor… telefonumu biri geri koydu, diyor.'], $('mnCap'));
    await sleep(800);
  } else if (c === 'B') {
    sfx('thunder'); vib([600]); $('mnCap').textContent = 'Taşı var gücünle ittin. Kapı kapandı.'; await flicker(10);
    $('mnDark').style.opacity = 1; await sleep(1500); $('mnCap').textContent = 'İçeriden kimse ses vermedi.'; await sleep(2500);
  } else {
    $('mnCap').textContent = 'Kapıyı sonuna kadar açtın.'; await sleep(1500);
    $('mnDark').style.opacity = 1; stopAmbience(); await sleep(1000);
    await playAudio('media/audio/ses_tesekkur.mp3', ['"Teşekkürler…"', '"Artık sıra sende."'], $('mnCap'));
    mine(false); await jumpScare(); mine(true);
  }
  mine(false); endCard('S' + c);
}
const endHead = () => `Sonlar: ${store.get('endings', []).length}/3`;
Object.assign(ENDS, {
  SA: () => ({ ch: 'SON 1 · GERİ KOYDUN', title: 'KARAGÖL', next: endHead(), soon: store.get('endings', []).length < 3 ? 'Diğer sonları da gör' : 'Tüm sonları gördün', btn: store.get('endings', []).length < 3 ? 'BAŞKA BİR SON' : 'TELEFONA DÖN',
    text: 'Deniz o sabah yayla yolunun kenarında bulundu.<br>Hiçbir şey hatırlamıyor.<br>Telefon hâlâ 317\'nin eşiğinde duruyor.<br><br><span style="color:#8a1c1c">Bazı geceler, 03:17\'de titriyor.</span>' }),
  SB: () => ({ ch: 'SON 2 · SESSİZLİK', title: 'KARAGÖL', next: endHead(), soon: store.get('endings', []).length < 3 ? 'Diğer sonları da gör' : 'Tüm sonları gördün', btn: store.get('endings', []).length < 3 ? 'BAŞKA BİR SON' : 'TELEFONA DÖN',
    text: 'Kapı 85 yıl sonra yeniden kapandı.<br>Deniz geri dönmedi.<br>Hasan Aydın o gece uykusunda öldü.<br><br><span style="color:#8a1c1c">Yüzünde bir gülümseme vardı.</span>' }),
  SC: () => ({ ch: 'SON 3 · TEŞEKKÜRLER', title: 'KARAGÖL', next: endHead(), soon: store.get('endings', []).length < 3 ? 'Diğer sonları da gör' : 'Tüm sonları gördün', btn: store.get('endings', []).length < 3 ? 'BAŞKA BİR SON' : 'TELEFONA DÖN',
    text: 'Ertesi sabah Karagöl yolunda, çamurun içinde bir telefon bulundu.<br>Ekranında yeni bir kilit vardı.<br><br><span style="color:#8a1c1c">Arka planda senin fotoğrafın.</span>' }),
});
const CH2_PAGES = {
  'Harita': () => {
    const door = store.get('c2door', false), called = store.get('c2called', false);
    sheet('Harita', `<div class="big">📍</div><p class="center"><b>Eski Bakır Ocağı</b><br><span class="mut">Karagöl yaylası · 1.920 m</span></p>
      <button class="row-btn" id="hMap">${row('🗺️ Dedemin haritası', 'aç ›')}</button>${row('Kaydedilmiş rota', 'Deniz · 5 Kasım 03:05')}${row('Rota durumu', 'YARIDA KESİLDİ', 'red')}
      <button class="rp-btn" id="hGo" style="display:block;margin:22px auto 0">${door ? '▶ 317\'ye dön' : '▶ Rotayı izle'}</button>${called ? '' : '<p class="mut center" style="margin-top:10px">Biri seni arıyor olabilir.</p>'}`);
    $('hMap').onclick = () => { sfx('tap'); viewImage('harita'); };
    $('hGo').onclick = () => { sfx('tap'); if (!called) { toast('Rota kilitli. Önce dedenin aramasını bekle.'); return; } if (door) { closeSheet(); finalChoice(); } else enterMine(); };
  },
};

window.__kt = { startCh2, dedeCall, enterMine, finalChoice, MN, S, unlock, incomingCall, jumpScare, view, openApp, playFootage, endCard, startCh1, store, CLIPS, finale };
