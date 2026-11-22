'use client';

/* Who's watching (profile gate), Career Wrapped (story cards) and Time machine (year slider). Real resume data only. */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { play } from './sound';

/* ================= Who's watching ================= */
export type Profile = 'recruiter' | 'manager' | 'engineer';
const profiles: { k: Profile; name: string; sub: string; ico: ReactNode; c: string }[] = [
  { k: 'recruiter', name: 'Recruiter', sub: 'The 60-second version', c: '#60a5fa', ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></svg> },
  { k: 'manager', name: 'Hiring manager', sub: 'Proof of skill first', c: '#4ade80', ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="m9 12 2 2 4-4" /></svg> },
  { k: 'engineer', name: 'Engineer', sub: 'Everything, all the toys', c: '#c084fc', ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M13 6l-2 12" /></svg> },
];
export function applyProfile(p: Profile | null) { if (p) document.documentElement.dataset.profile = p; else delete document.documentElement.dataset.profile; }
export function WhosWatching({ open, onPick, onSkip }: { open: boolean; onPick: (p: Profile) => void; onSkip: () => void }) {
  const [leaving, setLeaving] = useState<Profile | null>(null);
  if (!open) return null;
  const pick = (p: Profile) => { setLeaving(p); play('access'); setTimeout(() => { onPick(p); setLeaving(null); }, 650); };
  return (
    <div className={'ww' + (leaving ? ' out' : '')} role="dialog" aria-modal="true" aria-label="Choose how you want to view this portfolio">
      <div className="ww-in">
        <small className="ww-brand">SIDDHARTH MURAGUNDLA · SECURITY ENGINEER</small>
        <h2>Who&apos;s watching?</h2>
        <div className="ww-row">
          {profiles.map(p => (
            <button key={p.k} className={'ww-p' + (leaving === p.k ? ' sel' : '')} onClick={() => pick(p.k)} style={{ ['--pc' as string]: p.c }}>
              <span className="ww-av">{p.ico}</span>
              <b>{p.name}</b><small>{p.sub}</small>
            </button>
          ))}
        </div>
        <button className="ww-skip" onClick={onSkip}>Skip, show me everything</button>
      </div>
    </div>
  );
}
export function ProfileBar({ profile, onSwitch, onWrapped, onResume, onBook }: { profile: Profile | null; onSwitch: () => void; onWrapped: () => void; onResume: () => void; onBook: () => void }) {
  if (!profile) return (
    <div className="pbar none"><div className="pbar-t"><b>Viewing everything</b><span>Pick a profile for a tailored tour, or watch the 30-second summary.</span></div><div className="pbar-a"><button className="btn light" onClick={onWrapped}>▶ Career Wrapped</button><button className="pbar-sw" onClick={onSwitch}>Choose a profile</button></div></div>
  );
  const p = profiles.find(x => x.k === profile)!;
  const lines: Record<Profile, string> = {
    recruiter: 'Showing the quick version: summary, experience, resume and how to reach me.',
    manager: 'Showing proof first: projects, the hands-on lab, live threat feed and experience.',
    engineer: 'Showing everything: the 3D city, lab tools, Sigma rules, CTF and more.',
  };
  return (
    <div className="pbar" style={{ ['--pc' as string]: p.c }}>
      <span className="pbar-av">{p.ico}</span>
      <div className="pbar-t"><b>Viewing as {p.name}</b><span>{lines[profile]}</span></div>
      <div className="pbar-a">
        {profile === 'recruiter' && <><button className="btn light" onClick={onWrapped}>▶ Career Wrapped</button><button className="btn ghost" onClick={onResume}>Resume</button><button className="btn ghost" onClick={onBook}>Book a call</button></>}
        {profile !== 'recruiter' && <button className="btn ghost" onClick={onWrapped}>▶ Career Wrapped</button>}
        <button className="pbar-sw" onClick={onSwitch}>Switch profile</button>
      </div>
    </div>
  );
}

/* ================= Career Wrapped ================= */
type Job = { role: string; org: string; date: string; tools: string[] };
type WrapData = { jobs: Job[]; projects: { title: string; tag: string }[]; skillCount: number; certs: { title: string; status: string }[]; wins: { title: string; date: string }[] };
export function CareerWrapped({ open, onClose, data, onBook }: { open: boolean; onClose: () => void; data: WrapData; onBook: () => void }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const t0 = useRef(0), acc = useRef(0);
  const [prog, setProg] = useState(0);
  const tool = useMemo(() => {
    const c: Record<string, number> = {}; data.jobs.forEach(j => new Set(j.tools).forEach(t => { c[t] = (c[t] || 0) + 1; }));
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0] || ['Nmap', 1];
  }, [data.jobs]);
  const firstYear = useMemo(() => Math.min(...data.jobs.map(j => +(j.date.match(/\d{4}/)?.[0] || 9999))), [data.jobs]);
  const cards: { bg: string; body: ReactNode }[] = [
    { bg: 'linear-gradient(160deg,#1e1b4b,#7c3aed 60%,#ec4899)', body: <><small>Siddharth&apos;s</small><h3 className="big">Career<br />Wrapped</h3><p>{firstYear} → 2026 · tap to continue</p></> },
    { bg: 'linear-gradient(160deg,#052e16,#16a34a 55%,#a3e635)', body: <><small>Years in cybersecurity</small><h3 className="num">4+</h3><p>From leading a student security club to enterprise security engineering.</p></> },
    { bg: 'linear-gradient(160deg,#0c4a6e,#0284c7 55%,#22d3ee)', body: <><small>Roles held</small><h3 className="num">{data.jobs.length}</h3><ul className="wl">{[...data.jobs].reverse().map((j, k) => <li key={j.role} style={{ animationDelay: `${0.2 + k * 0.15}s` }}><b>{j.role}</b><span>{j.org.split(',')[0]} · {j.date}</span></li>)}</ul></> },
    { bg: 'linear-gradient(160deg,#431407,#ea580c 55%,#facc15)', body: <><small>Top tool</small><h3 className="big">{tool[0]}</h3><p>Used in {tool[1]} of my {data.jobs.length} roles. Recon is where every assessment starts.</p></> },
    { bg: 'linear-gradient(160deg,#3b0764,#9333ea 55%,#f472b6)', body: <><small>Tools and skills in my stack</small><h3 className="num">{data.skillCount}</h3><p>Across offense, defense, cloud, DevSecOps and machine learning.</p></> },
    { bg: 'linear-gradient(160deg,#450a0a,#dc2626 45%,#2563eb)', body: <><small>Your security personality</small><h3 className="big">Red <span>+</span> Blue</h3><p>I test like an attacker (Burp Suite, Metasploit) and respond like a defender (Splunk, ELK, MITRE ATT&amp;CK).</p></> },
    { bg: 'linear-gradient(160deg,#111827,#334155 50%,#64748b)', body: <><small>Projects shipped</small><h3 className="num">{data.projects.length}</h3><ul className="wl">{data.projects.map((p, k) => <li key={p.title} style={{ animationDelay: `${0.2 + k * 0.15}s` }}><b>{p.title}</b><span>{p.tag}</span></li>)}</ul></> },
    { bg: 'linear-gradient(160deg,#422006,#ca8a04 55%,#fde047)', body: <><small>Wins and credentials</small><ul className="wl">{data.wins.slice(0, 2).map((w, k) => <li key={w.title} style={{ animationDelay: `${0.15 + k * 0.15}s` }}><b>🏆 {w.title}</b><span>{w.date}</span></li>)}{data.certs.map((c, k) => <li key={c.title} style={{ animationDelay: `${0.45 + k * 0.15}s` }}><b>{c.title}</b><span>{c.status}</span></li>)}</ul></> },
    { bg: 'linear-gradient(160deg,#020617,#1e3a8a 50%,#3b82f6)', body: <><small>Next chapter</small><h3 className="big">Your team?</h3><p>Open to Security Engineer, Pentest, SOC, Cloud and DevSecOps roles. Based in Maryland, open to relocation.</p><div className="wr-acts"><button className="wr-btn" onClick={e => { e.stopPropagation(); onClose(); onBook(); }}>Book a call</button><button className="wr-btn ghost" onClick={async e => { e.stopPropagation(); const url = `${location.origin}/?wrapped=1`; try { if (navigator.share) await navigator.share({ title: "Siddharth's Career Wrapped", url }); else { await navigator.clipboard.writeText(url); setCopied(true); } } catch { /* share cancelled */ } }}>{copied ? 'Link copied ✓' : 'Share'}</button></div></> },
  ];
  const DUR = 5200;
  useEffect(() => { if (open) { setI(0); acc.current = 0; play('access'); } }, [open]);
  useEffect(() => {
    if (!open) return;
    let raf = 0; t0.current = performance.now();
    const tick = (t: number) => {
      const k = paused ? acc.current : acc.current + (t - t0.current);
      if (paused) t0.current = t;
      const p = Math.min(1, k / DUR); setProg(p);
      if (p >= 1) { if (i < cards.length - 1) { acc.current = 0; setI(v => v + 1); return; } }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { if (!paused) acc.current += performance.now() - t0.current; cancelAnimationFrame(raf); };
  }, [open, i, paused]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { acc.current = 0; setProg(0); }, [i]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }); // eslint-disable-line react-hooks/exhaustive-deps
  const go = (d: number) => { setI(v => Math.max(0, Math.min(cards.length - 1, v + d))); play('click'); };
  const sx = useRef(0);
  if (!open) return null;
  const c = cards[i];
  return (
    <div className="wr" role="dialog" aria-modal="true" aria-label="Career Wrapped">
      <div className="wr-card" style={{ background: c.bg }} key={i}
        onPointerDown={e => { sx.current = e.clientX; setPaused(true); }}
        onPointerUp={e => { setPaused(false); const dx = e.clientX - sx.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); else { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); go(e.clientX - r.left < r.width * 0.3 ? -1 : 1); } }}
        onPointerCancel={() => setPaused(false)}>
        <div className="wr-bars">{cards.map((_, k) => <i key={k}><em style={{ transform: `scaleX(${k < i ? 1 : k === i ? prog : 0})` }} /></i>)}</div>
        <div className="wr-top"><span>SM · Career Wrapped</span><button onClick={e => { e.stopPropagation(); onClose(); }} onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()} aria-label="Close">✕</button></div>
        <div className="wr-body">{c.body}</div>
        <div className="wr-blob a" /><div className="wr-blob b" />
      </div>
      <button className="wr-nav l" onClick={() => go(-1)} aria-label="Previous card" disabled={i === 0}>‹</button>
      <button className="wr-nav r" onClick={() => go(1)} aria-label="Next card" disabled={i === cards.length - 1}>›</button>
    </div>
  );
}

