'use client';

/*
 * "Proof lab": interactive pieces that demonstrate skills instead of describing them.
 * Everything runs in the visitor's browser; nothing they type is stored, except the
 * secure-message form, which is emailed to Siddharth only when they press Send.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { play } from './sound';

/* ================= 1. Site self-audit ================= */
type Check = { key: string; label: string; why: string; pass: boolean | null; detail: string };
const auditSpec: { key: string; label: string; why: string; test: (h: Headers) => [boolean, string] }[] = [
  { key: 'https', label: 'HTTPS everywhere', why: 'Traffic is encrypted in transit', test: () => [location.protocol === 'https:', location.protocol === 'https:' ? 'TLS connection' : 'Served over HTTP (local preview)'] },
  { key: 'csp', label: 'Content Security Policy', why: 'Blocks injected scripts (XSS)', test: h => { const v = h.get('content-security-policy'); return [!!v, v ? `${v.split(';').length} directives, no third-party scripts` : 'Not sent (enabled in production only)']; } },
  { key: 'hsts', label: 'Strict Transport Security', why: 'Forces HTTPS, stops downgrade attacks', test: h => { const v = h.get('strict-transport-security'); const m = v?.match(/max-age=(\d+)/); return [!!v, v ? `max-age ${m ? Math.round(+m[1] / 86400) : '?'} days${/preload/.test(v) ? ' · preload' : ''}` : 'Missing']; } },
  { key: 'xfo', label: 'Clickjacking protection', why: 'Page cannot be framed by other sites', test: h => { const v = h.get('x-frame-options'); return [!!v, v ? `X-Frame-Options: ${v}` : 'Missing']; } },
  { key: 'xcto', label: 'MIME sniffing blocked', why: 'Browser will not guess file types', test: h => { const v = h.get('x-content-type-options'); return [v === 'nosniff', v ? `X-Content-Type-Options: ${v}` : 'Missing']; } },
  { key: 'ref', label: 'Referrer policy', why: 'Limits what URLs leak to other sites', test: h => { const v = h.get('referrer-policy'); return [!!v, v || 'Missing']; } },
  { key: 'perm', label: 'Permissions policy', why: 'Mic, location, payment and USB are blocked', test: h => { const v = h.get('permissions-policy'); return [!!v, v ? `${v.split(',').length} browser features locked` : 'Missing']; } },
  { key: 'coop', label: 'Cross-origin isolation', why: 'Other windows cannot reach this page', test: h => { const v = h.get('cross-origin-opener-policy'); return [!!v, v ? `COOP: ${v}` : 'Missing']; } },
];

