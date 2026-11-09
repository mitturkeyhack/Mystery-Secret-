// ===== KAYIP TELEFON — ses tasarımı (WebAudio, dosyasız) =====
let ac = null, master, amb, noiseBuf, brownBuf;
const loops = {};

export function initAudio() {
  if (!ac) {
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = 0.9;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -12;
    master.connect(comp); comp.connect(ac.destination);
    amb = ac.createGain(); amb.gain.value = 0; amb.connect(master);
    const len = ac.sampleRate * 3;
    noiseBuf = ac.createBuffer(1, len, ac.sampleRate); brownBuf = ac.createBuffer(1, len, ac.sampleRate);
    const n = noiseBuf.getChannelData(0), b = brownBuf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; n[i] = w; last = (last + 0.02 * w) / 1.02; b[i] = last * 3.5; }
  }
  if (ac.state === 'suspended') ac.resume().catch(() => {});
}
const now = () => ac.currentTime;
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function osc(type, f, t, d, peak, f2, dest = master, a = 0.005) {
  const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  env(g, t, a, peak, d); o.connect(g); g.connect(dest); o.start(t); o.stop(t + a + d + 0.05); return o;
}
function noise(t, d, peak, type = 'bandpass', f = 1000, f2, q = 1, dest = master, a = 0.005, buf) {
  const s = ac.createBufferSource(); s.buffer = buf || noiseBuf;
  const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
  const g = ac.createGain(); env(g, t, a, peak, d); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + a + d + 0.05);
}
function loopNoise(name, { type = 'lowpass', f = 800, q = 0.7, vol = 0.3, buf, lfo = 0, lfoF = 0.1 }) {
  if (!ac || loops[name]) return;
  const s = ac.createBufferSource(); s.buffer = buf || noiseBuf; s.loop = true;
  const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = ac.createGain(); g.gain.value = 0;
  s.connect(fl); fl.connect(g); g.connect(amb); s.start();
  g.gain.linearRampToValueAtTime(vol, now() + 2);
  let lo = null;
  if (lfo) { lo = ac.createOscillator(); const lg = ac.createGain(); lo.frequency.value = lfoF; lg.gain.value = lfo; lo.connect(lg); lg.connect(fl.frequency); lo.start(); }
  loops[name] = { s, g, lo };
}
function stopLoop(name, fade = 1.5) {
  const l = loops[name]; if (!l) return; delete loops[name];
  l.g.gain.cancelScheduledValues(now()); l.g.gain.setValueAtTime(l.g.gain.value, now()); l.g.gain.linearRampToValueAtTime(0, now() + fade);
  setTimeout(() => { try { l.s.stop(); l.lo && l.lo.stop(); } catch (e) {} }, fade * 1000 + 100);
}

// ---------- ortam ----------
export function ambience(kind) {
  if (!ac) return;
  amb.gain.cancelScheduledValues(now()); amb.gain.linearRampToValueAtTime(1, now() + 1.5);
  for (const k of Object.keys(loops)) stopLoop(k);
  if (kind === 'rain') {
    loopNoise('rain', { type: 'highpass', f: 1200, q: 0.3, vol: 0.16 });
    loopNoise('rainLow', { type: 'lowpass', f: 500, q: 0.5, vol: 0.22, buf: brownBuf });
    loopNoise('wind', { type: 'bandpass', f: 400, q: 1.5, vol: 0.12, buf: brownBuf, lfo: 250, lfoF: 0.08 });
  } else if (kind === 'room') {
    loopNoise('rainLow', { type: 'lowpass', f: 300, q: 0.5, vol: 0.12, buf: brownBuf });
    loopNoise('hum', { type: 'bandpass', f: 120, q: 8, vol: 0.05 });
  } else if (kind === 'static') {
    loopNoise('static', { type: 'bandpass', f: 2500, q: 0.6, vol: 0.12, lfo: 1500, lfoF: 0.7 });
  }
}
export function stopAmbience() { for (const k of Object.keys(loops)) stopLoop(k); }

