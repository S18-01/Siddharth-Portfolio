#!/usr/bin/env python3
"""
Turns Cowrie's JSON log into a small public feed for the portfolio.

Run every minute from cron on the honeypot server:
    * * * * * /usr/bin/python3 /opt/feed/export_feed.py >> /opt/feed/export.log 2>&1

Inputs : COWRIE_LOG  (default /home/cowrie/cowrie/var/log/cowrie/cowrie.json)
         GEOIP_DB    (optional MaxMind GeoLite2-City.mmdb; pip install geoip2)
Output : FEED_OUT    (default /var/www/feed/feed.json), served over HTTPS with CORS
Privacy: IPs are masked to first + last octet; payload URLs are redacted.
"""
import json, os, re, datetime as dt
from collections import Counter, defaultdict

LOG = os.environ.get('COWRIE_LOG', '/home/cowrie/cowrie/var/log/cowrie/cowrie.json')
OUT = os.environ.get('FEED_OUT', '/var/www/feed/feed.json')
GEO = os.environ.get('GEOIP_DB', '/opt/feed/GeoLite2-City.mmdb')
MAX_EVENTS = 40

try:
    import geoip2.database
    reader = geoip2.database.Reader(GEO) if os.path.exists(GEO) else None
except ImportError:
    reader = None

def geo(ip):
    if reader:
        try:
            r = reader.city(ip)
            return r.country.iso_code or '??', r.country.name or 'Unknown', r.location.latitude or 0, r.location.longitude or 0
        except Exception:
            pass
    return '??', 'Unknown', 0, 0

def mask(ip):
    p = ip.split('.')
    return f'{p[0]}.xx.xx.{p[-1]}' if len(p) == 4 else 'xxxx'

def clean(cmd):
    cmd = re.sub(r'https?://[^\s;|]+', 'http://[redacted]', cmd)
    cmd = re.sub(r'ssh-(rsa|ed25519) \S+', r'ssh-\1 AAAA…', cmd)
    return cmd[:160]

now = dt.datetime.now(dt.timezone.utc)
since = now - dt.timedelta(hours=24)
sessions = defaultdict(lambda: {'cmds': [], 'ok': False, 'user': '', 'pass': '', 'ip': '', 'ts': ''})

with open(LOG, encoding='utf-8', errors='ignore') as f:
    for line in f:
        try:
            e = json.loads(line)
        except ValueError:
            continue
        ts = e.get('timestamp', '')
        try:
            t = dt.datetime.fromisoformat(ts.replace('Z', '+00:00'))
        except ValueError:
            continue
        if t < since:
            continue
        s = sessions[e.get('session', '')]
        s['ip'] = e.get('src_ip', s['ip']); s['ts'] = s['ts'] or ts
        ev = e.get('eventid', '')
        if ev in ('cowrie.login.success', 'cowrie.login.failed'):
            s['user'], s['pass'] = e.get('username', ''), e.get('password', '')
            s['ok'] = s['ok'] or ev == 'cowrie.login.success'
        elif ev == 'cowrie.command.input':
            s['cmds'].append(clean(e.get('input', '')))

attempts = [s for s in sessions.values() if s['user'] or s['cmds']]
events = []
for s in sorted(attempts, key=lambda s: s['ts'])[-MAX_EVENTS:]:
    cc, country, lat, lon = geo(s['ip'])
    events.append({'ts': s['ts'], 'ip': mask(s['ip']), 'cc': cc, 'country': country, 'lat': lat, 'lon': lon,
                   'user': s['user'][:32], 'pass': s['pass'][:32], 'ok': s['ok'], 'cmds': s['cmds'][:6]})

countries = Counter(geo(s['ip'])[1] for s in attempts)
passwords = Counter(s['pass'] for s in attempts if s['pass'])
feed = {
    'updated': now.isoformat(),
    'events': events,
    'stats': {'today': len(attempts), 'uniqueIps': len({s['ip'] for s in attempts}),
              'countries': countries.most_common(5), 'passwords': passwords.most_common(5)},
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
tmp = OUT + '.tmp'
with open(tmp, 'w') as f:
    json.dump(feed, f)
os.replace(tmp, OUT)
print(now.isoformat(), 'wrote', len(events), 'events')