/* ================= Time machine ================= */
type TMJob = { role: string; org: string; date: string; tools: string[] };
const mon: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const parse = (s: string) => { const m = s.trim().match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/); return m ? +m[2] + (mon[m[1].toLowerCase()] ?? 0) / 12 : NaN; };
export function TimeMachine({ jobs, wins, projects, projectYear }: { jobs: TMJob[]; wins: { title: string; date: string }[]; projects: { title: string; stack: string[] }[]; projectYear: number }) {
  const spans = useMemo(() => jobs.map(j => { const [a, b] = j.date.split(/[–-]/); return { ...j, from: parse(a), to: parse(b) || 2027 }; }).sort((a, b) => a.from - b.from), [jobs]);
  const start = Math.floor(Math.min(...spans.map(s => s.from))), end = 2026;
  const [y, setY] = useState(start);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return; let raf = 0, last = performance.now();
    const step = (t: number) => { const dt = (t - last) / 1000; last = t; setY(v => { const n = v + dt * 0.9; if (n >= end + 0.99) { setPlaying(false); return end + 0.99; } return n; }); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [playing]);
  const yr = Math.min(end, Math.floor(y));
  const now = y;
  const active = spans.filter(s => s.from <= now && now < s.to + 1 / 12);
  const events = useMemo(() => {
    const ev: { at: number; t: string; k: 'tjob' | 'tend' | 'twin' | 'tproj' }[] = [];
    spans.forEach(s => { ev.push({ at: s.from, t: `Started as ${s.role} · ${s.org.split(',')[0]}`, k: 'tjob' }); if (s.to < 2027) ev.push({ at: s.to, t: `Completed ${s.role}`, k: 'tend' }); });
    wins.forEach(w => { const a = parse(w.date); if (!isNaN(a)) ev.push({ at: a, t: `🏆 ${w.title}`, k: 'twin' }); });
    projects.forEach(p => ev.push({ at: projectYear, t: `Built ${p.title}`, k: 'tproj' }));
    return ev.sort((a, b) => a.at - b.at);
  }, [spans, wins, projects, projectYear]);
  const shown = events.filter(e => e.at <= now);
  const tools = useMemo(() => [...new Set([...spans.filter(s => s.from <= now).flatMap(s => s.tools), ...(now >= projectYear ? projects.flatMap(p => p.stack) : [])])], [now, spans, projects, projectYear]);
  const years = Array.from({ length: end - start + 1 }, (_, k) => start + k);
  return (
    <div className="tm">
      <div className="tm-head">
        <div><small className="pc-k">Time machine</small><h3>Watch my career <em>level up</em></h3><p>Drag through the years or press play.</p></div>
        <div className="tm-year" aria-live="polite"><b key={yr}>{yr}</b></div>
      </div>
      <div className="tm-ctl">
        <button className="btn light" onClick={() => { if (y >= end + 0.9) setY(start); setPlaying(p => !p); }}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
        <div className="tm-track">
          <input type="range" min={start} max={end + 0.99} step={0.01} value={y} onChange={e => { setPlaying(false); setY(+e.target.value); }} aria-label="Year" />
          <div className="tm-ticks">{years.map(v => <span key={v} className={v <= yr ? 'on' : ''}>{v}</span>)}</div>
          <div className="tm-spans">{spans.map(s => <i key={s.role} title={s.role} className={active.includes(s) ? 'on' : ''} style={{ left: `${((s.from - start) / (end + 1 - start)) * 100}%`, width: `${((Math.min(s.to, end + 1) - s.from) / (end + 1 - start)) * 100}%` }} />)}</div>
        </div>
      </div>
      <div className="tm-grid">
        <div className="tm-now">
          <small>In {yr}</small>
          {active.length ? active.map(s => <div key={s.role} className="tm-role"><b>{s.role}</b><span>{s.org}</span><em>{s.date}</em></div>) : <div className="tm-role dim"><b>{now >= projectYear ? 'Master’s at UMD · building projects' : 'Between roles'}</b></div>}
          <div className="tm-stats"><div><b>{spans.filter(s => s.from <= now).length}</b><span>roles</span></div><div><b>{tools.length}</b><span>tools</span></div><div><b>{shown.filter(e => e.k === 'twin').length}</b><span>wins</span></div></div>
        </div>
        <div className="tm-tools"><small>Skills unlocked</small><div>{tools.map(t => <span key={t}>{t}</span>)}</div></div>
        <ol className="tm-log">{shown.slice().reverse().slice(0, 7).map(e => <li key={e.t + e.at} className={e.k}><span>{Math.floor(e.at)}</span>{e.t}</li>)}</ol>
      </div>
    </div>
  );
}
