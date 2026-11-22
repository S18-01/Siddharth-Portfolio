'use client';

/* Third batch of trial features. */
import { isValidElement, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { resumeSig } from './resumeSig';
import { play } from './sound';

/* Flatten JSX bullet points into plain text */
export function textOf(n: ReactNode): string {
  if (n == null || typeof n === 'boolean') return '';
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (isValidElement(n)) return textOf((n.props as { children?: ReactNode }).children);
  return '';
}

/* ================= Tamper-proof resume ================= */
const b64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
export function VerifyResume({ url }: { url: string }) {
  const [st, setSt] = useState<'idle' | 'busy' | 'ok' | 'bad' | 'err'>('idle');
  const [hash, setHash] = useState('');
  const run = async () => {
    setSt('busy');
    try {
      const buf = await (await fetch(url, { cache: 'no-store' })).arrayBuffer();
      const h = hex(await crypto.subtle.digest('SHA-256', buf)); setHash(h);
      const key = await crypto.subtle.importKey('jwk', { ...resumeSig.publicKey, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64(resumeSig.signature), buf);
      setTimeout(() => { setSt(ok ? 'ok' : 'bad'); play(ok ? 'access' : 'fail'); }, 700);
    } catch { setSt('err'); }
  };
  const date = new Date(resumeSig.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className={'vfy ' + st}>
      <div className="vfy-seal" aria-hidden="true"><span>{st === 'ok' ? '✓' : st === 'bad' ? '✕' : '🔏'}</span></div>
      <div className="vfy-body">
        <small className="pc-k">Tamper-proof resume</small>
        <b>{st === 'ok' ? `Authentic · unmodified since ${date}` : st === 'bad' ? 'Signature does not match: this file was changed' : st === 'err' ? 'Could not run the check. Try again.' : st === 'busy' ? 'Verifying ECDSA P-256 signature…' : 'My resume is digitally signed'}</b>
        <span>{st === 'ok' || st === 'bad' ? <>SHA-256 <code>{hash.slice(0, 16)}…{hash.slice(-8)}</code> checked in your browser with Web Crypto.</> : 'Verify it yourself: your browser downloads the PDF, hashes it and checks my signature. Nothing is sent anywhere.'}</span>
      </div>
      <button className="btn light" onClick={run} disabled={st === 'busy'}>{st === 'ok' || st === 'bad' ? 'Verify again' : 'Verify'}</button>
    </div>
  );
}

/* ================= Try-the-hack sandbox (client-side only) ================= */
const users = [{ u: 'admin', p: 'S3cure!Pass', role: 'Administrator' }, { u: 'alice', p: 'wonderland', role: 'Analyst' }];
export function HackSandbox() {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [fixed, setFixed] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; msg: string; query: string } | null>(null);
  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!u && !p) { setRes({ ok: false, msg: 'Enter a username or try the hint', query: '' }); return; }
    if (fixed) {
      const hit = users.find(x => x.u === u && x.p === p);
      setRes({ ok: !!hit, msg: hit ? `Welcome ${hit.u}` : 'Login failed. The payload was treated as plain text.', query: "SELECT * FROM users WHERE username = ? AND password = ?   -- params: [" + JSON.stringify(u) + ', ' + JSON.stringify(p) + ']' });
      return;
    }
    const q = `SELECT * FROM users WHERE username = '${u}' AND password = '${p}'`;
    const inj = /'\s*(or|OR)\s*'?1'?\s*=\s*'?1|'\s*--|'\s*#|'\s*or\s+true/i.test(u + ' ' + p);
    const hit = users.find(x => x.u === u && x.p === p);
    if (inj) play('alarm');
    setRes(inj ? { ok: true, msg: 'Logged in as admin (Administrator) without the password!', query: q } : { ok: !!hit, msg: hit ? `Welcome ${hit.u}` : 'Invalid username or password', query: q });
  };
  return (
    <div className="lab-hack">
      <p className="lab-lead">A fake login that runs only in your browser. <b>Try to log in as admin without the password</b>, then switch on my fix and try again.</p>
      <div className="hk-grid">
        <form className={'hk-login' + (fixed ? ' fixed' : '')} onSubmit={tryLogin}>
          <div className="hk-bar"><i /><i /><i /><span>{fixed ? 'bank-portal (patched)' : 'bank-portal (vulnerable)'}</span></div>
          <label>Username<input value={u} onChange={e => setU(e.target.value)} autoComplete="off" spellCheck={false} /></label>
          <label>Password<input value={p} onChange={e => setP(e.target.value)} autoComplete="off" spellCheck={false} /></label>
          <button className="btn light" type="submit">Log in</button>
          <button type="button" className="hk-hint" onClick={() => { setU("admin' --"); setP('anything'); }}>Hint: fill in a classic payload</button>
          {res && <div className={'hk-res ' + (res.ok ? (fixed ? 'ok' : 'pwn') : 'no')}>{res.msg}</div>}
        </form>
        <div className="hk-code">
          <div className="hk-tog"><button className={!fixed ? 'on' : ''} onClick={() => { setFixed(false); setRes(null); }}>Vulnerable code</button><button className={fixed ? 'on' : ''} onClick={() => { setFixed(true); setRes(null); }}>My fix</button></div>
          <pre>{fixed
            ? `# Parameterized query: input is data, never code\ncur.execute(\n  "SELECT * FROM users WHERE username = %s AND password_hash = %s",\n  (username, bcrypt_hash(password))\n)`
            : `# String concatenation: input becomes part of the SQL\nquery = "SELECT * FROM users WHERE username = '" \\\n        + username + "' AND password = '" + password + "'"\ncur.execute(query)`}</pre>
          <small>Query your input produced</small>
          <code className="hk-q">{res?.query || '…'}</code>
          {res && !fixed && res.ok && <p className="hk-why">The <code>&apos; --</code> closed the string and commented out the password check. This is SQL injection (OWASP A03).</p>}
        </div>
      </div>
    </div>
  );
}

