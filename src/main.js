// ===== KAYIP TELEFON — Bölüm 0: Kilit =====
import { initAudio, sfx, ambience, stopAmbience, ringtone, whisper } from './audio.js';

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem('kt_' + k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('kt_' + k, JSON.stringify(v)); } catch (e) {} } };
const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

const PIN = '070541';
const S = { attempts: 0, called: false, lockUntil: 0, entry: '', view: 'lock', bat: 31, mins: 3 * 60 + 17, unlocked: false, flipped: false, sawVideo: false };

// ---------- medya (varsa gerçek, yoksa yer tutucu) ----------
const MEDIA = { wallpaper: 'media/wallpaper.jpg', oldphoto: 'media/oldphoto.jpg', intro: 'media/intro.mp4', scare: 'media/scare.jpg', village: 'media/village.jpg', notebook: 'media/notebook.jpg', mine: 'media/mine.jpg', forest: 'media/forest.mp4' };
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
  if (resume && store.get('stage', null)) { S.unlocked = true; S.sawVideo = store.get('stage') === 'ch0done'; view('home'); buildHome(); ambience('room'); return; }
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
  const g = $('apps'); g.innerHTML = ''; APPS.forEach(a => g.appendChild(appEl(a)));
  const d = $('dock'); d.innerHTML = ''; DOCK.forEach(a => d.appendChild(appEl(a)));
}

// ---------- uygulamalar (Bölüm 0'da sınırlı ama hikâyeye bağlı) ----------
function sheet(title, html) { $('shTitle').textContent = title; $('shBody').innerHTML = html; $('sheet').classList.add('on'); S.view = 'app'; }
function closeSheet() { $('sheet').classList.remove('on'); S.view = 'home'; }
$('bShClose').onclick = () => { sfx('tap'); closeSheet(); };
const row = (a, b = '', cls = '') => `<div class="row ${cls}"><span>${a}</span><small>${b}</small></div>`;
const LOCKED = (t) => `<div class="lock">🔒</div><p class="center">${t}</p><p class="center mut" style="margin-top:8px">Bölüm 1'de açılacak.</p>`;
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
function openApp(n) { (APP_PAGES[n] || (() => toast(n)))(); }

// galeri
function openGallery() {
  const isNew = !S.sawVideo;
  sheet('Galeri', `<div class="sec">SON EKLENENLER</div><div class="grid">
    <button data-v="forest" class="${isNew ? 'new' : ''}" style="background-image:url(${MEDIA.mine})"><em>▶ 0:20</em></button>
    <button data-i="village" style="background-image:url(${MEDIA.village})"></button>
    <button data-i="notebook" style="background-image:url(${MEDIA.notebook})"></button>
    <button data-i="wallpaper" style="background-image:url(${MEDIA.wallpaper})"></button>
    <button data-i="oldphoto" style="background-image:url(${MEDIA.oldphoto})"></button>
    <button class="broken" data-x>⚠︎</button>
  </div><p class="mut center" style="margin-top:14px">6 öğe · 214 öğe kilitli albümde</p>`);
  badges.Galeri = 0;
  $('shBody').querySelectorAll('[data-i]').forEach(b => b.onclick = () => { sfx('tap'); viewImage(b.dataset.i); });
  $('shBody').querySelector('[data-x]').onclick = () => { sfx('static'); toast('Dosya okunamıyor: IMG_0317.jpg'); };
  $('shBody').querySelector('[data-v]').onclick = () => { sfx('tap'); playFootage(); };
}
const CAPS = { village: 'Dedemin köyü 🌿', notebook: 'Dedemin defteri. 1941.', wallpaper: 'Dedemle 🤍', oldphoto: 'Dedem, 20 yaşında.' };
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
function endCard() {
  const e = $('endcard');
  $('ecText').innerHTML = 'Telefonun sahibi <b>Deniz Aydın</b>.<br>5 Kasım gecesi, dedesinin 1941\'de kapanan bakır ocağına girdi.<br>O geceden beri biri bu telefonu izliyor.<br><br><span style="color:#8a1c1c">Ve artık seni de biliyor.</span>';
  e.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add('show')));
  ambience('rain'); sfx('thunder');
}
$('bEcBack').onclick = () => { sfx('tap'); const e = $('endcard'); e.classList.remove('show'); setTimeout(() => e.classList.remove('on'), 600); ambience('room'); };

window.__kt = { S, unlock, incomingCall, jumpScare, view, openApp, playFootage, endCard };