// ---------- efektler ----------
export function sfx(name) {
  if (!ac) return;
  const t = now();
  switch (name) {
    case 'tap': osc('sine', 1400, t, 0.03, 0.05); break;
    case 'key': noise(t, 0.04, 0.12, 'highpass', 3000); osc('sine', 900, t, 0.04, 0.05); break;
    case 'error': osc('square', 160, t, 0.12, 0.08); osc('square', 120, t + 0.13, 0.18, 0.08); break;
    case 'buzz': for (let i = 0; i < 3; i++) { osc('square', 170, t + i * 0.09, 0.06, 0.06); noise(t + i * 0.09, 0.06, 0.08, 'lowpass', 300); } break;
    case 'vibrate': for (let i = 0; i < 2; i++) { osc('sawtooth', 140, t + i * 0.55, 0.38, 0.09, null, master, 0.02); noise(t + i * 0.55, 0.38, 0.1, 'lowpass', 250, null, 1, master, 0.02); } break;
    case 'notif': osc('sine', 1318, t, 0.12, 0.08); osc('sine', 1760, t + 0.1, 0.25, 0.07); break;
    case 'darknotif': osc('sine', 330, t, 0.6, 0.12, 311); osc('sine', 466, t + 0.02, 0.6, 0.06, 440); break;
    case 'unlock': osc('sine', 880, t, 0.08, 0.06); osc('sine', 1320, t + 0.05, 0.12, 0.05); break;
    case 'whoosh': noise(t, 0.5, 0.35, 'bandpass', 300, 3000, 1.2); break;
    case 'flip': noise(t, 0.35, 0.3, 'bandpass', 600, 1800, 2); osc('sine', 180, t + 0.3, 0.1, 0.15, 90); break;
    case 'pickup': noise(t, 0.4, 0.4, 'lowpass', 800, 200, 1, master, 0.05, brownBuf); noise(t + 0.15, 0.3, 0.2, 'bandpass', 2000, 800, 2); break;
    case 'glitch': for (let i = 0; i < 6; i++) { const tt = t + i * 0.05 + Math.random() * 0.03; noise(tt, 0.04, 0.4, 'bandpass', 500 + Math.random() * 4000, null, 3); osc('square', 80 + Math.random() * 900, tt, 0.04, 0.08); } break;
    case 'heart': for (const o of [0, 0.22]) { osc('sine', 60, t + o, 0.18, 0.5, 40); noise(t + o, 0.08, 0.15, 'lowpass', 120); } break;
    case 'sting': // ani korkutma
      noise(t, 1.4, 0.9, 'lowpass', 6000, 300, 0.7, master, 0.003);
      [233, 247, 349, 370, 523, 554].forEach((f, i) => osc('sawtooth', f, t, 1.3, 0.09, f * 0.97, master, 0.003));
      osc('sine', 55, t, 1.5, 0.7, 30);
      break;
    case 'thunder': noise(t, 2.5, 0.6, 'lowpass', 900, 60, 0.6, master, 0.02, brownBuf); noise(t + 0.05, 0.3, 0.3, 'lowpass', 3000, 200); break;
    case 'static': noise(t, 0.6, 0.25, 'bandpass', 2500, 1800, 0.6); break;
  }
}

let ringTimer = null;
export function ringtone(on) {
  if (!ac) return;
  clearInterval(ringTimer); ringTimer = null;
  if (!on) return;
  const ring = () => { const t = now(); for (let i = 0; i < 2; i++) { osc('sine', 659, t + i * 0.2, 0.17, 0.12); osc('sine', 831, t + i * 0.2, 0.17, 0.08); } sfx('vibrate'); };
  ring(); ringTimer = setInterval(ring, 2000);
}

// Fısıltı: telefonun Türkçe konuşma motoru (varsa) + cızırtı
export function whisper(text) {
  if (!ac) return;
  sfx('static');
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR'; u.rate = 0.55; u.pitch = 0.1; u.volume = 0.55;
    const v = speechSynthesis.getVoices().find(v => /tr/i.test(v.lang)); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) {}
}