export function SiteAudit() {
  const [checks, setChecks] = useState<Check[]>(auditSpec.map(s => ({ key: s.key, label: s.label, why: s.why, pass: null, detail: '' })));
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const run = async () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setChecks(c => c.map(x => ({ ...x, pass: null, detail: '' })));
    setState('running');
    try {
      const res = await fetch(location.pathname + '?audit=' + Date.now(), { method: 'GET', cache: 'no-store', credentials: 'omit' });
      const results = auditSpec.map(s => s.test(res.headers));
      results.forEach(([pass, detail], i) => {
        timers.current.push(setTimeout(() => {
          setChecks(c => c.map((x, j) => (j === i ? { ...x, pass, detail } : x)));
          play(pass ? 'lock' : 'fail');
          if (i === results.length - 1) { setState('done'); play('win'); }
        }, 380 + i * 360));
      });
    } catch { setState('error'); }
  };
  const passed = checks.filter(c => c.pass).length, total = checks.length, done = checks.filter(c => c.pass !== null).length;
  const grade = passed === total ? 'A+' : passed >= total - 1 ? 'A' : passed >= total - 2 ? 'B' : passed >= total - 4 ? 'C' : 'D';
  return (
    <div className="lab-audit">
      <div className="aud-shield" aria-hidden="true">
        {checks.map((c, i) => <i key={c.key} className={'aud-ring' + (c.pass ? ' on' : c.pass === false ? ' off' : '')} style={{ ['--i' as string]: i }} />)}
        <div className="aud-core"><b>{state === 'done' ? grade : state === 'running' ? `${done}/${total}` : '?'}</b><span>{state === 'done' ? `${passed}/${total} checks` : state === 'running' ? 'Scanning' : 'Not scanned'}</span></div>
      </div>
      <div className="aud-side">
        <p className="lab-lead">This button runs a <b>real</b> check of the security headers this portfolio sends to your browser right now. I hardened my own site the way I&apos;d harden yours.</p>
        <ul className="aud-list">
          {checks.map(c => (
            <li key={c.key} className={c.pass ? 'ok' : c.pass === false ? 'no' : ''}>
              <span className="st">{c.pass ? '✓' : c.pass === false ? '✕' : '·'}</span>
              <div><b>{c.label}</b><small>{c.pass === null ? c.why : c.detail}</small></div>
            </li>
          ))}
        </ul>
        <button className="btn light" onClick={run} disabled={state === 'running'}>{state === 'done' ? 'Scan again' : state === 'running' ? 'Scanning…' : 'Scan this site'}</button>
        {state === 'error' && <p className="lab-err">The scan couldn&apos;t reach the site. Try again.</p>}
      </div>
    </div>
  );
}

