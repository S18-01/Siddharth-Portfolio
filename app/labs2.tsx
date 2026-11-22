'use client';

/* Second batch of trial features. All client-side; nothing typed here is sent anywhere. */
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { landDots } from './three';
import { play } from './sound';

const accRgb = () => getComputedStyle(document.documentElement).getPropertyValue('--acc-rgb').trim() || '143,176,255';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function useCanvas(draw: (x: CanvasRenderingContext2D, w: number, h: number, t: number) => void, deps: unknown[] = []) {
  const ref = useRef<HTMLCanvasElement>(null);
  const d = useRef(draw); d.current = draw;
  useEffect(() => {
    const c = ref.current; if (!c) return; const x = c.getContext('2d'); if (!x) return;
    let raf = 0, w = 0, h = 0, vis = false;
    const size = () => { const r = devicePixelRatio || 1; w = c.clientWidth; h = c.clientHeight; c.width = w * r; c.height = h * r; x.setTransform(r, 0, 0, r, 0, 0); };
    size(); const ro = new ResizeObserver(size); ro.observe(c);
    const io = new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { rootMargin: '100px' }); io.observe(c);
    const loop = (t: number) => { if (vis && !document.hidden) { x.clearRect(0, 0, w, h); d.current(x, w, h, t); } raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

/* ================= Breach simulation ================= */
export function BreachSim({ onBook }: { onBook: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'attack' | 'contain' | 'done'>('idle');
  const [log, setLog] = useState<{ t: string; c: string }[]>([]);
  const st = useRef({ start: 0, nodes: [] as { x: number; y: number; hop: number }[], edges: [] as [number, number][] });
  if (!st.current.nodes.length) {
    const pts: { x: number; y: number; hop: number }[] = [];
    const layout = [[0.08, 0.5], [0.25, 0.25], [0.25, 0.75], [0.42, 0.15], [0.42, 0.5], [0.42, 0.85], [0.6, 0.3], [0.6, 0.7], [0.76, 0.2], [0.76, 0.5], [0.76, 0.8], [0.92, 0.5]];
    const hops = [0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5];
    layout.forEach(([x, y], i) => pts.push({ x, y, hop: hops[i] }));
    st.current.nodes = pts;
    st.current.edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [6, 9], [7, 9], [7, 10], [8, 11], [9, 11], [10, 11]];
  }
  const labels = ['Internet', 'Web server', 'VPN', 'Mail', 'App server', 'Workstation', 'File share', 'HR laptop', 'AD controller', 'Database', 'Backup', 'Crown jewels'];
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setLog([]); setPhase('attack'); st.current.start = performance.now();
    const steps: [number, string, string][] = [
      [400, 'Recon: external scan hits the web server', 'r'], [1300, 'Initial access: vulnerable plugin exploited', 'r'], [2200, 'Lateral movement toward the app server', 'r'],
      [2900, 'SIEM alert: unusual process tree on app-02', 'a'], [3500, 'EDR alert: credential dumping attempt', 'a'],
      [4200, 'Containment: isolate app-02 and web-01', 'g'], [5000, 'Block attacker IP at the firewall, revoke tokens', 'g'], [5800, 'Eradicate: patch plugin, rotate credentials', 'g'], [6600, 'Recover and verify: crown jewels untouched', 'g'],
    ];
    steps.forEach(([ms, t, c]) => timers.current.push(setTimeout(() => setLog(l => [...l, { t, c }]), ms)));
    timers.current.push(setTimeout(() => { setPhase('contain'); play('alarm'); }, 4100));
    timers.current.push(setTimeout(() => { setPhase('done'); play('win'); }, 7200));
  };
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const ref = useCanvas((x, w, h, t) => {
    const { nodes, edges, start } = st.current, acc = accRgb(), p = phaseRef.current;
    const el = p === 'idle' ? 0 : (t - start) / 1000;
    const reach = p === 'idle' ? -1 : Math.min(2.6, el / 0.85); // attacker reaches hop 2 (app server), never the crown jewels
    const healAt = 4.2;
    edges.forEach(([a, b]) => {
      const A = nodes[a], B = nodes[b];
      const hot = Math.max(A.hop, B.hop) <= reach && el < healAt + 2.6;
      x.strokeStyle = hot ? 'rgba(248,113,113,.55)' : `rgba(${acc},.22)`; x.lineWidth = hot ? 1.6 : 1;
      x.beginPath(); x.moveTo(A.x * w, A.y * h); x.lineTo(B.x * w, B.y * h); x.stroke();
    });
    nodes.forEach((n, i) => {
      const X = n.x * w, Y = n.y * h;
      const hit = n.hop <= reach && n.hop > 0;
      const healed = hit && el > healAt + (2 - n.hop) * 0.5;
      const col = !hit ? `rgba(${acc},.9)` : healed ? 'rgba(74,222,128,.95)' : 'rgba(248,113,113,.95)';
      if (hit && !healed) { const r = 10 + ((t / 400) % 1) * 14; x.strokeStyle = `rgba(248,113,113,${1 - ((t / 400) % 1)})`; x.beginPath(); x.arc(X, Y, r, 0, 7); x.stroke(); }
      if (healed) { x.strokeStyle = 'rgba(74,222,128,.6)'; x.setLineDash([3, 3]); x.beginPath(); x.arc(X, Y, 15, 0, 7); x.stroke(); x.setLineDash([]); }
      x.fillStyle = col; x.beginPath(); x.arc(X, Y, i === 11 ? 8 : 6, 0, 7); x.fill();
      x.fillStyle = 'rgba(200,210,230,.8)'; x.font = '600 10.5px Inter, sans-serif'; x.textAlign = 'center'; x.fillText(labels[i], X, Y + 22); x.textAlign = 'left';
    });
    if (p === 'attack' || p === 'contain') {
      const f = Math.min(1, (el % 0.85) / 0.85), hop = Math.min(2, Math.floor(el / 0.85));
      const e = edges.find(([a, b]) => nodes[a].hop === hop && nodes[b].hop === hop + 1);
      if (e && el < healAt) { const A = nodes[e[0]], B = nodes[e[1]]; x.fillStyle = '#f87171'; x.shadowColor = '#f87171'; x.shadowBlur = 10; x.beginPath(); x.arc((A.x + (B.x - A.x) * f) * w, (A.y + (B.y - A.y) * f) * h, 4, 0, 7); x.fill(); x.shadowBlur = 0; }
    }
  }, []);
  return (
    <div className="lab-breach">
      <div className="br-stage">
        <canvas ref={ref} className="br-canvas" role="img" aria-label="Network diagram showing an attack being detected and contained" />
        {phase === 'done' && <div className="br-done"><b>Threat contained.</b><span>Detected in 3 s, contained before it reached the database.</span><button className="btn light" onClick={onBook}>Let&apos;s talk</button></div>}
      </div>
      <div className="br-side">
        <p className="lab-lead">A 7-second replay of how I think in an incident: <b>spot the attack path, isolate fast, fix the root cause.</b></p>
        <ol className="br-log">{log.map((l, i) => <li key={i} className={l.c}>{l.t}</li>)}{!log.length && <li className="idle">Press start to run the simulation.</li>}</ol>
        <button className="btn light" onClick={run} disabled={phase === 'attack' || phase === 'contain'}>{phase === 'idle' ? 'Start simulation' : phase === 'done' ? 'Run again' : 'Running…'}</button>
      </div>
    </div>
  );
}

/* ================= RedForge X attack chain ================= */
const chain = [
  { k: 'Recon', tool: 'Nmap · Kali Linux', d: 'Mapped open ports, services and versions on the lab targets to build the attack surface.' },
  { k: 'Scan', tool: 'Burp Suite · Nessus', d: 'Crawled the app, flagged injectable parameters and outdated components.' },
  { k: 'Exploit', tool: 'Burp Repeater · Python', d: 'Exploited SQL injection, XSS, IDOR, SSTI and command injection in a controlled, Dockerized lab.' },
  { k: 'Prove', tool: 'PoC scripts · pytest', d: 'Wrote proof-of-concept checks so every finding is reproducible, not just a screenshot.' },
  { k: 'Report', tool: 'CVSS · PDF reports', d: 'Scored each finding with CVSS and generated reports with clear remediation steps.' },
  { k: 'Verify', tool: 'GitHub Actions', d: 'Re-ran the PoCs after fixes as regression tests in CI to prove the hole stays closed.' },
];
export function AttackChain() {
  const [i, setI] = useState(0);
  return (
    <div className="lab-chain">
      <p className="lab-lead">From my <b>RedForge X</b> project: how I run a penetration test end to end. Tap a stage.</p>
      <div className="ch-rail" role="tablist">
        {chain.map((c, k) => <button key={c.k} role="tab" aria-selected={i === k} className={k === i ? 'on' : k < i ? 'past' : ''} onClick={() => setI(k)}><span>0{k + 1}</span>{c.k}</button>)}
      </div>
      <div className="ch-stage">
        {chain.map((c, k) => {
          const off = k - i;
          return (
            <article key={c.k} className={'ch-card' + (off === 0 ? ' on' : '')} style={{ transform: `translateX(${off * 62}%) translateZ(${-Math.abs(off) * 180}px) rotateY(${off * -24}deg)`, opacity: Math.abs(off) > 2 ? 0 : 1 - Math.abs(off) * 0.3, zIndex: 10 - Math.abs(off) }} onClick={() => setI(k)}>
              <small>Stage 0{k + 1}</small><h3>{c.k}</h3><p>{c.d}</p><span className="ch-tool">{c.tool}</span>
            </article>
          );
        })}
      </div>
      <div className="ch-nav"><button className="btn ghost" onClick={() => setI(v => Math.max(0, v - 1))} disabled={i === 0}>Previous</button><button className="btn light" onClick={() => setI(v => Math.min(chain.length - 1, v + 1))} disabled={i === chain.length - 1}>Next stage</button></div>
    </div>
  );
}

/* ================= Password vault ================= */
const common = ['password', '123456', 'qwerty', 'letmein', 'admin', 'welcome', 'iloveyou', 'monkey', 'dragon', 'abc123', 'football', 'baseball'];
function strength(pw: string) {
  if (!pw) return { bits: 0, secs: 0, tips: [] as string[] };
  let pool = 0; if (/[a-z]/.test(pw)) pool += 26; if (/[A-Z]/.test(pw)) pool += 26; if (/\d/.test(pw)) pool += 10; if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(Math.max(pool, 1));
  const tips: string[] = [];
  const low = pw.toLowerCase();
  if (common.some(c => low.includes(c))) { bits = Math.min(bits, 12); tips.push('Contains a very common password'); }
  if (/(.)\1{2,}/.test(pw)) { bits *= 0.7; tips.push('Repeated characters'); }
  if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|qwer|asdf)/i.test(pw)) { bits *= 0.7; tips.push('Keyboard or number sequence'); }
  if (pw.length < 12) tips.push('Use 12+ characters, or 4 random words');
  if (pool < 60 && pw.length < 16) tips.push('Mix cases, numbers and symbols');
  return { bits, secs: Math.pow(2, bits) / 2 / 1e10, tips };
}
function human(s: number) {
  if (s < 1) return 'instantly'; const u: [number, string][] = [[31536000 * 1e6, 'million years'], [31536000 * 1000, 'thousand years'], [31536000, 'years'], [86400, 'days'], [3600, 'hours'], [60, 'minutes'], [1, 'seconds']];
  for (const [d, n] of u) if (s >= d) { const v = s / d; return `${v > 999 ? 'over 999' : Math.round(v)} ${n}`; }
  return 'instantly';
}
export function PasswordVault() {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const s = strength(pw), lvl = Math.min(5, Math.floor(s.bits / 16));
  const names = ['Wide open', 'Weak', 'Fair', 'Good', 'Strong', 'Vault-grade'];
  return (
    <div className="lab-vault">
      <div className={'vault l' + lvl} aria-hidden="true">
        {[0, 1, 2, 3, 4].map(k => <i key={k} className={'vr' + (k < lvl ? ' on' : '')} style={{ ['--k' as string]: k }} />)}
        <div className="vault-door"><span className="vault-dial" style={{ transform: `rotate(${pw.length * 24}deg)` }} /><b>{names[lvl]}</b></div>
        {Array.from({ length: 8 }, (_, k) => <span key={k} className={'bolt' + (k < lvl * 2 ? ' on' : '')} style={{ ['--a' as string]: `${k * 45}deg` }} />)}
      </div>
      <div className="vault-side">
        <p className="lab-lead">Type any password and see how long an attacker with a fast GPU rig (10 billion guesses a second) would need. <b>It never leaves your browser.</b></p>
        <div className="vault-in"><input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Try a password" autoComplete="off" spellCheck={false} aria-label="Password to test" maxLength={64} /><button className="btn ghost" onClick={() => setShow(v => !v)} type="button">{show ? 'Hide' : 'Show'}</button></div>
        <div className="vault-out"><small>Time to crack</small><b>{pw ? human(s.secs) : '–'}</b><span>{pw ? `${Math.round(s.bits)} bits of entropy` : 'Waiting for input'}</span></div>
        {s.tips.length > 0 && <ul className="vault-tips">{s.tips.map(t => <li key={t}>{t}</li>)}</ul>}
      </div>
    </div>
  );
}

