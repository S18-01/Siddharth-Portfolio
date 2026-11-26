'use client';
/* Animated architecture flow for each case study.
   Every stage comes from what the project actually does (see the project points in page.tsx). */

type Stage = { t: string; d: string };

const flows: Record<string, Stage[]> = {
  'KubeShield Enterprise': [
    { t: 'Code push', d: 'GitHub Actions' },
    { t: 'CI security gates', d: 'Trivy · Bandit · Checkov · pip-audit' },
    { t: 'Hardened cluster', d: '3 replicas · RBAC · NetworkPolicies · non-root' },
    { t: 'Monitoring', d: 'Prometheus · Grafana' },
    { t: 'Security dashboard', d: '5 scanners · scoring · remediation reports' },
  ],
  'RedForge X': [
    { t: 'Recon', d: 'Kali Linux · Nmap · Burp Suite' },
    { t: 'Target lab', d: 'Dockerized Flask app' },
    { t: 'Exploit & PoC', d: 'SQLi · XSS · IDOR · SSTI · command injection' },
    { t: 'Risk scoring', d: 'CVSS · dashboards' },
    { t: 'Report & retest', d: 'PDF report · pytest regression' },
  ],
  'AWS Cloud Security & Infrastructure': [
    { t: 'Security logs', d: 'EC2 workloads' },
    { t: 'Ingest & queue', d: 'S3 · SQS' },
    { t: 'Threat detection', d: 'AWS Lambda' },
    { t: 'Findings', d: 'DynamoDB' },
    { t: 'Hardened deploys', d: 'EKS · ECS · Fargate · CodeDeploy blue-green' },
  ],
  'Cyber Incident Classification': [
    { t: 'Incident data', d: 'Cybersecurity incident datasets' },
    { t: 'Preprocessing', d: 'Cleaning · EDA' },
    { t: 'Feature engineering', d: 'Signals for threat type' },
    { t: 'Classification model', d: 'Scikit-learn' },
    { t: 'Prioritized incidents', d: 'Threat patterns · risk' },
  ],
};

export function ArchFlow({ title }: { title: string }) {
  const stages = flows[title];
  if (!stages) return null;
  return (
    <div className="arch" style={{ ['--n' as string]: stages.length }} aria-label={`${title} architecture`}>
      <h4>How it works</h4>
      <ol className="arch-row">
        {stages.map((s, i) => (
          <li key={s.t} className="arch-node" style={{ ['--i' as string]: i }}>
            <span className="arch-k">{String(i + 1).padStart(2, '0')}</span>
            <b>{s.t}</b>
            <span className="arch-d">{s.d}</span>
            {i < stages.length - 1 && <i className="arch-link" aria-hidden="true"><em /></i>}
          </li>
        ))}
      </ol>
    </div>
  );
}