/* ================= Career as a git log ================= */
type Job = { role: string; org: string; date: string; points: ReactNode[]; tools: string[] };
export function GitLog({ jobs, projects }: { jobs: Job[]; projects: { title: string; tag: string }[] }) {
  const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7); };
  const commits = jobs.flatMap(j => [
    { type: 'feat', msg: `joined ${j.org} as ${j.role}`, date: j.date, branch: 'main', tag: true },
    ...j.points.slice(0, 2).map(pt => { const t = textOf(pt).replace(/\.$/, ''); return { type: /fix|remediat|patch|clos/i.test(t) ? 'fix' : 'chore', msg: t.charAt(0).toLowerCase() + t.slice(1, 92) + (t.length > 92 ? '…' : ''), date: j.date, branch: 'main', tag: false }; }),
  ]);
  return (
    <div className="glog">
      <div className="glog-head"><span>$ git log --graph --oneline career</span><span className="glog-b">main · {commits.length + projects.length} commits</span></div>
      <ol>
        {projects.map(p => (
          <li key={p.title} className="br"><i className="dot" /><span className="h">{hash(p.title)}</span><span className="ty feat">feat(project)</span><span className="m">ship {p.title}: {p.tag.toLowerCase()}</span><span className="tagb">branch: projects</span></li>
        ))}
        {commits.map((c, i) => (
          <li key={i} className={c.tag ? 'tagged' : ''}><i className="dot" /><span className="h">{hash(c.msg + i)}</span><span className={'ty ' + c.type}>{c.type}</span><span className="m">{c.msg}</span>{c.tag && <span className="tagb">{c.date}</span>}</li>
        ))}
        <li className="init"><i className="dot" /><span className="h">0000001</span><span className="ty chore">init</span><span className="m">curiosity about how systems break</span></li>
      </ol>
    </div>
  );
}

/* ================= Hall of fame ================= */
export function HallOfFame() {
  return (
    <div className="hof">
      <div className="hof-l">
        <small className="pc-k">Responsible disclosure</small>
        <h3>Found a bug in this site? <em>Get credited.</em></h3>
        <p>I practice what I preach: this portfolio publishes a <a href="/.well-known/security.txt" target="_blank" rel="noopener">security.txt</a>. Report a real vulnerability responsibly and I&apos;ll fix it and list you here.</p>
        <ul><li>In scope: this site and its forms</li><li>Out of scope: denial of service, social engineering, third-party services</li><li>Please don&apos;t access other people&apos;s data</li></ul>
      </div>
      <div className="hof-r">
        <div className="hof-slot first"><span>🥇</span><b>Your name here</b><small>Be the first researcher credited</small></div>
        <div className="hof-slot"><span>🥈</span><b>Open</b></div>
        <div className="hof-slot"><span>🥉</span><b>Open</b></div>
        <a className="btn light" href="#contact">Report a finding</a>
      </div>
    </div>
  );
}

