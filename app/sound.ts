'use client';

/*
 * Tiny sound engine: every sound is synthesized with the Web Audio API (no audio files).
 * Off by default. Turning it on is remembered in localStorage.
 */
type Sfx = 'click' | 'lock' | 'access' | 'alarm' | 'zap' | 'win' | 'fail' | 'hover';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let hum: { o1: OscillatorNode; o2: OscillatorNode; g: GainNode } | null = null;
let enabled = false;
const listeners = new Set<(on: boolean) => void>();

function ac() {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, slideTo?: number, delay = 0) {
  const c = ac(); if (!c || !master) return;
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur: number, vol = 0.12, hp = 1200) {
  const c = ac(); if (!c || !master) return;
  const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(master); s.start();
}

export function play(s: Sfx) {
  if (!enabled) return;
  switch (s) {
    case 'hover': tone(1800, 0.04, 'sine', 0.03); break;
    case 'click': tone(1200, 0.05, 'triangle', 0.08); tone(2400, 0.03, 'sine', 0.04, undefined, 0.01); break;
    case 'lock': tone(420, 0.08, 'square', 0.05); tone(840, 0.14, 'triangle', 0.08, undefined, 0.06); break;
    case 'access': tone(110, 0.9, 'sine', 0.25, 55); tone(660, 0.35, 'triangle', 0.08, 990, 0.15); tone(990, 0.5, 'sine', 0.06, undefined, 0.35); break;
    case 'alarm': [0, 0.28, 0.56].forEach(d => tone(740, 0.2, 'sawtooth', 0.06, 520, d)); break;
    case 'zap': noise(0.18, 0.1, 2400); tone(1600, 0.18, 'sawtooth', 0.05, 200); break;
    case 'win': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.4, 'triangle', 0.09, undefined, i * 0.11)); break;
    case 'fail': tone(220, 0.6, 'sawtooth', 0.08, 90); break;
  }
}

function startHum() {
  const c = ac(); if (!c || !master || hum) return;
  const o1 = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
  o1.type = 'sawtooth'; o1.frequency.value = 55; o2.type = 'sine'; o2.frequency.value = 82.5;
  f.type = 'lowpass'; f.frequency.value = 180; g.gain.value = 0.0001;
  o1.connect(f); o2.connect(f); f.connect(g); g.connect(master); o1.start(); o2.start();
  g.gain.exponentialRampToValueAtTime(0.035, c.currentTime + 1.5);
  hum = { o1, o2, g };
}
function stopHum() {
  if (!hum || !ctx) return; const h = hum; hum = null;
  h.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
  setTimeout(() => { try { h.o1.stop(); h.o2.stop(); } catch { /* already stopped */ } }, 700);
}

export function setSound(on: boolean) {
  enabled = on;
  try { localStorage.setItem('sm-sound', on ? '1' : '0'); } catch { /* storage unavailable */ }
  if (on) { startHum(); play('lock'); } else stopHum();
  listeners.forEach(l => l(on));
}
export function soundOn() { return enabled; }
export function onSound(l: (on: boolean) => void) { listeners.add(l); return () => { listeners.delete(l); }; }
/* Browsers only allow audio after a user gesture, so a saved "on" resumes on the first click. */
export function restoreSound() {
  let saved = false; try { saved = localStorage.getItem('sm-sound') === '1'; } catch { /* */ }
  if (!saved) return;
  const go = () => { setSound(true); removeEventListener('pointerdown', go); removeEventListener('keydown', go); };
  addEventListener('pointerdown', go, { once: true }); addEventListener('keydown', go, { once: true });
}