/* ================= What any website knows ================= */
export function BrowserKnows() {
  const [items, setItems] = useState<[string, string][]>([]);
  const reveal = () => {
    const n = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string } };
    const out: [string, string][] = [
      ['Time zone', Intl.DateTimeFormat().resolvedOptions().timeZone],
      ['Language', n.language],
      ['Screen', `${screen.width} × ${screen.height} @${devicePixelRatio}x`],
      ['CPU cores', String(n.hardwareConcurrency || 'hidden')],
      ['Memory', n.deviceMemory ? `~${n.deviceMemory} GB` : 'hidden'],
      ['Touch screen', 'ontouchstart' in window ? 'Yes' : 'No'],
      ['Dark mode', matchMedia('(prefers-color-scheme: dark)').matches ? 'On' : 'Off'],
      ['Network', n.connection?.effectiveType ?? 'hidden'],
      ['Browser', (n.userAgent.match(/(Edg|Chrome|Firefox|Safari)\/[\d.]+/)?.[0] ?? 'Unknown').replace('Edg', 'Edge')],
      ['Platform', /Win/.test(n.userAgent) ? 'Windows' : /Mac/.test(n.userAgent) ? 'macOS' : /Android/.test(n.userAgent) ? 'Android' : /iPhone|iPad/.test(n.userAgent) ? 'iOS' : /Linux/.test(n.userAgent) ? 'Linux' : 'Unknown'],
    ];
    setItems(out);
  };
  return (
    <div className="lab-know">
      <p className="lab-lead">Without asking permission, any website can read details like these. Together they form a <b>fingerprint</b> that can track you across sites. This runs only on your device; nothing is saved or sent.</p>
      {!items.length ? <button className="btn light" onClick={reveal}>Show what this site can see</button> : (
        <>
          <div className="kn-grid">{items.map(([k, v], i) => <div key={k} className="kn-shard" style={{ ['--d' as string]: `${i * 70}ms`, ['--rx' as string]: `${(i % 3 - 1) * 40}deg`, ['--ry' as string]: `${(i % 4 - 1.5) * 30}deg` }}><small>{k}</small><b>{v}</b></div>)}</div>
          <div className="kn-fix"><b>How I&apos;d protect your users</b><ul><li>Collect only what the product needs, and say why</li><li>Strict Permissions-Policy and CSP to block third-party trackers</li><li>Privacy reviews and threat models for every new feature</li></ul></div>
        </>
      )}
    </div>
  );
}

