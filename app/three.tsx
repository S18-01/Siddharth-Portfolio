'use client';

/*
 * Lightweight 3D layer for the portfolio (no WebGL libraries; canvas 2D + CSS 3D).
 * Every scene pauses when it is off screen, follows the active theme's accent
 * colour, and stays still for visitors who prefer reduced motion.
 */
import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type Palette = { acc: string; accRgb: string; ink: string; dim: string; line: string; danger: string; ok: string; card: string };

function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string, f: string) => s.getPropertyValue(n).trim() || f;
  return {
    acc: v('--accent', '#8fb0ff'),
    accRgb: v('--acc-rgb', '143,176,255'),
    ink: v('--ink', '#e6eefc'),
    dim: v('--dim', '#8ea3c4'),
    line: v('--line2', 'rgba(150,170,210,.25)'),
    danger: '#f87171',
    ok: '#4ade80',
    card: v('--card', '#0f1626'),
  };
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Shared canvas loop: resizes for DPR, pauses off-screen, refreshes theme colours. */
function useCanvasLoop(
  ref: React.RefObject<HTMLCanvasElement | null>,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, pal: Palette) => void,
) {
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    let w = 0, h = 0, raf = 0, last = performance.now(), visible = false, pal = readPalette(), palAt = 0;
    const size = () => {
      const r = window.devicePixelRatio || 1;
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.round(w * r); c.height = Math.round(h * r);
      ctx.setTransform(r, 0, 0, r, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(c);
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '80px' }); io.observe(c);
    const loop = (t: number) => {
      const dt = Math.min(48, t - last); last = t;
      if (visible && !document.hidden) {
        if (t - palAt > 800) { pal = readPalette(); palAt = t; }
        ctx.clearRect(0, 0, w, h);
        drawRef.current(ctx, w, h, dt, pal);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [ref]);
}

/* Drag helper: horizontal drag adds angular velocity, page still scrolls vertically on touch. */
function useSpin(initial: number, idle: number) {
  const st = useRef({ a: initial, v: idle, drag: false, lx: 0, lt: 0 });
  const handlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => { const s = st.current; s.drag = true; s.lx = e.clientX; s.lt = performance.now(); e.currentTarget.setPointerCapture?.(e.pointerId); },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      const s = st.current; if (!s.drag) return;
      const now = performance.now(), dx = e.clientX - s.lx;
      s.a += dx * 0.008; s.v = (dx * 0.008) / Math.max(1, now - s.lt); s.lx = e.clientX; s.lt = now;
    },
    onPointerUp: () => { st.current.drag = false; },
    onPointerCancel: () => { st.current.drag = false; },
  };
  const step = (dt: number) => {
    const s = st.current; if (s.drag) return s.a;
    const target = reduced() ? 0 : idle;
    s.v += (target - s.v) * Math.min(1, dt / 900);
    s.a += s.v * dt;
    return s.a;
  };
  return { handlers, step };
}