/* ================= 2. SOC triage challenge ================= */
const alerts = [
  { id: 'a', title: 'WINWORD.EXE spawned powershell.exe -enc …', src: 'EDR · FIN-WS-114', sev: 'High', rank: 1, mitre: 'T1204.002 · T1059.001', why: 'Active execution on a finance workstation: a document launched encoded PowerShell. Isolate the host first, then pull the command and parent document.' },
  { id: 'b', title: '37 failed logins, then success for admin-ops from a new country', src: 'Azure AD sign-in logs', sev: 'High', rank: 2, mitre: 'T1110 · T1078', why: 'A privileged account likely brute-forced and now in use. Revoke sessions, reset credentials and check what the account touched.' },
  { id: 'c', title: 'Outbound connection to known C2 IP, blocked by firewall', src: 'Palo Alto · 10.2.4.19', sev: 'Medium', rank: 3, mitre: 'T1071', why: 'Blocked, so no data left, but something on that host is beaconing. Investigate the process soon, before it finds another route out.' },
  { id: 'd', title: 'User reported a phishing email, link not clicked', src: 'Phish report button', sev: 'Low', rank: 4, mitre: 'T1566.002', why: 'Contained by the user. Pull the same email from other inboxes and block the sender and domain.' },
  { id: 'e', title: 'Nessus: outdated OpenSSL on internal dev server', src: 'Vulnerability scan', sev: 'Medium', rank: 5, mitre: 'Vuln · CVSS 5.9', why: 'Real risk but not an active attack. Ticket it for patching within the SLA and verify with a re-scan.' },
];
export function TriageChallenge() {
  const order = useMemo(() => ['c', 'e', 'a', 'd', 'b'], []);
  const [picked, setPicked] = useState<string[]>([]);
  const [shown, setShown] = useState(false);
  const pick = (id: string) => { if (shown) return; setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id])); };
  const score = picked.reduce((n, id, i) => n + (Math.abs((alerts.find(a => a.id === id)?.rank ?? 0) - (i + 1)) <= 0 ? 1 : 0), 0);
  const close = picked.reduce((n, id, i) => n + (Math.abs((alerts.find(a => a.id === id)?.rank ?? 0) - (i + 1)) <= 1 ? 1 : 0), 0);
  const list = shown ? [...alerts].sort((x, y) => x.rank - y.rank) : order.map(id => alerts.find(a => a.id === id)!);
  return (
    <div className="lab-tri">
      <p className="lab-lead">Five alerts just hit the queue. <b>Tap them in the order you&apos;d handle them</b>, most urgent first, then compare with how I&apos;d triage.</p>
      <div className="tri-list">
        {list.map(a => {
          const n = picked.indexOf(a.id);
          const yours = n >= 0 ? n + 1 : null;
          return (
            <button key={a.id} className={'tri' + (yours ? ' on' : '') + (shown ? ' rev' : '')} onClick={() => pick(a.id)} aria-pressed={!!yours}>
              <span className="tri-n">{shown ? a.rank : yours ?? ''}</span>
              <div className="tri-b">
                <div className="tri-t"><b>{a.title}</b><span className={'sev ' + a.sev.toLowerCase()}>{a.sev}</span></div>
                <small>{a.src}{shown && <> · <em>{a.mitre}</em></>}</small>
                {shown && <p>{a.why}{yours && yours !== a.rank && <span className="tri-you"> You ranked it #{yours}.</span>}</p>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="tri-foot">
        {!shown ? (
          <>
            <span>{picked.length}/5 ranked</span>
            <button className="btn light" onClick={() => setShown(true)} disabled={picked.length < 5}>{picked.length < 5 ? 'Rank all 5 first' : 'Compare with my triage'}</button>
          </>
        ) : (
          <>
            <span><b>{score}/5</b> exact · <b>{close}/5</b> within one place</span>
            <button className="btn ghost" onClick={() => { setPicked([]); setShown(false); }}>Try again</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= 3. KubeShield hardening demo ================= */
const kubeFixes = [
  { k: 'rbac', label: 'RBAC least privilege', d: 'Service accounts scoped to their own namespace' },
  { k: 'np', label: 'NetworkPolicies', d: 'Default-deny; only frontend → api → db allowed' },
  { k: 'root', label: 'Non-root containers', d: 'runAsNonRoot and no privilege escalation' },
  { k: 'ro', label: 'Read-only filesystem', d: 'Containers cannot write to their own image' },
  { k: 'lim', label: 'Resource limits', d: 'CPU and memory capped to stop noisy neighbours' },
];
export function KubeHarden() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const onRef = useRef(on); onRef.current = on;
  const all = kubeFixes.every(f => on[f.k]);
  const score = 20 + kubeFixes.filter(f => on[f.k]).length * 16;
  useEffect(() => {
    const c = ref.current; if (!c) return; const x = c.getContext('2d'); if (!x) return;
    let raf = 0, w = 0, h = 0, t0 = performance.now();
    const size = () => { const r = devicePixelRatio || 1; w = c.clientWidth; h = c.clientHeight; c.width = w * r; c.height = h * r; x.setTransform(r, 0, 0, r, 0, 0); };
    size(); const ro = new ResizeObserver(size); ro.observe(c);
    const css = getComputedStyle(document.documentElement);
    const acc = css.getPropertyValue('--acc-rgb').trim() || '143,176,255';
    const ns = [{ name: 'frontend', pods: 3 }, { name: 'api', pods: 3 }, { name: 'database', pods: 2 }];
    const iso = (gx: number, gy: number, gz: number) => [w / 2 + (gx - gy) * Math.min(34, w / 16), h * 0.42 + (gx + gy) * Math.min(17, w / 32) - gz];
    const loop = (t: number) => {
      const f = onRef.current, k = (t - t0) / 1000;
      x.clearRect(0, 0, w, h);
      const pods: { X: number; Y: number; n: number }[] = [];
      ns.forEach((n, ni) => {
        const gx = ni * 3.1 - 3.1, gy = -ni * 0.6;
        // namespace plate
        const corners = [iso(gx - 1.3, gy - 1.3, 0), iso(gx + 1.3, gy - 1.3, 0), iso(gx + 1.3, gy + 1.3, 0), iso(gx - 1.3, gy + 1.3, 0)];
        x.beginPath(); corners.forEach(([X, Y], i) => (i ? x.lineTo(X, Y) : x.moveTo(X, Y))); x.closePath();
        x.fillStyle = `rgba(${acc},.06)`; x.fill(); x.strokeStyle = `rgba(${acc},.25)`; x.lineWidth = 1; x.stroke();
        // network-policy walls
        if (f.np) {
          x.strokeStyle = 'rgba(74,222,128,.55)'; x.lineWidth = 1.4;
          corners.forEach(([X, Y], i) => { const [X2, Y2] = corners[(i + 1) % 4]; x.beginPath(); x.moveTo(X, Y); x.lineTo(X, Y - 26); x.lineTo(X2, Y2 - 26); x.lineTo(X2, Y2); x.stroke(); });
          x.fillStyle = 'rgba(74,222,128,.05)'; x.beginPath(); corners.forEach(([X, Y], i) => (i ? x.lineTo(X, Y - 26) : x.moveTo(X, Y - 26))); x.closePath(); x.fill();
        }
        const [lx, ly] = iso(gx + 1.3, gy + 1.3, 0);
        x.fillStyle = `rgba(${acc},.9)`; x.font = '600 11px "JetBrains Mono", monospace'; x.fillText(n.name, lx - 4, ly + 16);
        for (let p = 0; p < n.pods; p++) {
          const px = gx - 0.6 + (p % 2) * 1.2, py = gy - 0.6 + Math.floor(p / 2) * 1.2;
          const bob = Math.sin(k * 1.6 + ni + p) * 1.5;
          const [X, Y] = iso(px, py, 14 + bob), s = Math.min(13, w / 42);
          const risky = !(f.root && f.ro && f.rbac);
          const col = risky ? '248,113,113' : '74,222,128';
          // cube
          x.fillStyle = `rgba(${col},.85)`; x.beginPath(); x.moveTo(X, Y - s); x.lineTo(X + s, Y - s / 2); x.lineTo(X, Y); x.lineTo(X - s, Y - s / 2); x.closePath(); x.fill();
          x.fillStyle = `rgba(${col},.55)`; x.beginPath(); x.moveTo(X - s, Y - s / 2); x.lineTo(X, Y); x.lineTo(X, Y + s); x.lineTo(X - s, Y + s / 2); x.closePath(); x.fill();
          x.fillStyle = `rgba(${col},.35)`; x.beginPath(); x.moveTo(X + s, Y - s / 2); x.lineTo(X, Y); x.lineTo(X, Y + s); x.lineTo(X + s, Y + s / 2); x.closePath(); x.fill();
          if (f.lim) { x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 0.8; x.strokeRect(X - s - 3, Y - s - 3, s * 2 + 6, s * 2 + 6); }
          pods.push({ X, Y, n: ni });
        }
      });
      // traffic: before = everything talks to everything; after = only allowed paths
      const links: [number, number][] = [];
      pods.forEach((a, i) => pods.forEach((b, j) => {
        if (j <= i) return;
        if (!f.np) { if (a.n !== b.n) links.push([i, j]); }
        else if (b.n - a.n === 1 && (i + j) % 3 === 0) links.push([i, j]);
      }));
      links.forEach(([i, j], li) => {
        const a = pods[i], b = pods[j];
        x.strokeStyle = f.np ? `rgba(${acc},.5)` : 'rgba(248,113,113,.22)'; x.lineWidth = f.np ? 1.3 : 0.7;
        x.beginPath(); x.moveTo(a.X, a.Y - 6); x.lineTo(b.X, b.Y - 6); x.stroke();
        const q = ((k * 0.5 + li * 0.13) % 1);
        x.fillStyle = f.np ? `rgba(${acc},1)` : 'rgba(248,113,113,.9)';
        x.beginPath(); x.arc(a.X + (b.X - a.X) * q, a.Y - 6 + (b.Y - a.Y) * q, 1.8, 0, 7); x.fill();
      });
      if (f.rbac) { x.fillStyle = 'rgba(74,222,128,.9)'; x.font = '600 10px "JetBrains Mono", monospace'; x.fillText('RBAC ✓ scoped', 12, h - 12); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div className="lab-kube">
      <div className="kube-stage">
        <canvas ref={ref} className="kube-canvas" role="img" aria-label="Kubernetes cluster that becomes more secure as hardening controls are switched on" />
        <div className={'kube-score' + (all ? ' ok' : '')}><small>Example security score</small><b>{score}</b><span>/100</span></div>
      </div>
      <div className="kube-side">
        <p className="lab-lead">From my <b>KubeShield Enterprise</b> project. Switch on each control and watch the cluster go from wide open to locked down.</p>
        {kubeFixes.map(fx => (
          <label key={fx.k} className={'kube-fix' + (on[fx.k] ? ' on' : '')}>
            <input type="checkbox" checked={!!on[fx.k]} onChange={e => setOn(o => ({ ...o, [fx.k]: e.target.checked }))} />
            <span className="sw" aria-hidden="true" />
            <div><b>{fx.label}</b><small>{fx.d}</small></div>
          </label>
        ))}
        <div className="kube-acts">
          <button className="btn light" onClick={() => setOn(Object.fromEntries(kubeFixes.map(f => [f.k, true])))}>Harden everything</button>
          <button className="btn ghost" onClick={() => setOn({})}>Reset</button>
        </div>
      </div>
    </div>
  );
}

/* ================= 4. Message through the firewall ================= */
const layers = ['TLS 1.3 tunnel', 'Input validation', 'Rate limit', 'Spam filter', 'Inbox'];
export function FirewallMessage({ send }: { send: (name: string, email: string, msg: string) => Promise<boolean> }) {
  const [f, setF] = useState({ name: '', email: '', msg: '', trap: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<'ok' | 'fail' | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.name.trim()) er.name = 'Enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) er.email = 'Enter a valid email';
    if (f.msg.trim().length < 10) er.msg = 'Write at least a short message';
    setErr(er); if (Object.keys(er).length) return;
    setResult(null); setStage(0);
    const ok = f.trap ? true : send(f.name.trim(), f.email.trim(), f.msg.trim().slice(0, 2000));
    layers.forEach((_, i) => timers.current.push(setTimeout(() => setStage(i), i * 650)));
    const res = await ok;
    timers.current.push(setTimeout(() => { setResult(res ? 'ok' : 'fail'); play(res ? 'access' : 'fail'); if (res) setF({ name: '', email: '', msg: '', trap: '' }); }, layers.length * 650));
  };
  const busy = stage >= 0 && result === null;
  return (
    <div className="lab-fw">
      <div className="fw-pipe" aria-hidden="true">
        {layers.map((l, i) => <div key={l} className={'fw-layer' + (stage >= i ? ' pass' : '') + (i === layers.length - 1 ? ' inbox' : '')}><i />{l}</div>)}
        <span className={'fw-packet' + (stage >= 0 ? ' go' : '')} style={{ ['--s' as string]: Math.max(0, stage) }} />
      </div>
      <form className="fw-form" onSubmit={submit} noValidate>
        <div className="fw-row">
          <label>Name<input value={f.name} onChange={e => { setF({ ...f, name: e.target.value }); setErr({ ...err, name: '' }); }} maxLength={80} autoComplete="name" />{err.name && <em>{err.name}</em>}</label>
          <label>Email<input type="email" value={f.email} onChange={e => { setF({ ...f, email: e.target.value }); setErr({ ...err, email: '' }); }} maxLength={120} autoComplete="email" />{err.email && <em>{err.email}</em>}</label>
        </div>
        <label>Message<textarea rows={3} value={f.msg} onChange={e => { setF({ ...f, msg: e.target.value }); setErr({ ...err, msg: '' }); }} maxLength={2000} placeholder="Hi Siddharth, we're hiring for a Security Engineer…" />{err.msg && <em>{err.msg}</em>}</label>
        <input className="fw-trap" tabIndex={-1} autoComplete="off" value={f.trap} onChange={e => setF({ ...f, trap: e.target.value })} aria-hidden="true" />
        <div className="fw-foot">
          <button className="btn light" type="submit" disabled={busy}>{busy ? `Passing ${layers[Math.max(0, stage)]}…` : 'Send securely'}</button>
          {result === 'ok' && <span className="fw-ok">✓ Delivered. I&apos;ll reply by email.</span>}
          {result === 'fail' && <span className="fw-bad">Couldn&apos;t send right now. Email me directly instead.</span>}
        </div>
      </form>
    </div>
  );
}

/* ================= 5. Cipher reveal for section headings ================= */
const glyphs = 'ABCDEF0123456789#$%&@<>/\\{}[]';
export function useCipherHeadings(selector: string) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const walker = document.createTreeWalker(en.target, NodeFilter.SHOW_TEXT);
        const nodes: { n: Text; orig: string }[] = [];
        while (walker.nextNode()) { const n = walker.currentNode as Text; if (n.data.trim()) nodes.push({ n, orig: n.data }); }
        const start = performance.now(), dur = 900;
        const tick = (t: number) => {
          const k = Math.min(1, (t - start) / dur);
          let idx = 0; const totalLen = nodes.reduce((s, x) => s + x.orig.length, 0);
          nodes.forEach(({ n, orig }) => {
            n.data = orig.split('').map(ch => { const i = idx++; return ch === ' ' || i / totalLen < k ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]; }).join('');
          });
          if (k < 1) requestAnimationFrame(tick); else nodes.forEach(({ n, orig }) => { n.data = orig; });
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, [selector]);
}

/* ================= 6. Hidden CTF for curious engineers ================= */
export function useConsoleCtf(onHire: () => void, onSolve: () => void) {
  const cb = useRef({ onHire, onSolve }); cb.current = { onHire, onSolve };
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    const flag = 'flag{d3f3nd_by_d3s1gn}';
    const accent = 'color:#9db8ff;font:600 13px monospace';
    console.log('%c🛡  Hi, engineer. You opened the console, so you are my kind of recruiter.', 'color:#e6eefc;font:700 14px sans-serif');
    console.log('%cType hire() to book a call, or find the hidden flag and run submitFlag("flag{...}").', accent);
    console.log('%cHint: the flag is base64-encoded somewhere in this page\'s <head>.', 'color:#8ea3c4;font:12px monospace');
    w.hire = () => { cb.current.onHire(); return 'Opening the booking calendar…'; };
    w.submitFlag = (v: string) => {
      if (String(v).trim() === flag) { cb.current.onSolve(); return '✓ Correct. Nice work. You have unlocked my direct line.'; }
      return '✕ Not quite. Check the meta tags in <head>.';
    };
    return () => { delete w.hire; delete w.submitFlag; };
  }, []);
}

/* ================= 7. Personal company links (?for=google&role=soc) ================= */
const roleKeys: Record<string, string> = { security: 'Security Engineer', pentest: 'Penetration Tester', soc: 'SOC Analyst', cloud: 'Cloud Security', devsecops: 'DevSecOps Engineer', appsec: 'Application Security' };
export function useCompanyLink() {
  const [ctx, setCtx] = useState<{ company: string; role: string | null } | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const raw = (q.get('for') || '').replace(/[^a-zA-Z0-9 &.\-]/g, '').trim().slice(0, 32);
    const role = roleKeys[(q.get('role') || '').toLowerCase()] ?? null;
    if (raw) setCtx({ company: raw.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), role });
    else if (role) setCtx({ company: '', role });
  }, []);
  return ctx;
}