/* ================= SOC dashboard + MITRE coverage ================= */
const mitre: { t: string; lv: number; src: string }[] = [
  { t: 'Reconnaissance', lv: 3, src: 'Nmap and Nessus scans at Cognizant; RedForge X recon' },
  { t: 'Initial Access', lv: 2, src: 'Phishing triage in SOC workflows; web exploitation labs' },
  { t: 'Execution', lv: 2, src: 'Command injection and SSTI in RedForge X' },
  { t: 'Persistence', lv: 1, src: 'Coursework labs at UMD' },
  { t: 'Privilege Escalation', lv: 2, src: 'Linux privilege escalation in CTFs' },
  { t: 'Defense Evasion', lv: 1, src: 'CTF challenges' },
  { t: 'Credential Access', lv: 2, src: 'Brute-force and credential alert triage at Cognizant' },
  { t: 'Discovery', lv: 3, src: 'Network reconnaissance labs taught as Graduate Assistant' },
  { t: 'Lateral Movement', lv: 1, src: 'Lab environments' },
  { t: 'Collection', lv: 1, src: 'Forensics coursework' },
  { t: 'Command and Control', lv: 2, src: 'IOC analysis and firewall log investigations' },
  { t: 'Impact', lv: 2, src: 'Incident prioritization with the ML classification project' },
];
function Glass({ children, title, k, onClick }: { children: ReactNode; title: string; k: string; onClick?: () => void }) {
  const move = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return; const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`); el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
  };
  const leave = (e: ReactPointerEvent<HTMLElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };
  return <section className={'gl gl-' + k} onPointerMove={move} onPointerLeave={leave}><header><small>{title}</small>{onClick && <button onClick={onClick}>Open →</button>}</header>{children}</section>;
}
export function SocDashboard({ go }: { go: (id: string) => void }) {
  const [sel, setSel] = useState<number | null>(0);
  const mapRef = useCanvas((x, w, h, t) => {
    const acc = accRgb(); const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
    x.strokeStyle = `rgba(${acc},.25)`; [1, 0.66, 0.33].forEach(f => { x.beginPath(); x.arc(cx, cy, R * f, 0, 7); x.stroke(); });
    x.beginPath(); x.moveTo(cx - R, cy); x.lineTo(cx + R, cy); x.moveTo(cx, cy - R); x.lineTo(cx, cy + R); x.stroke();
    const a = (t / 1600) % (Math.PI * 2);
    const g = x.createConicGradient ? x.createConicGradient(a - 0.6, cx, cy) : null;
    if (g) { g.addColorStop(0, `rgba(${acc},0)`); g.addColorStop(0.09, `rgba(${acc},.35)`); g.addColorStop(0.1, `rgba(${acc},0)`); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill(); }
    [[0.3, 0.6, 1], [-0.5, 0.35, 0], [0.7, -0.4, 0], [-0.2, -0.7, 1], [0.55, 0.2, 0]].forEach(([dx, dy, bad], i) => {
      const X = cx + dx * R, Y = cy + dy * R, ang = Math.atan2(dy, dx), diff = ((a - ang) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2), on = Math.max(0, 1 - diff / 2.4);
      x.fillStyle = bad ? `rgba(248,113,113,${0.25 + on * 0.75})` : `rgba(${acc},${0.25 + on * 0.75})`; x.beginPath(); x.arc(X, Y, 3 + on * 2 + (i % 2), 0, 7); x.fill();
    });
  }, []);
  const q = [{ k: 'Critical', n: 2, c: '#f87171' }, { k: 'High', n: 5, c: '#fb923c' }, { k: 'Medium', n: 11, c: '#fbbf24' }, { k: 'Low', n: 23, c: '#4ade80' }];
  const max = 23;
  return (
    <div className="dash">
      <Glass title="Alert queue · sample shift" k="q" onClick={() => go('lab')}>
        <div className="dq">{q.map(r => <div key={r.k}><span>{r.k}</span><i style={{ width: `${(r.n / max) * 100}%`, background: r.c }} /><b>{r.n}</b></div>)}</div>
        <p className="gl-note">How I triage: severity × asset value × evidence of activity. Try it in the Proof lab.</p>
      </Glass>
      <Glass title="Threat radar" k="r"><canvas ref={mapRef} className="dash-radar" aria-hidden="true" /><p className="gl-note">Red: confirmed malicious. Blue: monitored.</p></Glass>
      <Glass title="CVSS · RedForge X finding" k="c" onClick={() => go('projects')}>
        <div className="cvss"><svg viewBox="0 0 120 70" aria-hidden="true"><path d="M10 64 A50 50 0 0 1 110 64" className="tr" /><path d="M10 64 A50 50 0 0 1 110 64" className="v" style={{ strokeDasharray: '157', strokeDashoffset: `${157 * (1 - 9.8 / 10)}` }} /></svg><b>9.8</b><span>Critical · SQL injection (lab)</span></div>
      </Glass>
      <Glass title="MITRE ATT&CK · where I've worked on it" k="m">
        <div className="mitre">{mitre.map((m, i) => <button key={m.t} className={'mt l' + m.lv + (sel === i ? ' on' : '')} onClick={() => setSel(i)} aria-pressed={sel === i}><i style={{ height: `${m.lv * 33}%` }} /><span>{m.t}</span></button>)}</div>
        <p className="mt-src">{sel !== null ? <><b>{mitre[sel].t}:</b> {mitre[sel].src}</> : 'Tap a tactic to see where I practiced it.'}</p>
        <div className="mt-leg"><span><i className="l1" />Labs / coursework</span><span><i className="l2" />Projects</span><span><i className="l3" />Professional work</span></div>
      </Glass>
    </div>
  );
}

/* ================= Interactive 3D terminal ================= */
const cmds: Record<string, { out: string[]; cards?: string[] }> = {
  help: { out: ['Commands: whoami · skills · projects · experience · hire · resume · clear'] },
  whoami: { out: ['Siddharth Muragundla · Security Engineer', 'M.Eng Cybersecurity, University of Maryland · open to relocation'], cards: ['Security Engineer', 'Maryland, USA', 'Open to relocation'] },
  skills: { out: ['offense: burp metasploit nmap nessus', 'defense: splunk elk mitre-att&ck ir', 'cloud: aws eks kubernetes terraform'], cards: ['Burp Suite', 'Splunk', 'Kubernetes', 'AWS', 'Python'] },
  projects: { out: ['KubeShield Enterprise · RedForge X · Cyber Incident Classification'], cards: ['KubeShield', 'RedForge X', 'ML Incidents'] },
  experience: { out: ['Graduate Assistant · UMD', 'Security Engineer · Cognizant', 'Cybersecurity Intern · Nestack', 'Club Lead · CTFs'], cards: ['UMD', 'Cognizant', 'Nestack'] },
};
export function TermInput({ onHire, onResume }: { onHire: () => void; onResume: () => void }) {
  const [lines, setLines] = useState<string[]>(['Type help and press Enter.']);
  const [val, setVal] = useState('');
  const [cards, setCards] = useState<{ id: number; t: string; i: number }[]>([]);
  const id = useRef(0);
  const run = (e: React.FormEvent) => {
    e.preventDefault(); const c = val.trim().toLowerCase(); setVal(''); if (!c) return;
    if (c === 'clear') { setLines([]); return; }
    if (c === 'hire') { setLines(l => [...l, `$ ${c}`, 'Opening my calendar…']); onHire(); return; }
    if (c === 'resume') { setLines(l => [...l, `$ ${c}`, 'Opening resume…']); onResume(); return; }
    const r = cmds[c];
    setLines(l => [...l.slice(-12), `$ ${c}`, ...(r ? r.out : [`command not found: ${c} (try help)`])]);
    if (r?.cards) { const batch = r.cards.map((t, i) => ({ id: ++id.current, t, i })); setCards(cs => [...cs, ...batch]); setTimeout(() => setCards(cs => cs.filter(x => !batch.includes(x))), 3200); }
  };
  return (
    <div className="ti">
      <div className="ti-out" aria-live="polite">{lines.map((l, i) => <div key={i} className={l.startsWith('$') ? 'cmd' : ''}>{l}</div>)}</div>
      <form onSubmit={run} className="ti-in"><span>siddharth@sec:~$</span><input value={val} onChange={e => setVal(e.target.value)} aria-label="Terminal command" autoComplete="off" spellCheck={false} placeholder="help" /></form>
      <div className="ti-fly" aria-hidden="true">{cards.map(c => <span key={c.id} style={{ ['--i' as string]: c.i }}>{c.t}</span>)}</div>
    </div>
  );
}

/* ================= Padlock that unlocks the resume ================= */
export function PadlockResume({ onOpen }: { onOpen: () => void }) {
  const target = [0, 240, 120]; // ring k shows letter 'SEC'[k] at the top marker
  const [rot, setRot] = useState([120, 0, 240]);
  const ok = (k: number) => rot[k] % 360 === target[k];
  const open = rot.every((_, k) => ok(k));
  useEffect(() => { if (open) { play('access'); const t = setTimeout(onOpen, 900); return () => clearTimeout(t); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const turn = (k: number) => setRot(r => r.map((v, j) => (j === k ? v + 120 : v)));
  return (
    <div className={'lock' + (open ? ' open' : '')}>
      <div className="lock-body">
        <span className="lock-shackle" aria-hidden="true" />
        {rot.map((r, k) => (
          <button key={k} className={'lock-ring' + (ok(k) ? ' ok' : '')} style={{ ['--r' as string]: `${r}deg`, ['--k' as string]: k }} onClick={() => turn(k)} aria-label={`Turn ring ${k + 1}`}>
            {['S', 'E', 'C'].map((ch, j) => <i key={j} style={{ ['--j' as string]: j }}>{ch}</i>)}
          </button>
        ))}
        <span className="lock-mark" aria-hidden="true" />
      </div>
      <div className="lock-txt"><small className="pc-k">Unlock my resume</small><b>{open ? 'Access granted' : 'Spell SEC at the top marker'}</b><span>{open ? 'Opening resume…' : 'Tap each ring to turn it.'}</span><button className="btn ghost" onClick={onOpen}>Skip, just open it</button></div>
    </div>
  );
}

/* ================= Skyline footer ================= */
export function Skyline({ groups }: { groups: { name: string; n: number }[] }) {
  const seeds = useRef<number[]>([]);
  const ref = useCanvas((x, w, h, t) => {
    const acc = accRgb(); const bw = w / (groups.length * 1.35), gap = bw * 0.35, max = Math.max(...groups.map(g => g.n));
    if (!seeds.current.length) seeds.current = Array.from({ length: 600 }, () => Math.random());
    let si = 0;
    groups.forEach((g, i) => {
      const bh = (g.n / max) * h * 0.72 + h * 0.12, X = gap / 2 + i * (bw + gap), Y = h - bh;
      const grd = x.createLinearGradient(0, Y, 0, h); grd.addColorStop(0, `rgba(${acc},.22)`); grd.addColorStop(1, `rgba(${acc},.03)`);
      x.fillStyle = grd; x.fillRect(X, Y, bw, bh); x.strokeStyle = `rgba(${acc},.45)`; x.lineWidth = 1; x.strokeRect(X + 0.5, Y + 0.5, bw - 1, bh);
      x.fillStyle = `rgba(${acc},.9)`; x.fillRect(X + bw / 2 - 0.5, Y - 10, 1, 10); if (Math.sin(t / 600 + i) > 0.6) { x.beginPath(); x.arc(X + bw / 2, Y - 11, 2, 0, 7); x.fill(); }
      const cols = Math.max(2, Math.floor(bw / 9)), rows = Math.floor((bh - 26) / 10);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const s = seeds.current[si++ % 600]; const lit = s < 0.55 + 0.1 * Math.sin(t / 2400 + s * 40);
        x.fillStyle = lit ? `rgba(${acc},${0.35 + s * 0.5})` : 'rgba(255,255,255,.04)'; x.fillRect(X + 4 + c * ((bw - 8) / cols), Y + 8 + r * 10, Math.max(2, (bw - 8) / cols - 3), 4);
      }
      x.fillStyle = 'rgba(200,210,230,.75)'; x.font = '600 10px Inter, sans-serif'; x.textAlign = 'center';
      x.fillText(g.name, X + bw / 2, h - 6); x.textAlign = 'left';
    });
  }, [groups.length]);
  return <canvas ref={ref} className="skyline" role="img" aria-label="Skyline where each building is a skill area; taller buildings mean more skills" />;
}

/* ================= Holographic badge + particle portrait ================= */
export function HoloBadge({ img, name, li }: { img: string; name: string; li: string }) {
  const move = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget, r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(py - 0.5) * -16}deg`); el.style.setProperty('--ry', `${(px - 0.5) * 20}deg`); el.style.setProperty('--hx', `${px * 100}%`); el.style.setProperty('--hy', `${py * 100}%`);
  };
  const leave = (e: ReactPointerEvent<HTMLElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };
  return (
    <div className="holo-wrap"><div className="holo" onPointerMove={move} onPointerLeave={leave}>
      <div className="holo-top"><span>SECURITY · ACCESS</span><span className="chip-ic" /></div>
      <img src={img} alt={name} draggable={false} />
      <div className="holo-info"><b>{name}</b><span>Clearance · Security Engineer</span><span>Maryland, USA · Open to relocation</span><a href={li} target="_blank" rel="noopener noreferrer">linkedin.com/in/siddhum ↗</a></div>
      <div className="holo-foil" aria-hidden="true" />
    </div></div>
  );
}
export function ParticlePortrait({ img }: { img: string }) {
  const pts = useRef<{ x: number; y: number; ox: number; oy: number; vx: number; vy: number; c: string }[]>([]);
  const mouse = useRef({ x: -999, y: -999 });
  const wh = useRef({ w: 0, h: 0 });
  useEffect(() => {
    const im = new Image(); im.src = img;
    im.onload = () => {
      const S = 240, c = document.createElement('canvas'); c.width = S; c.height = S; const x = c.getContext('2d'); if (!x) return;
      x.drawImage(im, 0, 0, S, S); const d = x.getImageData(0, 0, S, S).data; const out: typeof pts.current = [];
      for (let y = 0; y < S; y += 2) for (let X = 0; X < S; X += 2) { const k = (y * S + X) * 4; if (d[k + 3] < 200) continue; const l = Math.max(d[k], d[k + 1], d[k + 2]); if (l < 46) continue; out.push({ x: Math.random(), y: Math.random(), ox: X / S, oy: y / S, vx: 0, vy: 0, c: `rgba(${Math.min(255, d[k] * 1.5 + 40)},${Math.min(255, d[k + 1] * 1.5 + 60)},${Math.min(255, d[k + 2] * 1.5 + 100)},.95)` }); }
      pts.current = out;
    };
  }, [img]);
  const ref = useCanvas((x, w, h) => {
    wh.current = { w, h }; const S = Math.min(w, h), ox = (w - S) / 2, oy = (h - S) / 2, m = mouse.current, still = reduced();
    pts.current.forEach(p => {
      const tx = p.ox, ty = p.oy; const px = ox + p.x * S, py = oy + p.y * S;
      const dx = px - m.x, dy = py - m.y, d2 = dx * dx + dy * dy;
      if (d2 < 3600 && !still) { const f = (3600 - d2) / 3600; p.vx += (dx / S) * f * 0.06; p.vy += (dy / S) * f * 0.06; }
      p.vx += (tx - p.x) * 0.045; p.vy += (ty - p.y) * 0.045; p.vx *= 0.84; p.vy *= 0.84; p.x += p.vx; p.y += p.vy;
      x.fillStyle = p.c; x.fillRect(ox + p.x * S, oy + p.y * S, 2.1, 2.1);
    });
  }, []);
  return <canvas ref={ref} className="particles" onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }; }} onPointerLeave={() => { mouse.current = { x: -999, y: -999 }; }} role="img" aria-label="Portrait made of particles; move the mouse to scatter them" />;
}