/* ---------------- 1. Globe of reach ---------------- */
const hubs: [number, number, string][] = [
  [38.99, -76.94, 'Maryland'], [37.39, -122.08, 'Bay Area'], [47.61, -122.33, 'Seattle'], [40.71, -74.0, 'New York'],
  [30.27, -97.74, 'Austin'], [42.36, -71.06, 'Boston'], [38.9, -77.04, 'Washington DC'], [41.88, -87.63, 'Chicago'], [33.75, -84.39, 'Atlanta'],
];
// simplified continent outlines (lon, lat); dots are sampled inside them so the globe reads as Earth without map files
const continents: [number, number][][] = [
  [[-168,66],[-140,70],[-95,72],[-80,63],[-62,58],[-55,48],[-66,44],[-75,35],[-81,25],[-97,26],[-105,20],[-95,16],[-83,9],[-79,8],[-92,15],[-106,23],[-115,31],[-124,40],[-125,49],[-135,58],[-152,59],[-165,62]],
  [[-50,60],[-20,70],[-25,82],[-60,82],[-70,76]],
  [[-79,8],[-60,10],[-50,0],[-35,-6],[-40,-22],[-58,-38],[-68,-55],[-75,-48],[-71,-18],[-81,-5]],
  [[-10,36],[0,43],[-5,48],[5,53],[8,57],[5,62],[15,69],[30,71],[40,66],[40,45],[28,41],[20,40],[12,44],[3,41]],
  [[-17,15],[-10,30],[10,37],[32,31],[43,12],[51,11],[40,-15],[32,-29],[20,-35],[12,-17],[9,4],[-8,5]],
  [[40,45],[40,66],[70,73],[110,77],[140,72],[170,68],[160,60],[140,52],[130,42],[122,30],[110,20],[105,10],[100,2],[95,15],[80,8],[72,20],[57,25],[50,30],[36,36]],
  [[114,-22],[130,-12],[142,-11],[153,-27],[146,-39],[135,-35],[115,-34]],
  [[-8,50],[2,51],[-3,58],[-6,56]],
  [[130,31],[141,36],[145,44],[140,41],[132,34]],
];
const inPoly = (lo: number, la: number, poly: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > la) !== (yj > la) && lo < ((xj - xi) * (la - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
export const landDots: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let la = -56; la <= 82; la += 2.4) for (let lo = -180; lo < 180; lo += 2.4 / Math.max(0.35, Math.cos((la * Math.PI) / 180))) {
    if (continents.some(c => inPoly(lo, la, c))) out.push([la, lo]);
  }
  return out;
})();