/* ================= AR business card (camera + device tilt) ================= */
export function ArCard({ img, name }: { img: string; name: string }) {
  const vid = useRef<HTMLVideoElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!on) return;
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (vid.current) { vid.current.srcObject = stream; await vid.current.play(); }
      } catch { setErr('Camera not available. You can still tilt or drag the card.'); }
    })();
    const ori = (e: DeviceOrientationEvent) => { const el = card.current; if (!el || e.beta == null || e.gamma == null) return; el.style.setProperty('--rx', `${Math.max(-30, Math.min(30, e.beta - 45)) * -0.8}deg`); el.style.setProperty('--ry', `${Math.max(-30, Math.min(30, e.gamma)) * 0.9}deg`); };
    addEventListener('deviceorientation', ori);
    return () => { removeEventListener('deviceorientation', ori); stream?.getTracks().forEach(t => t.stop()); };
  }, [on]);
  const move = (e: React.PointerEvent) => { const el = card.current, r = (e.currentTarget as HTMLElement).getBoundingClientRect(); if (!el) return; el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 40}deg`); el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -30}deg`); };
  return (
    <div className="arc">
      <div className="arc-l">
        <small className="pc-k">AR business card</small>
        <h3>Meet me <em>in your room.</em></h3>
        <p>On a phone, this opens your camera and floats my 3D card in front of you; tilt the phone to look around it. Great for career fairs: the QR on my printed resume opens this.</p>
        {!on ? <button className="btn light" onClick={() => { setErr(''); setOn(true); }}>Launch AR card</button> : <button className="btn ghost" onClick={() => setOn(false)}>Close camera</button>}
        {err && <p className="lab-err">{err}</p>}
      </div>
      <div className={'arc-view' + (on ? ' live' : '')} onPointerMove={move}>
        <video ref={vid} muted playsInline aria-hidden="true" />
        <div className="arc-card" ref={card}>
          <div className="arc-face">
            <img src={img} alt="" />
            <div><b>{name}</b><span>Security Engineer</span><span>Open to relocation</span></div>
          </div>
          <div className="arc-shadow" />
        </div>
      </div>
    </div>
  );
}

/* ================= Recruiter mode ================= */
type Rec = { name: string; title: string; location: string; roles: string[]; jobs: Job[]; projects: { title: string; tag: string; live?: string; repo?: string }[]; certs: { title: string; status: string }[]; edu: string; onClose: () => void; onBook: () => void; onResume: () => void; email: string; linkedin: string };
export function RecruiterMode(r: Rec) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') r.onClose(); }; addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="rm" role="dialog" aria-modal="true" aria-label="Recruiter summary">
      <div className="rm-in">
        <header className="rm-h">
          <div><h2>{r.name}</h2><p>{r.title} · {r.location} · <b>Open to relocation</b></p></div>
          <button className="btn ghost" onClick={r.onClose}>Exit recruiter mode</button>
        </header>
        <div className="rm-cta"><button className="btn light" onClick={r.onBook}>Book a call</button><button className="btn ghost" onClick={r.onResume}>View resume</button><a className="btn ghost" href={`mailto:${r.email}`}>Email</a><a className="btn ghost" href={r.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></div>
        <section><h3>Target roles</h3><div className="rm-tags">{r.roles.map(x => <span key={x}>{x}</span>)}</div></section>
        <section><h3>Experience</h3>{r.jobs.map(j => <div key={j.role + j.org} className="rm-job"><div><b>{j.role}</b> · {j.org}</div><small>{j.date}</small><p>{textOf(j.points[0])}</p></div>)}</section>
        <section><h3>Top projects</h3>{r.projects.map(p => <div key={p.title} className="rm-job"><div><b>{p.title}</b> · {p.tag}</div>{(p.live || p.repo) && <small>{p.live && <a href={p.live} target="_blank" rel="noopener noreferrer">Live</a>}{p.live && p.repo && ' · '}{p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer">Code</a>}</small>}</div>)}</section>
        <section className="rm-two"><div><h3>Certifications</h3><ul>{r.certs.map(c => <li key={c.title}>{c.title} <small>({c.status})</small></li>)}</ul></div><div><h3>Education</h3><p>{r.edu}</p></div></section>
        <p className="rm-foot">30-second view. Exit to see the full interactive portfolio.</p>
      </div>
    </div>
  );
}