/* ================= Day / night by Maryland time ================= */
export function useDaypart() {
  const [part, setPart] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  useEffect(() => {
    const set = () => {
      const hr = +new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(new Date()) % 24;
      const p = hr >= 5 && hr < 9 ? 'dawn' : hr >= 9 && hr < 17 ? 'day' : hr >= 17 && hr < 20 ? 'dusk' : 'night';
      setPart(p); document.documentElement.dataset.daypart = p;
    };
    set(); const id = setInterval(set, 60000); return () => clearInterval(id);
  }, []);
  return part;
}

/* ================= World intro: globe → Maryland → data center → rack → terminal ================= */
export function WorldIntro() {
  const wrap = useRef<HTMLDivElement>(null);
  const prog = useRef(0);
  const [cap, setCap] = useState(0);
  useEffect(() => {
    const on = () => { const el = wrap.current; if (!el) return; const r = el.getBoundingClientRect(); const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight))); prog.current = p; setCap(Math.min(3, Math.floor(p * 4))); };
    on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on);
  }, []);
  const sm = useRef(0);
  const ref = useCanvas((x, w, h, t) => {
    const acc = accRgb(); sm.current += (prog.current - sm.current) * 0.08; const p = sm.current;
    const cx = w / 2, cy = h / 2;
    const ph = (a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
    // 1 globe zooming toward Maryland
    const g = 1 - ph(0.22, 0.34);
    if (g > 0) {
      const zz = ph(0.06, 0.32), z = 1 + zz * zz * 4.5, R = Math.min(w, h) * 0.34 * z, rot = 1.35 + (1 - zz) * Math.sin(t / 6000) * 0.25;
      x.globalAlpha = g;
      const gr = x.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); gr.addColorStop(0, `rgba(${acc},.18)`); gr.addColorStop(1, 'rgba(4,8,18,.9)');
      const la0 = 39, lo0 = -77; const P = (la: number, lo: number) => { const ph1 = (la * Math.PI) / 180, l = ((lo - lo0) * Math.PI) / 180 * 1 + (rot - 1.35); const ct = (la0 * Math.PI) / 180 * ph(0, 0.3); const X = Math.cos(ph1) * Math.sin(l), Y = Math.sin(ph1), Z = Math.cos(ph1) * Math.cos(l); const y2 = Y * Math.cos(ct) - Z * Math.sin(ct), z2 = Y * Math.sin(ct) + Z * Math.cos(ct); return [cx + X * R, cy - y2 * R, z2]; };
      x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
      x.strokeStyle = `rgba(${acc},.18)`; x.lineWidth = 0.7;
      for (let la = -60; la <= 75; la += 15) { x.beginPath(); let on = false; for (let lo = -180; lo <= 180; lo += 4) { const q = P(la, lo); if (q[2] < 0) { on = false; continue; } if (on) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); on = true; } x.stroke(); }
      for (let lo = -180; lo < 180; lo += 15) { x.beginPath(); let on = false; for (let la = -80; la <= 80; la += 4) { const q = P(la, lo); if (q[2] < 0) { on = false; continue; } if (on) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); on = true; } x.stroke(); }
      landDots.forEach(([la, lo]) => { const q = P(la, lo); if (q[2] < 0.03) return; x.fillStyle = `rgba(${acc},${(0.25 + q[2] * 0.55).toFixed(2)})`; const s2 = 1.2 + z * 0.5; x.fillRect(q[0] - s2 / 2, q[1] - s2 / 2, s2, s2); });
      const m = P(39, -76.9); x.fillStyle = '#4ade80'; x.beginPath(); x.arc(m[0], m[1], 5, 0, 7); x.fill();
      const pr = 8 + ((t / 900) % 1) * 18; x.strokeStyle = `rgba(74,222,128,${1 - ((t / 900) % 1)})`; x.beginPath(); x.arc(m[0], m[1], pr, 0, 7); x.stroke();
      x.globalAlpha = 1;
    }
    // 2 data center rows
    const d = ph(0.24, 0.36) * (1 - ph(0.5, 0.62));
    if (d > 0) {
      x.globalAlpha = d; const z = 1 + ph(0.3, 0.62) * 1.6;
      for (let row = 3; row >= 0; row--) for (const side of [-1, 1]) for (let k = 0; k < 5; k++) {
        const depth = 1 / (1 + row * 0.75), sc = depth * z, X = cx + side * (70 + k * 58) * sc, Y = cy + 90 * sc, rw = 48 * sc, rh = 150 * sc;
        x.fillStyle = 'rgba(10,16,30,.97)'; x.fillRect(X - rw / 2, Y - rh, rw, rh); x.strokeStyle = `rgba(${acc},${0.18 + depth * 0.45})`; x.lineWidth = 1; x.strokeRect(X - rw / 2, Y - rh, rw, rh);
        for (let s = 0; s < 9; s++) { const on = Math.sin(t / 300 + k * 3 + s * 7 + row + side) > 0.2; x.fillStyle = on ? `rgba(${acc},${0.5 + depth * 0.5})` : 'rgba(74,222,128,.25)'; x.fillRect(X - rw / 2 + 5 * sc, Y - rh + 8 * sc + s * (rh - 14 * sc) / 9, 4 * sc, 2 * sc); }
      }
      x.strokeStyle = `rgba(${acc},.18)`; for (let i = -6; i <= 6; i++) { x.beginPath(); x.moveTo(cx + i * 10, cy + 40); x.lineTo(cx + i * 160, h); x.stroke(); }
      x.globalAlpha = 1;
    }
    // 3 single rack close-up
    const r = ph(0.52, 0.62) * (1 - ph(0.76, 0.86));
    if (r > 0) {
      x.globalAlpha = r; const z = 1 + ph(0.6, 0.86) * 2.2, rw = 180 * z, rh = Math.min(h * 0.8, 340) * z;
      x.fillStyle = 'rgba(10,16,30,.98)'; x.fillRect(cx - rw / 2, cy - rh / 2, rw, rh); x.strokeStyle = `rgba(${acc},.6)`; x.lineWidth = 1.5; x.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh);
      for (let s = 0; s < 10; s++) { const Y = cy - rh / 2 + 10 * z + s * (rh - 20 * z) / 10; x.strokeStyle = `rgba(${acc},.25)`; x.strokeRect(cx - rw / 2 + 10 * z, Y, rw - 20 * z, (rh - 20 * z) / 10 - 4 * z); for (let l = 0; l < 4; l++) { const on = Math.sin(t / 220 + s * 5 + l * 3) > 0; x.fillStyle = on ? (l === 3 && s === 6 ? '#f87171' : `rgba(${acc},1)`) : 'rgba(255,255,255,.06)'; x.beginPath(); x.arc(cx - rw / 2 + 22 * z + l * 10 * z, Y + (rh - 20 * z) / 20 - 2 * z, 2.2 * z, 0, 7); x.fill(); } }
      x.lineWidth = 1; x.globalAlpha = 1;
    }
    // 4 terminal
    const tm = ph(0.8, 0.9);
    if (tm > 0) {
      x.globalAlpha = tm; const tw = Math.min(w * 0.86, 640), th = Math.min(h * 0.6, 300);
      x.fillStyle = 'rgba(5,9,18,.96)'; x.beginPath(); x.roundRect(cx - tw / 2, cy - th / 2, tw, th, 14); x.fill(); x.strokeStyle = `rgba(${acc},.6)`; x.stroke();
      ['#f87171', '#fbbf24', '#4ade80'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(cx - tw / 2 + 18 + i * 16, cy - th / 2 + 18, 4.5, 0, 7); x.fill(); });
      const lines = ['$ ssh siddharth@sec', 'Authenticated with key · TLS 1.3', '$ ./portfolio --start', 'Loading: about · edge · skills · projects · lab', '✓ ready. Scroll on.'];
      const shown = Math.floor(ph(0.84, 1) * 60);
      x.font = '600 15px "JetBrains Mono", monospace'; let n = 0;
      lines.forEach((l, i) => { const vis = l.slice(0, Math.max(0, shown - n)); n += l.length / 3 + 2; x.fillStyle = l.startsWith('✓') ? '#4ade80' : l.startsWith('$') ? `rgba(${acc},1)` : 'rgba(200,210,230,.85)'; x.fillText(vis, cx - tw / 2 + 24, cy - th / 2 + 60 + i * 30); });
      x.globalAlpha = 1;
    }
  }, []);
  const caps = ['Earth · where I work from', 'Maryland, USA · zooming into the infrastructure', 'Inside the rack · where I secure systems', 'My terminal · welcome in'];
  return (
    <section className="world" ref={wrap} aria-label="Intro journey from the globe down to my terminal">
      <div className="world-sticky">
        <canvas ref={ref} className="world-canvas" aria-hidden="true" />
        <div className="world-cap"><span>0{cap + 1} / 04</span>{caps[cap]}</div>
      </div>
    </section>
  );
}