export function Globe3D() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { handlers, step } = useSpin(1.42, 0.00012);
  useCanvasLoop(ref, (x, w, h, dt, p) => {
    const rot = step(dt), tilt = 0.55;
    const R = Math.min(w, h) * 0.44, cx = w / 2, cy = h / 2;
    const P = (la: number, lo: number, r = R) => {
      const phi = (la * Math.PI) / 180, lam = (lo * Math.PI) / 180 + rot;
      const X = Math.cos(phi) * Math.sin(lam), Y = Math.sin(phi), Z = Math.cos(phi) * Math.cos(lam);
      const y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt);
      return [cx + X * r, cy - y2 * r, z2] as const;
    };
    // atmosphere
    const g = x.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.25);
    g.addColorStop(0, `rgba(${p.accRgb},.18)`); g.addColorStop(1, `rgba(${p.accRgb},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R * 1.25, 0, 7); x.fill();
    const body = x.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    body.addColorStop(0, `rgba(${p.accRgb},.16)`); body.addColorStop(1, 'rgba(4,8,18,.85)');
    x.fillStyle = body; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
    x.strokeStyle = `rgba(${p.accRgb},.35)`; x.lineWidth = 1; x.stroke();
    // graticule
    x.lineWidth = 0.6; x.strokeStyle = `rgba(${p.accRgb},.13)`;
    for (let la = -60; la <= 60; la += 30) { x.beginPath(); let on = false; for (let lo = -180; lo <= 180; lo += 5) { const q = P(la, lo); if (q[2] < 0) { on = false; continue; } if (on) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); on = true; } x.stroke(); }
    for (let lo = -180; lo < 180; lo += 30) { x.beginPath(); let on = false; for (let la = -85; la <= 85; la += 5) { const q = P(la, lo); if (q[2] < 0) { on = false; continue; } if (on) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); on = true; } x.stroke(); }
    // land dots
    for (const [la, lo] of landDots) { const q = P(la, lo); if (q[2] < 0.02) continue; x.fillStyle = `rgba(${p.accRgb},${(0.22 + q[2] * 0.5).toFixed(2)})`; x.fillRect(q[0] - 0.9, q[1] - 0.9, 1.8, 1.8); }
    // arcs from Maryland
    const t = performance.now() / 1000;
    const home = hubs[0];
    hubs.slice(1).forEach(([la, lo], i) => {
      const steps = 40; let prevVis = false; x.beginPath();
      for (let k = 0; k <= steps; k++) {
        const f = k / steps, lift = 1 + Math.sin(f * Math.PI) * 0.12;
        const q = P(home[0] + (la - home[0]) * f, home[1] + (lo - home[1]) * f, R * lift);
        if (q[2] < 0) { prevVis = false; continue; }
        if (prevVis) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); prevVis = true;
      }
      x.strokeStyle = `rgba(${p.accRgb},.55)`; x.lineWidth = 1.1; x.stroke();
      const f = ((t * 0.35 + i * 0.17) % 1), lift = 1 + Math.sin(f * Math.PI) * 0.12;
      const q = P(home[0] + (la - home[0]) * f, home[1] + (lo - home[1]) * f, R * lift);
      if (q[2] > 0) { x.fillStyle = p.acc; x.beginPath(); x.arc(q[0], q[1], 2, 0, 7); x.fill(); }
    });
    // pins + labels
    x.font = '600 11px Inter, sans-serif';
    hubs.forEach(([la, lo, name], i) => {
      const q = P(la, lo); if (q[2] < 0.05) return;
      const home = i === 0;
      if (home) { const pr = 6 + ((t * 1.2) % 1) * 12; x.strokeStyle = `rgba(74,222,128,${(1 - ((t * 1.2) % 1)) * 0.7})`; x.lineWidth = 1.2; x.beginPath(); x.arc(q[0], q[1], pr, 0, 7); x.stroke(); }
      x.fillStyle = home ? p.ok : p.acc; x.beginPath(); x.arc(q[0], q[1], home ? 4 : 2.6, 0, 7); x.fill();
      if (home || ['Seattle', 'Bay Area', 'Austin'].includes(name)) { x.fillStyle = home ? p.ink : p.dim; x.fillText(name, q[0] + 7, q[1] - 6); }
    });
  });
  return <canvas ref={ref} className="g3d-canvas globe" {...handlers} aria-label="Globe showing Maryland and US tech hubs I can relocate to" role="img" />;
}

/* ---------------- 3. Skills orbit ---------------- */
type OrbitTool = { name: string; dom: string };
export function SkillOrbit({ tools, active }: { tools: OrbitTool[]; active: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active); activeRef.current = active;
  const glow = useRef<Record<string, number>>({});
  const { handlers, step } = useSpin(0, 0.00022);
  useCanvasLoop(ref, (x, w, h, dt, p) => {
    const a = step(dt), cx = w / 2, cy = h / 2, narrow = w < 640;
    const rings = narrow ? [w * 0.22, w * 0.34, w * 0.45] : [Math.min(w * 0.2, 150), Math.min(w * 0.33, 250), Math.min(w * 0.46, 350)];
    const squash = narrow ? 0.62 : 0.34;
    const list = narrow ? tools.filter((_, i) => i % 2 === 0) : tools;
    x.lineWidth = 0.8;
    rings.forEach(R => { x.strokeStyle = `rgba(${p.accRgb},.16)`; x.beginPath(); x.ellipse(cx, cy, R, R * squash, 0, 0, 7); x.stroke(); });
    const pts = list.map((t, i) => {
      const ring = i % 3, R = rings[ring], n = list.filter((_, j) => j % 3 === ring).length, k = Math.floor(i / 3);
      const th = a * (ring === 1 ? -1 : 1) * (1 - ring * 0.18) + (k / n) * Math.PI * 2 + ring * 0.6;
      return { t, X: cx + Math.cos(th) * R, Y: cy + Math.sin(th) * R * squash, z: Math.sin(th) };
    }).sort((p1, p2) => p1.z - p2.z);
    const sel = activeRef.current;
    const drawPill = (q: typeof pts[number]) => {
      const on = sel === 'All' || q.t.dom === sel;
      const g0 = glow.current[q.t.name] ?? 0, g1 = g0 + ((on && sel !== 'All' ? 1 : 0) - g0) * Math.min(1, dt / 180); glow.current[q.t.name] = g1;
      const s = 0.78 + 0.28 * (q.z + 1) / 2, alpha = on ? 0.45 + 0.55 * (q.z + 1) / 2 : 0.18;
      x.font = `600 ${Math.round(12.5 * s)}px Inter, sans-serif`;
      const tw = x.measureText(q.t.name).width + 18 * s, th = 24 * s;
      x.globalAlpha = alpha;
      x.fillStyle = p.card; x.strokeStyle = g1 > 0.05 ? `rgba(${p.accRgb},${0.3 + g1 * 0.7})` : p.line; x.lineWidth = 1 + g1;
      if (g1 > 0.05) { x.shadowColor = `rgba(${p.accRgb},${g1 * 0.8})`; x.shadowBlur = 14 * g1; }
      x.beginPath(); x.roundRect(q.X - tw / 2, q.Y - th / 2, tw, th, th / 2); x.fill(); x.stroke();
      x.shadowBlur = 0;
      x.fillStyle = g1 > 0.05 ? p.ink : p.dim; x.fillText(q.t.name, q.X - tw / 2 + 9 * s, q.Y + 4.3 * s);
      x.globalAlpha = 1;
    };
    pts.filter(q => q.z < 0).forEach(drawPill);
    // shield core
    const S = Math.min(46, w * 0.09);
    const cg = x.createRadialGradient(cx, cy, 0, cx, cy, S * 2.4); cg.addColorStop(0, `rgba(${p.accRgb},.35)`); cg.addColorStop(1, `rgba(${p.accRgb},0)`);
    x.fillStyle = cg; x.beginPath(); x.arc(cx, cy, S * 2.4, 0, 7); x.fill();
    x.beginPath(); x.moveTo(cx, cy - S); x.lineTo(cx + S * 0.8, cy - S * 0.62); x.lineTo(cx + S * 0.8, cy + S * 0.05);
    x.quadraticCurveTo(cx + S * 0.72, cy + S * 0.72, cx, cy + S * 1.05); x.quadraticCurveTo(cx - S * 0.72, cy + S * 0.72, cx - S * 0.8, cy + S * 0.05); x.lineTo(cx - S * 0.8, cy - S * 0.62); x.closePath();
    const sg = x.createLinearGradient(cx, cy - S, cx, cy + S); sg.addColorStop(0, `rgba(${p.accRgb},.55)`); sg.addColorStop(1, `rgba(${p.accRgb},.12)`);
    x.fillStyle = sg; x.fill(); x.strokeStyle = p.acc; x.lineWidth = 1.5; x.stroke();
    x.strokeStyle = p.ink; x.lineWidth = 2.2; x.beginPath(); x.moveTo(cx - S * 0.3, cy + S * 0.02); x.lineTo(cx - S * 0.05, cy + S * 0.28); x.lineTo(cx + S * 0.36, cy - S * 0.22); x.stroke();
    pts.filter(q => q.z >= 0).forEach(drawPill);
  });
  return <canvas ref={ref} className="g3d-canvas orbit" {...handlers} aria-label="Orbit of the tools I use; drag to spin" role="img" />;
}

/* ---------------- 4. Experience fly-through ---------------- */
export function JobGates({ jobs, sectionId }: { jobs: { role: string; org: string; date: string }[]; sectionId: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const prog = useRef({ cur: 0, target: 0 });
  useEffect(() => {
    const on = () => {
      const sec = document.getElementById(sectionId); if (!sec) return;
      const r = sec.getBoundingClientRect(), vh = window.innerHeight;
      const t = (vh * 0.75 - r.top) / Math.max(1, r.height - vh * 0.25);
      prog.current.target = Math.max(0, Math.min(1, t));
    };
    on(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [sectionId]);
  useCanvasLoop(ref, (x, w, h, dt, p) => {
    const pr = prog.current; pr.cur += (pr.target - pr.cur) * Math.min(1, dt / 220);
    const depth = pr.cur * (jobs.length - 1);
    const cx = w / 2, cy = h * 0.5;
    // floor grid in perspective
    x.strokeStyle = `rgba(${p.accRgb},.14)`; x.lineWidth = 0.7;
    for (let i = -8; i <= 8; i++) { x.beginPath(); x.moveTo(cx + i * 6, cy + 4); x.lineTo(cx + i * w * 0.16, h); x.stroke(); }
    const off = (depth % 1);
    for (let k = 0; k < 12; k++) { const z = k + 1 - off; const y = cy + 4 + (h - cy) / (z * 0.55 + 0.4) * 0.4; if (y > h) continue; x.globalAlpha = Math.min(1, 1.6 / z); x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
    x.globalAlpha = 1;
    for (let i = jobs.length - 1; i >= 0; i--) {
      const z = i - depth + 1; if (z <= 0.45) continue;
      const sc = 1 / z, gw = Math.min(w * 0.6, 420) * sc, gh = h * 0.62 * sc;
      const alpha = Math.min(1, sc * 0.95) * (z < 0.92 ? Math.max(0, (z - 0.45) / 0.47) : 1);
      x.globalAlpha = Math.max(0, alpha);
      const gy = cy - gh * 0.55;
      const ga = x.globalAlpha; x.globalAlpha = z < 0.92 ? ga : 1;
      x.fillStyle = p.card; x.beginPath(); x.roundRect(cx - gw / 2, gy, gw, gh, 14 * sc); x.fill();
      x.globalAlpha = ga;
      x.fillStyle = `rgba(${p.accRgb},${Math.min(0.12, 0.05 * sc)})`; x.fill();
      x.strokeStyle = p.acc; x.lineWidth = Math.max(0.6, 1.6 * Math.min(sc, 1.4));
      x.shadowColor = `rgba(${p.accRgb},.6)`; x.shadowBlur = 12 * Math.min(sc, 1.2); x.stroke(); x.shadowBlur = 0;
      if (z > 0.7 && z < 1.75) {
        const fs = Math.min(1.25, sc);
        x.textAlign = 'center';
        x.fillStyle = p.dim; x.font = `600 ${Math.round(10.5 * fs)}px "JetBrains Mono", monospace`; x.fillText(jobs[i].date.toUpperCase(), cx, gy + gh * 0.34);
        x.fillStyle = p.ink; x.font = `800 ${Math.round(19 * fs)}px Archivo, sans-serif`; x.fillText(jobs[i].role, cx, gy + gh * 0.52);
        x.fillStyle = p.acc; x.font = `600 ${Math.round(13 * fs)}px Inter, sans-serif`; x.fillText(jobs[i].org, cx, gy + gh * 0.66);
        x.textAlign = 'left';
      }
    }
    x.globalAlpha = 1;
    // progress rail
    const rw = Math.min(260, w * 0.5), rx = cx - rw / 2, ry = h - 16;
    x.fillStyle = `rgba(${p.accRgb},.18)`; x.fillRect(rx, ry, rw, 2);
    x.fillStyle = p.acc; x.fillRect(rx, ry, rw * pr.cur, 2);
    jobs.forEach((_, i) => { const dx = rx + rw * (i / (jobs.length - 1)); x.fillStyle = depth >= i - 0.05 ? p.acc : p.line; x.beginPath(); x.arc(dx, ry + 1, 3.2, 0, 7); x.fill(); });
  });
  return <canvas ref={ref} className="g3d-canvas gates" aria-label="Scroll to fly through my experience" role="img" />;
}

/* ---------------- 5. Network attack map (background) ---------------- */
export function NetMap() {
  const ref = useRef<HTMLCanvasElement>(null);
  const st = useRef<{ nodes: { x: number; y: number; z: number; vx: number; vy: number }[]; pulses: { a: number; b: number; t: number; bad: boolean }[]; flags: { i: number; t: number }[]; w: number }>({ nodes: [], pulses: [], flags: [], w: 0 });
  useCanvasLoop(ref, (x, w, h, dt, p) => {
    const s = st.current;
    if (s.w !== Math.round(w)) {
      s.w = Math.round(w);
      const n = Math.round(Math.min(46, Math.max(18, w / 34)));
      s.nodes = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), vx: (Math.random() - 0.5) * 0.012, vy: (Math.random() - 0.5) * 0.012 }));
      s.pulses = [];
    }
    const still = reduced();
    const L = Math.min(170, w * 0.22);
    s.nodes.forEach(nd => { if (!still) { nd.x += nd.vx * dt; nd.y += nd.vy * dt; } if (nd.x < 0 || nd.x > w) nd.vx *= -1; if (nd.y < 0 || nd.y > h) nd.vy *= -1; });
    const edges: [number, number, number][] = [];
    for (let i = 0; i < s.nodes.length; i++) for (let j = i + 1; j < s.nodes.length; j++) {
      const d = Math.hypot(s.nodes[i].x - s.nodes[j].x, s.nodes[i].y - s.nodes[j].y); if (d < L) edges.push([i, j, d]);
    }
    edges.forEach(([i, j, d]) => { x.strokeStyle = `rgba(${p.accRgb},${(0.24 * (1 - d / L)).toFixed(3)})`; x.lineWidth = 0.8; x.beginPath(); x.moveTo(s.nodes[i].x, s.nodes[i].y); x.lineTo(s.nodes[j].x, s.nodes[j].y); x.stroke(); });
    s.nodes.forEach(nd => { x.fillStyle = `rgba(${p.accRgb},${(0.25 + nd.z * 0.45).toFixed(2)})`; x.beginPath(); x.arc(nd.x, nd.y, 1.2 + nd.z * 1.8, 0, 7); x.fill(); });
    if (!still && edges.length && Math.random() < dt / 260) { const e = edges[Math.floor(Math.random() * edges.length)]; s.pulses.push({ a: e[0], b: e[1], t: 0, bad: Math.random() < 0.12 }); }
    s.pulses = s.pulses.filter(q => q.t <= 1);
    s.pulses.forEach(q => {
      q.t += dt / 1400; const A = s.nodes[q.a], B = s.nodes[q.b]; if (!A || !B) return;
      const px = A.x + (B.x - A.x) * q.t, py = A.y + (B.y - A.y) * q.t;
      x.fillStyle = q.bad ? p.danger : p.acc; x.shadowColor = x.fillStyle; x.shadowBlur = 8; x.beginPath(); x.arc(px, py, q.bad ? 2.6 : 2, 0, 7); x.fill(); x.shadowBlur = 0;
      if (q.bad && q.t > 0.98) s.flags.push({ i: q.b, t: 0 });
    });
    s.flags = s.flags.filter(f => f.t < 1);
    s.flags.forEach(f => { f.t += dt / 1300; const nd = s.nodes[f.i]; if (!nd) return; x.strokeStyle = `rgba(248,113,113,${(1 - f.t) * 0.8})`; x.lineWidth = 1.2; x.beginPath(); x.arc(nd.x, nd.y, 5 + f.t * 16, 0, 7); x.stroke(); });
  });
  return <canvas ref={ref} className="g3d-canvas net" aria-hidden="true" />;
}

/* ---------------- 2. Tilt + flip wrapper for project cards ---------------- */
export function useTilt() {
  return {
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      const el = e.currentTarget, r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((py - 0.5) * -9).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((px - 0.5) * 11).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    },
    onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => {
      const el = e.currentTarget; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    },
  };
}
