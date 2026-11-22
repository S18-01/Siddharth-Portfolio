# Live honeypot setup (Cowrie → portfolio)

Goal: a small, isolated decoy SSH server that attackers find on their own. Its log is turned into a
public, anonymized `feed.json` that the portfolio's "Live honeypot" section and the 3D city read.

Time: about 1–2 hours. Cost: a $5–6/month VPS.

## 0. Safety rules (read first)
- Use a **brand-new VPS** used for nothing else. No personal files, keys, tokens or VPN on it.
- Use a separate cloud account or project, with billing alerts turned on.
- Never reuse a password from anywhere else. Log in with an SSH key only.
- Cowrie is a fake shell: attackers never get a real shell. Keep it patched, and rebuild the server if anything looks wrong.
- Check your cloud provider's terms. Most allow honeypots, and some ask you to tell them.
- Publish masked data only. The exporter already masks IPs and removes payload URLs.

## 1. Create the server
Any provider works (DigitalOcean, Hetzner, Vultr, AWS Lightsail). Pick Ubuntu 24.04, the smallest size, and an SSH key.

## 2. Move your real SSH off port 22
```bash
sudo sed -i 's/^#\?Port .*/Port 22222/' /etc/ssh/sshd_config
sudo systemctl restart ssh
# reconnect: ssh -p 22222 root@SERVER_IP
sudo ufw allow 22222/tcp && sudo ufw allow 22/tcp && sudo ufw allow 443/tcp && sudo ufw enable
```

## 3. Run Cowrie (Docker is easiest)
```bash
sudo apt update && sudo apt install -y docker.io python3-pip
sudo mkdir -p /opt/cowrie/var && sudo chown 999:999 /opt/cowrie/var
sudo docker run -d --name cowrie --restart unless-stopped \
  -p 22:2222 -v /opt/cowrie/var:/cowrie/cowrie-git/var cowrie/cowrie:latest
# log file: /opt/cowrie/var/log/cowrie/cowrie.json
```
Within a few hours, bots will start logging in.

## 4. Export the feed every minute
```bash
sudo mkdir -p /opt/feed /var/www/feed
sudo cp export_feed.py /opt/feed/
sudo pip3 install geoip2 --break-system-packages   # optional, for countries on the globe
# optional: free MaxMind account → download GeoLite2-City.mmdb to /opt/feed/
echo '* * * * * root COWRIE_LOG=/opt/cowrie/var/log/cowrie/cowrie.json /usr/bin/python3 /opt/feed/export_feed.py >> /opt/feed/export.log 2>&1' | sudo tee /etc/cron.d/honeypot-feed
```

## 5. Serve feed.json over HTTPS with CORS
Point a subdomain (for example `feed.yourdomain.com`) at the server, then:
```bash
sudo apt install -y caddy
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
feed.yourdomain.com {
  root * /var/www/feed
  file_server
  header Access-Control-Allow-Origin "https://siddharth-muragundla.vercel.app"
  header Cache-Control "no-store"
}
EOF
sudo systemctl reload caddy
```
Check it: `https://feed.yourdomain.com/feed.json`

## 6. Connect the portfolio
1. In `app/honeypotConfig.ts`, set `honeypotFeed = 'https://feed.yourdomain.com/feed.json'`.
2. In `next.config.mjs`, add the domain to `connect-src`, for example:
   `"connect-src 'self' https://api.web3forms.com https://feed.yourdomain.com"`
3. Deploy. The badge switches from "Sample replay" to "LIVE".

## Feed format
```json
{
  "updated": "2026-11-22T15:00:00Z",
  "events": [{ "ts": "...", "ip": "61.xx.xx.27", "cc": "CN", "country": "China", "lat": 31.2, "lon": 121.5,
               "user": "root", "pass": "123456", "ok": true, "cmds": ["uname -a"] }],
  "stats": { "today": 412, "uniqueIps": 133, "countries": [["China", 120]], "passwords": [["123456", 40]] }
}
```

## Interview talking points
- Why a medium-interaction honeypot (Cowrie) and how you isolated it.
- What attackers actually did: botnet loaders, crypto-miners, persistence via `authorized_keys`, covering tracks.
- How you mapped sessions to MITRE ATT&CK and what detections you'd write from them.
