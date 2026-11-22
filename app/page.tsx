'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import {
  Award, BrainCircuit, Bug, CalendarDays, Check, Clock, Cloud, Contrast, Copy, Download, ExternalLink, FileText, GitBranch,
  ArrowUp, ArrowRight, ChevronLeft, Layers, Music, ChevronRight, CornerDownLeft, Globe, Search, GraduationCap, MapPin, Menu, MessageCircle, Moon, Pause, Phone, Plane, Radar, Rotate3d, RotateCcw, ScanSearch, Send, ShieldCheck, Star, Sun, Target, User, Video, X, ZoomIn, ZoomOut,
} from 'lucide-react';

/* ================= your details ================= */
const fullName = 'Siddharth Muragundla';
const githubUrl = 'https://github.com/S18-01';
const linkedinUrl = 'https://www.linkedin.com/in/siddhum';
const email = 'siddharthroy1435@gmail.com';
// Bump resumeVersion whenever you replace the resume, so browsers never show a cached old copy
const resumeVersion = '2026-11-21-final';
const resume = `/SiddharthMuragundla_Resume.pdf?v=${resumeVersion}`;
const resumePages = [`/resume/page-1.webp?v=${resumeVersion}`, `/resume/page-2.webp?v=${resumeVersion}`]; // rendered pages for the viewer
const portrait = '/images/siddharth-portrait.png';
const portraitFront = '/images/portrait-front.webp';
const portraitBack = '/images/portrait-tone.webp'; // lightly muted, navy-toned to match the background
const baseLocation = 'Maryland, USA';
// Roles from the resume that I'm open to
const openRoles = ['Security Engineer', 'Penetration Tester', 'SOC Analyst', 'Cloud Security Engineer', 'DevSecOps Engineer', 'Application Security', 'Vulnerability Management', 'Incident Response'];
const homeTimeZone = 'America/New_York';
// Optional: paste your free Calendly or Cal.com link here (e.g. 'https://cal.com/siddharth/30min').
// When set, "Book a call" opens it. When empty, recruiters pick a slot and it emails you the request.
const calendlyUrl = '';
// Web3Forms access key: bookings, chat questions and ratings are emailed to you automatically.
// It can only send emails to your own inbox, so it is safe to keep in the code.
const notifyKey = '74cae2f4-e697-444f-b579-c57ace5ba1ac';
// Optional: drop a short video of you turning around at public/hero/turnaround.mp4
const turnaroundVideo = '/hero/turnaround.mp4';

const navigation = ['About', 'Focus', 'Skills', 'Projects', 'Experience', 'Recognition', 'Contact'];
const marquee = ['Splunk', 'Elastic Stack', 'Burp Suite', 'Metasploit', 'Nessus', 'Nmap', 'Wireshark', 'MITRE ATT&CK', 'AWS', 'Kubernetes', 'Docker', 'Terraform', 'GitHub Actions', 'Trivy', 'Python', 'Scikit-learn', 'Kali Linux', 'ServiceNow'];

const roles = [
  { a: 'Security', b: 'Engineer', short: 'Security Engineer', p: 'Hardening enterprise systems, reviewing security controls and shrinking attack surfaces.' },
  { a: 'Penetration', b: 'Tester', short: 'Pentest Engineer', p: 'OWASP Top 10, Burp Suite, Metasploit and controlled exploitation with proof-of-concept validation.' },
  { a: 'SOC', b: 'Analyst', short: 'SOC Analyst', p: 'Splunk and ELK alert triage, log correlation, IOC analysis and MITRE ATT&CK mapping.' },
  { a: 'Cloud', b: 'Security', short: 'Cloud Security', p: 'AWS IAM, EKS, Kubernetes and Docker locked down with least privilege.' },
  { a: 'DevSecOps', b: 'Engineer', short: 'DevSecOps', p: 'Security built into CI/CD with Trivy, Bandit, Checkov and GitHub Actions.' },
  { a: 'ML-Driven', b: 'Security', short: 'ML & Data Science', p: 'Machine learning and data science on incident data to classify threats and prioritize response.' },
];

const focus = [
  { icon: Bug, title: 'Penetration Testing', description: 'Controlled exploitation of OWASP Top 10 flaws such as SQL injection, XSS, IDOR, SSTI and command injection, backed by proof-of-concept validation.', tags: ['Burp Suite', 'Metasploit', 'Nmap', 'Kali Linux', 'OWASP Top 10'] },
  { icon: ScanSearch, title: 'Vulnerability Management', description: 'Nmap and Nessus scanning, CVE-level reporting and CVSS-based prioritization, then verifying every fix with follow-up scans.', tags: ['Nessus', 'Nmap', 'CVSS', 'CVE Analysis', 'Remediation'] },
  { icon: Radar, title: 'Security Operations (SOC)', description: 'SIEM monitoring, alert triage, log correlation and IOC analysis, with findings mapped to MITRE ATT&CK and escalated cleanly.', tags: ['Splunk', 'Elastic Stack (ELK)', 'SIEM', 'MITRE ATT&CK', 'Threat Intelligence'] },
  { icon: Cloud, title: 'Cloud Security', description: 'Reviewing AWS IAM, security groups and network controls; hardening Kubernetes workloads with RBAC, NetworkPolicies and non-root containers.', tags: ['AWS', 'AWS EKS', 'IAM', 'Kubernetes', 'RBAC'] },
  { icon: GitBranch, title: 'DevSecOps & Automation', description: 'Shifting security left with automated scanning in CI/CD pipelines, infrastructure-as-code checks and container security.', tags: ['GitHub Actions', 'Trivy', 'Bandit', 'Checkov', 'Terraform', 'Docker'] },
  { icon: BrainCircuit, title: 'ML & Data Science for Security', description: 'Applying data mining, feature engineering and classification models to cybersecurity incident data to surface threat patterns and prioritize response.', tags: ['Python', 'Scikit-learn', 'Pandas', 'Data Mining', 'EDA', 'Classification'] },
];

const skillTabs = ['All', 'Offense', 'Defense', 'Cloud & DevSecOps', 'Data & Code', 'Tools'];
const skills = [
  { name: 'Security Operations', dom: 'Defense', items: ['Splunk', 'Elastic Stack (ELK)', 'SIEM', 'SOC Monitoring', 'Incident Response', 'Alert Triage', 'Log Analysis', 'Log Correlation', 'IOC Analysis', 'Threat Intelligence', 'MITRE ATT&CK', 'Detection Tuning'] },
  { name: 'Security Testing', dom: 'Offense', items: ['Burp Suite', 'Metasploit', 'Nmap', 'Nessus', 'Wireshark', 'OWASP Top 10', 'Vulnerability Assessment', 'Penetration Testing', 'Network Security'] },
  { name: 'Cloud & Infrastructure', dom: 'Cloud & DevSecOps', items: ['AWS', 'AWS EKS', 'Kubernetes', 'Docker', 'Linux (Ubuntu/Kali)', 'Git', 'TCP/IP', 'DNS', 'HTTP/HTTPS', 'IAM', 'RBAC', 'Cloud Security'] },
  { name: 'DevSecOps & Automation', dom: 'Cloud & DevSecOps', items: ['GitHub Actions', 'CI/CD Security', 'Trivy', 'Bandit', 'Checkov', 'pip-audit', 'Security Automation', 'Container Security', 'Terraform'] },
  { name: 'Data Science & ML for Security', dom: 'Data & Code', items: ['Machine Learning', 'Data Mining', 'Scikit-learn', 'Pandas', 'Feature Engineering', 'Exploratory Data Analysis', 'Classification Models', 'Threat Pattern Analysis', 'Risk Assessment', 'Incident Prioritization'] },
  { name: 'Programming & Scripting', dom: 'Data & Code', items: ['Python', 'Bash', 'PowerShell', 'Java', 'C'] },
  { name: 'Platforms & Tools', dom: 'Tools', items: ['ServiceNow', 'Jira', 'Prometheus', 'Grafana', 'Next.js', 'TypeScript', 'Flask', 'Supabase', 'pytest'] },
];

const projects = [
  { number: '01', tag: 'Kubernetes security / DevSecOps', title: 'KubeShield Enterprise', points: ['Deployed and hardened a three-replica Kubernetes app with RBAC, NetworkPolicies, non-root containers and least-privilege controls, monitored with Prometheus and Grafana.', 'Built a Next.js security dashboard with five scanners (Kubernetes, Docker, Terraform, AWS IAM, dependencies), security scoring, remediation reports and Supabase auth.', 'Automated CI/CD security checks with GitHub Actions, Trivy, Bandit, Checkov and pip-audit.'], stack: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Next.js', 'Trivy', 'GitHub Actions'], live: 'https://kube-shield-enterprise.vercel.app', repo: 'https://github.com/S18-01/KubeShield-Enterprise',
    overview: 'An end-to-end Kubernetes security platform: a hardened workload running in the cluster, plus a dashboard that scans infrastructure and code for risk and tells you exactly what to fix.',
    highlights: [['3', 'replica hardened deployment'], ['5', 'security scanners'], ['5', 'CI security checks']],
    security: ['RBAC & least privilege', 'NetworkPolicies', 'Non-root containers', 'Security scoring', 'Remediation reports', 'Prometheus + Grafana'] },
  { number: '02', tag: 'Pen testing / Vuln assessment', title: 'RedForge X', points: ['Built a Dockerized pentest lab (Python, Flask, Kali Linux, Nmap, Burp Suite) for attack surface analysis and controlled exploitation of SQLi, XSS, IDOR, SSTI and command injection.', 'Created an automated assessment platform with CVSS risk scoring, PoC validation, security dashboards and PDF pentest reports.', 'Added remediation verification and regression testing with pytest, Docker and GitHub Actions.'], stack: ['Python', 'Flask', 'Next.js', 'TypeScript', 'Kali Linux', 'Burp Suite', 'CVSS'], live: null, repo: null,
    overview: 'A penetration testing lab and an assessment platform in one: attack a deliberately vulnerable app in a safe, Dockerized environment, then score, report and verify the fixes.',
    highlights: [['5', 'OWASP vuln classes exploited'], ['CVSS', 'risk scoring'], ['PDF', 'pentest reports']],
    security: ['SQL injection', 'XSS', 'IDOR', 'SSTI', 'Command injection', 'PoC validation', 'Regression testing'] },
  { number: '03', tag: 'Machine learning / Cybersecurity', title: 'Cyber Incident Classification', points: ['Developed an ML classification model that analyzes cybersecurity incident datasets and identifies emerging threat patterns.', 'Applied preprocessing, feature engineering and EDA to support threat classification, risk assessment and incident prioritization.'], stack: ['Python', 'Scikit-learn', 'Pandas', 'Machine Learning', 'EDA'], live: null, repo: null,
    overview: 'Machine learning applied to security operations: a model that learns from historical incident data to classify new incidents and surface emerging threat patterns.',
    highlights: [['ML', 'classification model'], ['EDA', 'on incident datasets'], ['Risk', 'prioritization support']],
    security: ['Data preprocessing', 'Feature engineering', 'Threat classification', 'Risk assessment', 'Incident prioritization'] },
];

const experience = [
  {
    role: 'Graduate Assistant', org: 'University of Maryland, College Park', mark: 'UMD', place: 'College Park, MD', date: 'Jan 2026 – May 2026', length: '5 mos', kind: 'Security Tools for InfoSec',
    points: [
      <>Guided students through <b>hands-on security labs</b> using Nmap, Wireshark and Linux, helping them analyze network traffic, identify potential vulnerabilities and interpret <b>network reconnaissance</b> findings.</>,
      <>Troubleshot <b>security tool configurations and lab environments</b> while assisting with vulnerability assessments, packet analysis and practical network security exercises.</>,
    ],
    tools: ['Nmap', 'Wireshark', 'Linux'],
  },
  {
    role: 'Security Engineer', org: 'Cognizant', mark: 'C', place: 'Hyderabad, India', date: 'Jun 2023 – Dec 2024', length: '1 yr 7 mos', kind: 'Full-time', featured: true,
    points: [
      <>Strengthened enterprise <b>security posture</b> by reviewing access permissions, system configurations and network exposure, supporting <b>security controls</b> that <b>reduce attack surfaces</b>.</>,
      <>Ran <b>Nmap and Nessus</b> scans to find exposed services and vulnerable software, then built vulnerability reports with <b>CVE details, affected assets and prioritized remediation</b>.</>,
      <>Prioritized high-risk findings using <b>CVSS scores and exploitability</b> from vulnerability scans, and coordinated remediation with technical teams.</>,
      <>Investigated security alerts in <b>Splunk and Elastic Stack (ELK)</b>, analyzing event logs, network traffic and IOCs, and mapping findings to <b>MITRE ATT&amp;CK</b>.</>,
      <>Detected potential <b>intrusions, unauthorized access attempts and abnormal communication</b> by analyzing network traffic, firewall logs and security alerts.</>,
      <>Validated security fixes through <b>follow-up scans and configuration reviews</b>, documenting remaining risk and tracking remediation <b>to closure</b>.</>,
    ],
    tools: ['Splunk', 'ELK', 'Nessus', 'Nmap', 'CVSS', 'MITRE ATT&CK'],
  },
  {
    role: 'Cybersecurity Engineer Intern', org: 'Nestack Technologies', mark: 'NT', place: 'Hyderabad, India', date: 'Dec 2022 – May 2023', length: '6 mos', kind: 'Cloud & Network Security',
    points: [
      <>Reviewed <b>AWS IAM permissions, security groups and network access controls</b> to identify misconfigurations and improve cloud infrastructure security.</>,
      <>Ran <b>Nmap network security assessments</b> to find open ports, exposed services and potential vulnerabilities, documenting findings and remediation steps.</>,
      <>Analyzed traffic in <b>Wireshark</b>, examining TCP/IP, DNS and HTTP/HTTPS communications to spot suspicious activity and network weaknesses.</>,
      <>Strengthened <b>Linux system security</b> by reviewing user permissions, running services and security configurations, recommending corrective actions.</>,
    ],
    tools: ['AWS IAM', 'Nmap', 'Wireshark', 'Linux'],
  },
  {
    role: 'Cybersecurity Club Lead', org: 'Guru Nanak Institutions Technical Campus', mark: 'GN', place: 'Hyderabad, India', date: 'Dec 2020 – Oct 2022', length: '1 yr 11 mos', kind: 'Offensive Security & CTFs',
    points: [
      <>Led <b>hands-on cybersecurity workshops</b> on penetration testing, vulnerability assessment, network reconnaissance and web app security using Nmap, Burp Suite, Metasploit, Wireshark and Kali Linux.</>,
      <>Organized and competed in <b>Capture the Flag (CTF)</b> competitions: vulnerability exploitation, web app pentesting and security analysis in controlled labs.</>,
      <>Mentored members on <b>Red Team methodologies, OWASP Top 10</b> and ethical hacking, guiding projects from vulnerability identification to remediation.</>,
      <>Ran technical meetings and guided <b>student project and startup teams</b> on security testing, risk identification and secure application development.</>,
    ],
    tools: ['Burp Suite', 'Metasploit', 'Kali Linux', 'CTF'],
  },
];

const strengths = [
  { icon: ShieldCheck, title: 'Offense and defense', text: 'I test like an attacker and respond like a defender: OWASP Top 10 exploitation with Burp Suite and Metasploit on one side, Splunk and ELK investigations mapped to MITRE ATT&CK on the other.', proof: 'Pentest labs · SOC alert triage' },
  { icon: Award, title: 'Enterprise-proven', text: 'At Cognizant I secured enterprise systems end to end: scanning with Nmap and Nessus, prioritizing by CVSS, coordinating remediation with engineering teams and verifying every fix.', proof: 'Security Engineer · 1 yr 7 mos' },
  { icon: Cloud, title: 'Cloud and automation first', text: 'I harden Kubernetes and AWS with least privilege, and I build security into CI/CD so problems are caught before they ship.', proof: 'KubeShield Enterprise · RedForge X' },
  { icon: MessageCircle, title: 'Clear communicator', text: 'I write assessment reports engineers can act on, and I\'ve taught security hands-on: leading workshops, running CTFs and guiding graduate labs at UMD.', proof: 'Club Lead · Graduate Assistant' },
];

const roleFit = [
  { role: 'Security Engineer', fit: [
    'Ran Nmap and Nessus scans at Cognizant, built CVE-level vulnerability reports mapped to affected assets, and validated fixes with follow-up scans',
    'Prioritized high-risk findings by CVSS score and real-world exploitability, then coordinated fixes directly with engineering teams',
    'Reduced attack surface across enterprise systems by reviewing access permissions, configurations, open ports and exposed services, and supported Linux hardening',
    'Hardened cloud and infrastructure: AWS IAM, security groups and network ACLs at Nestack; RBAC, NetworkPolicies and non-root containers in Kubernetes',
    'Built security into delivery with automated CI/CD scanning (Trivy, Bandit, Checkov, pip-audit), and recognized as Best Team Lead at Cognizant',
  ], tools: ['Nessus', 'Nmap', 'Burp Suite', 'Splunk', 'Elastic Stack (ELK)', 'Wireshark', 'AWS IAM', 'Kubernetes', 'Terraform', 'Python', 'Bash', 'Linux'], work: ['KubeShield Enterprise', 'RedForge X'] },
  { role: 'Penetration Tester', fit: [
    'Runs full assessments end to end: reconnaissance, attack surface analysis, controlled exploitation and a clear remediation plan',
    'Exploited SQL injection, XSS, IDOR, SSTI and command injection in a Dockerized pentest lab, backed by proof-of-concept validation',
    'Scores every finding with CVSS and delivers PDF pentest reports that engineers can act on immediately',
    'Led hands-on workshops in penetration testing, reconnaissance and web app security with Nmap, Burp Suite, Metasploit, Wireshark and Kali Linux',
    'Placed 3rd in a cybersecurity CTF and organized CTF competitions, mentoring students on Red Team methodology and ethical hacking',
  ], tools: ['Burp Suite', 'Metasploit', 'Nmap', 'Kali Linux', 'Wireshark', 'OWASP Top 10', 'Python'], work: ['RedForge X'] },
  { role: 'SOC Analyst', fit: [
    'Monitored and triaged security alerts in Splunk and Elastic Stack (ELK) at Cognizant, separating real threats from noise',
    'Investigated suspicious activity by correlating logs, network traffic and indicators of compromise (IOCs) to confirm scope and impact',
    'Mapped attacker behavior to MITRE ATT&CK techniques to guide response and improve detections',
    'Analyzed firewall logs and TCP/IP, DNS and HTTP/HTTPS traffic in Wireshark to detect intrusions, unauthorized access and abnormal communication',
    'Built a machine learning model that classifies cybersecurity incidents to speed up triage and incident prioritization',
  ], tools: ['Splunk', 'Elastic Stack (ELK)', 'Wireshark', 'MITRE ATT&CK', 'ServiceNow', 'Jira', 'Python'], work: ['Cyber Incident Classification'] },
  { role: 'Cloud Security', fit: [
    'Reviewed AWS IAM permissions, security groups and network ACLs at Nestack Technologies to find misconfigurations and harden cloud infrastructure',
    'Hardened a three-replica Kubernetes deployment with RBAC, NetworkPolicies, non-root containers and least-privilege controls',
    'Independently built scanners that catch misconfigurations across Kubernetes, Docker, Terraform and AWS IAM, with security scoring and remediation reports',
    'Shifted cloud security left by scanning Terraform and container images in CI/CD with Checkov and Trivy before anything deploys',
    'Monitored cluster health and security posture with Prometheus and Grafana',
  ], tools: ['AWS', 'AWS EKS', 'IAM', 'Kubernetes', 'Docker', 'Terraform', 'Prometheus', 'Grafana'], work: ['KubeShield Enterprise'] },
  { role: 'DevSecOps Engineer', fit: [
    'Automated CI/CD security checks with GitHub Actions, Trivy, Bandit, Checkov and pip-audit so vulnerabilities are caught before release',
    'Added remediation verification and regression testing to pipelines with pytest and Docker, so fixed issues stay fixed',
    'Scanned infrastructure-as-code (Terraform) and container images as part of every build',
    'Built a Next.js security dashboard with security scoring, remediation reports and Supabase authentication',
    'Deployed hardened Kubernetes workloads with RBAC, NetworkPolicies and non-root containers, monitored with Prometheus and Grafana',
  ], tools: ['GitHub Actions', 'Trivy', 'Bandit', 'Checkov', 'pip-audit', 'Terraform', 'Docker', 'Kubernetes'], work: ['KubeShield Enterprise', 'RedForge X'] },
  { role: 'Application Security', fit: [
    'Deep OWASP Top 10 knowledge, tested hands-on with Burp Suite against real vulnerable applications',
    'Exploited and documented SQL injection, XSS, IDOR, SSTI and command injection with proof-of-concept validation',
    'Built an automated assessment platform with CVSS risk scoring, remediation tracking and regression tests that confirm fixes',
    'Integrated code and dependency scanning (Bandit, pip-audit) into CI/CD pipelines',
    'Advised student and startup teams on secure application development and mentored developers on the OWASP Top 10',
  ], tools: ['Burp Suite', 'OWASP Top 10', 'Bandit', 'pip-audit', 'Python', 'Flask', 'Next.js'], work: ['RedForge X'] },
];

const achievements = [
  { title: '3rd Place · Cybersecurity CTF', detail: 'Applied penetration testing and vulnerability exploitation skills.', date: 'April 2023' },
  { title: '1st Place · Best Academic Project', detail: 'Recognized for technical innovation and project implementation.', date: 'December 2023' },
  { title: 'Best Team Lead · Cognizant', detail: 'Recognized for coordinating security operations and team performance.', date: 'Recognition' },
];

const certifications = [
  { title: 'Certified Professional Penetration Tester (eCPPT)', status: 'Certification' },
  { title: 'Google Cybersecurity Professional Certificate', status: 'Coursera' },
  { title: 'CompTIA Security+', status: 'In progress' },
];

const termLines: [string, string][] = [
  ['$ whoami', ''],
  ['siddharth muragundla — security & pentest engineer', 'b'],
  ['$ cat focus.txt', ''],
  ['> penetration testing · vulnerability management', ''],
  ['> soc operations · threat detection', ''],
  ['> cloud security · devsecops', ''],
  ['> ml & data science for threat detection', ''],
  ['$ location --relocate', ''],
  ['maryland, usa · open to relocation', 'b'],
  ['$ status --availability', ''],
  ['✓ open to: security eng · pentest · soc · cloud sec · devsecops · appsec', 'g'],
];

/* ================= helpers ================= */
async function notify(subject: string, fields: Record<string, string>, replyTo?: string) {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: notifyKey, subject, from_name: 'Portfolio · siddharth-muragundla.vercel.app', ...(replyTo ? { email: replyTo } : {}), ...fields, 'Sent at': new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET' }),
    });
    const j = await res.json().catch(() => ({}));
    return res.ok && j.success !== false;
  } catch { return false; }
}
function bookingFields(b: Booking) {
  const l = bookingLinks(b);
  return { 'Meeting': `${l.t.label} (${l.t.len} min) · ${b.format === 'phone' ? 'Phone' : 'Video'}`, 'When': l.whenET, 'Name': b.name, 'Email': b.email, 'Company': b.company || '-', 'Role': b.role || '-', 'Phone': b.phone || '-', 'Notes': b.notes || '-', 'Add to my calendar': l.gcal.replace(`&add=${encodeURIComponent(email)}`, `&add=${encodeURIComponent(b.email)}`) };
}
const mailto = (subject: string, body: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}
function homeTime(d: Date, seconds = false) {
  return d.toLocaleTimeString('en-US', { timeZone: homeTimeZone, hour: 'numeric', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}) });
}
function homeHour(d: Date) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: homeTimeZone, hour: 'numeric', hourCycle: 'h23' }).format(d));
}
function replyStatus(d: Date) {
  const h = homeHour(d);
  return h >= 8 && h < 22 ? 'Online · usually replies within a few hours' : 'Away · replies next morning';
}
// Convert a wall-clock time in the home time zone to a real Date
function homeToDate(y: number, m: number, day: number, h: number, min: number) {
  const guess = Date.UTC(y, m, day, h, min);
  const asHome = new Date(new Date(guess).toLocaleString('en-US', { timeZone: homeTimeZone })).getTime();
  const asUtc = new Date(new Date(guess).toLocaleString('en-US', { timeZone: 'UTC' })).getTime();
  return new Date(guess - (asHome - asUtc));
}

/* ================= brand icons ================= */
const paths = {
  github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  gmail: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
};
function Brand({ name, size = 18 }: { name: keyof typeof paths; size?: number }) {
  return <svg className="bi" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={paths[name]} /></svg>;
}
function Social({ className = '' }: { className?: string }) {
  return (
    <div className={'social ' + className}>
      <a className="ml" href={`mailto:${email}`} aria-label="Email" title="Email"><Brand name="gmail" /></a>
      <a className="li" href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><Brand name="linkedin" /></a>
      <a className="gh" href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><Brand name="github" /></a>
    </div>
  );
}

/* ================= pieces ================= */
function Terminal() {
  const ref = useRef<HTMLPreElement>(null);
  const [done, setDone] = useState<[string, string][]>([]);
  const [partial, setPartial] = useState<[string, string] | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    let li = 0, ci = 0;
    const type = () => {
      if (li >= termLines.length) { setPartial(null); return; }
      const [txt, c] = termLines[li];
      ci++;
      if (ci >= txt.length) { setDone(d => [...d, [txt, c]]); setPartial(null); li++; ci = 0; timer = setTimeout(type, 240); }
      else { setPartial([txt.slice(0, ci), c]); timer = setTimeout(type, 22); }
    };
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); type(); } });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(timer); };
  }, []);
  return (
    <pre ref={ref}>
      {done.map(([t, c], i) => <span key={i} className={c || undefined}>{t}{'\n'}</span>)}
      {partial && <span className={partial[1] || undefined}>{partial[0]}</span>}
      <span className="cursor" />
    </pre>
  );
}

function HireButton({ onClick, big }: { onClick: () => void; big?: boolean }) {
  return (
    <button className={'hire' + (big ? ' big' : '')} onClick={onClick} aria-haspopup="dialog">
      <span className="in"><span className="dot" />Hire me<span className="arr">→</span></span>
    </button>
  );
}

function SectionHead({ n, label, children, sub }: { n: string; label: string; children: ReactNode; sub?: string }) {
  return (
    <div className="sh reveal">
      <div className="sh-tag"><span className="sh-n">{n}</span>{label}</div>
      <h2>{children}</h2>
      {sub && <p>{sub}</p>}
      <div className="sh-rule" />
    </div>
  );
}

function Spinner() {
  return (
    <div className="spin" role="img" aria-label={`Portrait of ${fullName}`}>
      <div className="burst" />
      <div className="face front"><img src={portraitFront} alt="" draggable={false} /></div>
      <div className="face back"><img src={portraitBack} alt="" draggable={false} /></div>
    </div>
  );
}

type Theme = 'dark' | 'light' | 'graphite';
function ThemeSwitch({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const opts: [Theme, ReactNode, string][] = [['dark', <Moon key="d" />, 'Midnight (dark)'], ['light', <Sun key="l" />, 'Light'], ['graphite', <Contrast key="g" />, 'Graphite']];
  return (
    <div className="themes" role="group" aria-label="Color theme">
      {opts.map(([t, icon, label]) => <button key={t} className={theme === t ? 'on' : ''} onClick={() => setTheme(t)} aria-label={label} aria-pressed={theme === t} title={label}>{icon}</button>)}
    </div>
  );
}

/* ---------- booking engine (shared by the scheduler and the chat) ---------- */
const callTypes = [
  { id: 'intro', label: 'Intro call', len: 15, desc: 'Quick hello and role overview' },
  { id: 'screen', label: 'Recruiter screen', len: 30, desc: 'Background, fit and next steps' },
  { id: 'tech', label: 'Technical interview', len: 45, desc: 'Deep dive into security skills' },
];
const formats = [
  { id: 'video', label: 'Video call', sub: 'Google Meet, Zoom or Teams' },
  { id: 'phone', label: 'Phone call', sub: 'Share your number and I\'ll call' },
];
type Day = { y: number; m: number; d: number; wd: string; key: string; label: string; short: string };
function bookableDays(n = 22): Day[] {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: homeTimeZone, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' });
  const out: Day[] = [];
  let t = Date.now() + 864e5;
  while (out.length < n) {
    const p = Object.fromEntries(fmt.formatToParts(new Date(t)).map(x => [x.type, x.value]));
    if (p.weekday !== 'Sat' && p.weekday !== 'Sun') {
      const y = +p.year, m = +p.month - 1, d = +p.day, u = new Date(Date.UTC(y, m, d, 12));
      out.push({ y, m, d, wd: p.weekday, key: `${y}-${m}-${d}`, label: u.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }), short: u.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }) });
    }
    t += 864e5;
  }
  return out;
}
const slotTimes: [number, number][] = [];
for (let h = 10; h <= 16; h++) for (const mm of [0, 30]) if (!(h === 16 && mm === 30)) slotTimes.push([h, mm]);
const fmtTime = (d: Date, tz: string) => d.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
const tzLabel = (tz: string) => tz.split('/').pop()!.replace(/_/g, ' ');
const getVisitorTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || homeTimeZone; } catch { return homeTimeZone; } };
type Booking = { type: string; format: string; day: Day; slot: number; name: string; email: string; company: string; role: string; phone: string; notes: string };
const enc = encodeURIComponent;
function bookingLinks(b: Booking) {
  const t = callTypes.find(c => c.id === b.type)!;
  const [h, mm] = slotTimes[b.slot];
  const start = homeToDate(b.day.y, b.day.m, b.day.d, h, mm);
  const end = new Date(start.getTime() + t.len * 60000);
  const z = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const whenET = `${b.day.label}, ${fmtTime(start, homeTimeZone)} ET`;
  const title = `${t.label}: ${b.name}${b.company ? ` (${b.company})` : ''} × ${fullName}`;
  const location = b.format === 'phone' ? (b.phone ? `Phone: ${b.phone}` : 'Phone call') : 'Video call (link to be shared)';
  const details = `${t.label} · ${t.len} min · ${b.format === 'phone' ? 'Phone call' : 'Video call'}\n\nWith: ${b.name}${b.role ? `, ${b.role}` : ''}${b.company ? ` at ${b.company}` : ''}\nEmail: ${b.email}${b.phone ? `\nPhone: ${b.phone}` : ''}${b.notes ? `\n\nNotes: ${b.notes}` : ''}\n\nBooked from ${fullName}'s portfolio.`;
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(title)}&dates=${z(start)}/${z(end)}&details=${enc(details)}&location=${enc(location)}&add=${enc(email)}`;
  const outlook = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${enc(title)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${enc(details)}&location=${enc(location)}&to=${enc(email)}`;
  const mail = mailto(`Call request: ${t.label} · ${whenET}`, `Hi Siddharth,\n\nI'd like to book a ${t.len}-minute ${t.label.toLowerCase()}.\n\nWhen: ${whenET}\n${details}`);
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Siddharth Muragundla Portfolio//EN', 'METHOD:REQUEST', 'BEGIN:VEVENT', `UID:${start.getTime()}-${Math.random().toString(36).slice(2)}@portfolio`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(start)}`, `DTEND:${z(end)}`, `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(details)}`, `LOCATION:${esc(location)}`, `ATTENDEE;CN=${fullName};RSVP=TRUE:mailto:${email}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return { t, start, end, whenET, gcal, outlook, mail, ics };
}
function downloadIcs(ics: string) {
  try {
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'call-with-siddharth.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch { /* downloads blocked */ }
}
const validEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s.trim());

/* ---------- schedule a call: 4-step wizard ---------- */
const stepNames = ['Meeting', 'Date & time', 'Your details', 'Confirm'];
function Schedule({ open, onClose }: { open: boolean; onClose: () => void }) {
  const days = useMemo(() => bookableDays(22), []);
  const months = useMemo(() => Array.from(new Set(days.map(d => `${d.y}-${d.m}`))).map(k => k.split('-').map(Number)), [days]);
  const [step, setStep] = useState(0);
  const [type, setType] = useState('screen');
  const [format, setFormat] = useState('video');
  const [dayKey, setDayKey] = useState(days[0].key);
  const [slot, setSlot] = useState<number | null>(null);
  const [mi, setMi] = useState(0);
  const [local, setLocal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', role: '', phone: '', notes: '' });
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [notified, setNotified] = useState<'idle' | 'sending' | 'ok' | 'fail'>('idle');
  const vtz = useMemo(getVisitorTz, []);
  const sameTz = vtz === homeTimeZone;
  const tz = local && !sameTz ? vtz : homeTimeZone;
  const day = days.find(d => d.key === dayKey) || days[0];
  const bookable = new Set(days.map(d => d.key));
  const [my, mm] = months[mi];
  const first = new Date(Date.UTC(my, mm, 1)).getUTCDay();
  const count = new Date(Date.UTC(my, mm + 1, 0)).getUTCDate();
  const slotDates = slotTimes.map(([h, m]) => homeToDate(day.y, day.m, day.d, h, m));
  const ct = callTypes.find(c => c.id === type)!;
  const booking: Booking | null = slot === null ? null : { type, format, day, slot, ...form };
  const links = booking && validEmail(form.email) && form.name.trim() ? bookingLinks(booking) : null;
  const reset = () => { setStep(0); setSlot(null); setDone(null); setErr(''); };
  const close = () => { onClose(); setTimeout(reset, 400); };
  const next = () => {
    if (step === 1 && slot === null) return setErr('Pick a time that works for you.');
    if (step === 2 && (!form.name.trim() || !validEmail(form.email))) return setErr('Add your name and a valid work email.');
    setErr('');
    if (step === 2 && booking) {
      const b = booking;
      setNotified('sending');
      notify(`📅 New call booking: ${b.name}${b.company ? ` (${b.company})` : ''}`, bookingFields(b), b.email).then(ok => setNotified(ok ? 'ok' : 'fail'));
    }
    setStep(s => Math.min(3, s + 1));
  };
  const act = (kind: string) => {
    if (!links) return;
    if (kind === 'ics') downloadIcs(links.ics);
    if (kind === 'mail') window.location.href = links.mail;
    setDone(kind);
  };
  return (
    <div className={'modal wiz' + (open ? ' on' : '')} role="dialog" aria-modal="true" aria-label="Schedule a call" aria-hidden={!open}>
      <div className="mh">
        <img src={portrait} alt="" />
        <div><b>Book a call with Siddharth</b><span>{ct.len} min · {format === 'phone' ? 'Phone' : 'Video'} · Eastern Time, {baseLocation}</span></div>
        <button className="hp-x" onClick={close} aria-label="Close"><X size={18} /></button>
      </div>
      <ol className="stepper">{stepNames.map((n, i) => <li key={n} className={i < step || done ? 'ok' : i === step ? 'cur' : ''}><i>{i < step || done ? <Check size={12} /> : i + 1}</i><span>{n}</span></li>)}</ol>
      {done ? (
        <div className="done">
          <div className="ok"><Check /></div>
          <h3>{done === 'gcal' || done === 'outlook' ? 'Almost there: save the event' : done === 'ics' ? 'Calendar invite downloaded' : 'Your request is ready to send'}</h3>
          <p>{done === 'gcal' || done === 'outlook' ? 'Your calendar opened in a new tab with me already invited. Hit Save and I\'ll get the invite instantly.' : done === 'ics' ? 'Open the file to add it to your calendar and send me the invite.' : 'Your email app should have opened with everything filled in. Just press send.'} I&apos;ll confirm by email. If anything doesn&apos;t open, write to <b>{email}</b>.</p>
          {links && <div className="sum-mini"><CalendarDays size={16} />{ct.label} · {links.whenET}</div>}
          <div className="row"><button className="btn ghost" onClick={() => setDone(null)}>Back to options</button><button className="btn light" onClick={close}>Done</button></div>
        </div>
      ) : (
        <>
          <div className="mb">
            {step === 0 && (<>
              <div><div className="lbl">What kind of call?</div>
                <div className="tcards">{callTypes.map(c => <button key={c.id} className={'tcard' + (type === c.id ? ' on' : '')} onClick={() => setType(c.id)}><b>{c.label}</b><span>{c.desc}</span><em><Clock size={13} />{c.len} min</em></button>)}</div>
              </div>
              <div><div className="lbl">How should we meet?</div>
                <div className="opts">{formats.map(f => <button key={f.id} className={'opt' + (format === f.id ? ' on' : '')} onClick={() => setFormat(f.id)}>{f.id === 'video' ? <Video size={15} /> : <Phone size={15} />} {f.label}<small>{f.sub}</small></button>)}</div>
              </div>
            </>)}
            {step === 1 && (
              <div className="pick">
                <div className="cal">
                  <div className="cal-h">
                    <button onClick={() => setMi(i => Math.max(0, i - 1))} disabled={mi === 0} aria-label="Previous month"><ChevronLeft size={16} /></button>
                    <b>{new Date(Date.UTC(my, mm, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</b>
                    <button onClick={() => setMi(i => Math.min(months.length - 1, i + 1))} disabled={mi === months.length - 1} aria-label="Next month"><ChevronRight size={16} /></button>
                  </div>
                  <div className="cal-g">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, i) => <span key={i} className="wd">{w}</span>)}
                    {Array.from({ length: first }, (_, i) => <span key={'e' + i} />)}
                    {Array.from({ length: count }, (_, i) => { const k = `${my}-${mm}-${i + 1}`; const ok = bookable.has(k); return <button key={k} disabled={!ok} className={(ok ? 'av' : '') + (k === dayKey ? ' on' : '')} onClick={() => { setDayKey(k); setSlot(null); }}>{i + 1}</button>; })}
                  </div>
                  <div className="cal-f"><span className="dotav" />Available weekdays</div>
                </div>
                <div className="times">
                  <div className="lbl"><span>{day.label}</span>
                    {!sameTz && <span className="tzs"><button className={!local ? 'on' : ''} onClick={() => setLocal(false)}>ET</button><button className={local ? 'on' : ''} onClick={() => setLocal(true)}><Globe size={12} />{tzLabel(vtz)}</button></span>}
                  </div>
                  {[['Morning', (h: number) => h < 12], ['Afternoon', (h: number) => h >= 12]].map(([g, f]) => (
                    <div key={g as string}><div className="grp">{g as string}</div>
                      <div className="slots">{slotTimes.map(([h], i) => (f as (h: number) => boolean)(h) && <button key={i} className={'slot' + (slot === i ? ' on' : '')} onClick={() => setSlot(i)}>{fmtTime(slotDates[i], tz)}</button>)}</div>
                    </div>
                  ))}
                  <p className="tznote"><Globe size={12} />Times in {tz === homeTimeZone ? 'Eastern Time (ET)' : tzLabel(tz) + ' time'}{!sameTz && slot !== null && ` · ${fmtTime(slotDates[slot], tz === homeTimeZone ? vtz : homeTimeZone)} ${tz === homeTimeZone ? 'your time' : 'ET'}`}</p>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="fields">
                <label className="fl"><span>Full name *</span><input className="inp" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" placeholder="Jane Smith" /></label>
                <label className="fl"><span>Work email *</span><input className="inp" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" placeholder="jane@company.com" /></label>
                <label className="fl"><span>Company</span><input className="inp" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} autoComplete="organization" placeholder="Company name" /></label>
                <label className="fl"><span>Your role</span><input className="inp" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Technical Recruiter" /></label>
                {format === 'phone' && <label className="fl full"><span>Phone number</span><input className="inp" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} autoComplete="tel" placeholder="+1 (555) 000-0000" /></label>}
                <label className="fl full"><span>Role you&apos;re hiring for, or anything to prepare</span><textarea className="inp" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Security Engineer II, AppSec team" /></label>
              </div>
            )}
            {step === 3 && links && (
              <div className="review">
                <div className="rv-card">
                  <div className="rc-row"><CalendarDays /><div><small>When</small><b>{links.whenET}</b>{!sameTz && <span>{fmtTime(links.start, vtz)} your time ({tzLabel(vtz)})</span>}</div></div>
                  <div className="rc-row"><Clock /><div><small>Meeting</small><b>{ct.label} · {ct.len} min</b><span>{format === 'phone' ? 'Phone call' : 'Video call: link shared in the invite'}</span></div></div>
                  <div className="rc-row"><User /><div><small>Booked by</small><b>{form.name}{form.company && ` · ${form.company}`}</b><span>{form.email}</span></div></div>
                  <div className="rc-row"><Send /><div><small>Invite goes to</small><b>{fullName}</b><span>{email}</span></div></div>
                </div>
                {notified === 'ok' && <div className="notified"><Check size={15} />Siddharth has been notified of your request. Adding it to your calendar sends the invite.</div>}
                <div className="lbl">Send the invite (pick one)</div>
                <div className="acts">
                  <a className="act pri" href={links.gcal} target="_blank" rel="noopener noreferrer" onClick={() => act('gcal')}><CalendarDays /><div><b>Add to Google Calendar</b><span>Invites me automatically · recommended</span></div></a>
                  <a className="act" href={links.outlook} target="_blank" rel="noopener noreferrer" onClick={() => act('outlook')}><CalendarDays /><div><b>Add to Outlook</b><span>Microsoft 365 calendar</span></div></a>
                  <button className="act" onClick={() => act('mail')}><Brand name="gmail" /><div><b>Send request by email</b><span>Opens your email app</span></div></button>
                  <button className="act" onClick={() => act('ics')}><Download /><div><b>Download invite (.ics)</b><span>Apple Calendar & others</span></div></button>
                </div>
              </div>
            )}
          </div>
          <div className="mf">
            <p>{err ? <span className="errt">{err}</span> : step === 1 && slot !== null ? <>{day.short} · <b>{fmtTime(slotDates[slot], homeTimeZone)} ET</b></> : step === 3 ? 'I\'ll confirm with a reply as soon as I see it.' : `Step ${step + 1} of 4`}</p>
            <div className="row">
              {step > 0 && <button className="btn ghost" onClick={() => { setErr(''); setStep(s => s - 1); }}><ChevronLeft size={16} />Back</button>}
              {step < 3 && <button className="btn light" onClick={next}>Continue<ChevronRight size={16} /></button>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- chat: smart assistant with in-chat booking ---------- */
type Chip = { label: string; action: string };
type CMsg = { id: number; from: 'bot' | 'me'; text?: string; card?: 'resume' | 'projects' | 'contact' | 'booking'; chips?: Chip[]; t: number; booking?: Booking };
type Mode = 'idle' | 'b-name' | 'b-email' | 'b-company';
const suggest: Chip[] = [
  { label: 'Book a call', action: 'book' }, { label: 'View resume', action: 'resume' }, { label: 'Skills', action: 'skills' },
  { label: 'Experience', action: 'experience' }, { label: 'Projects', action: 'projects' }, { label: 'Relocation', action: 'location' },
  { label: 'Availability', action: 'availability' }, { label: 'Certifications', action: 'certs' }, { label: 'Contact', action: 'contact' },
];
const intents: [RegExp, string][] = [
  [/\b(book|call|schedule|meet|meeting|interview|talk|chat live|zoom|phone)\b/i, 'book'],
  [/\b(resume|cv|pdf)\b/i, 'resume'],
  [/\b(visa|sponsor|sponsorship|authori[sz]ation|h-?1b|opt|cpt|green card|citizen)\b/i, 'auth'],
  [/\b(salary|pay|compensation|rate|ctc|expected)\b/i, 'salary'],
  [/\b(relocat|move|located|location|where|based|state|city)\w*/i, 'location'],
  [/\b(available|availability|start|join|notice|graduat|when can)\w*/i, 'availability'],
  [/\b(cert|ecppt|security\+|comptia|google)\w*/i, 'certs'],
  [/\b(project|github|built|build|kubeshield|redforge|portfolio work)\w*/i, 'projects'],
  [/\b(experience|work|job|cognizant|nestack|years|background|role)\w*/i, 'experience'],
  [/\b(skill|stack|tool|tech|know|splunk|aws|python|pentest|soc|cloud|ml|machine)\w*/i, 'skills'],
  [/\b(contact|email|mail|linkedin|reach)\b/i, 'contact'],
  [/\b(hiring|recruit|position|opening|opportunit|team)\w*/i, 'hiring'],
  [/\b(thank|thanks|thx|appreciate)\w*/i, 'thanks'],
  [/^(hi|hey|hello|yo|hola|good (morning|afternoon|evening))\b/i, 'greet'],
];
const answers: Record<string, { text: string; chips?: Chip[]; card?: CMsg['card'] }> = {
  hiring: { text: `Great to meet you! I'm open to full-time roles as a Security Engineer, Penetration Tester, SOC Analyst, Cloud Security Engineer or DevSecOps Engineer, as well as AppSec, vulnerability management and incident response.\n\n• 4+ years in cybersecurity\n• M.Eng Cybersecurity, University of Maryland (Dec 2026)\n• Based in ${baseLocation}, open to relocation`, chips: [{ label: 'Book a call', action: 'book' }, { label: 'View resume', action: 'resume' }, { label: 'Skills', action: 'skills' }] },
  skills: { text: 'Here\'s my core toolkit:\n\n• Offense: Burp Suite, Metasploit, Nmap, Nessus, OWASP Top 10\n• Defense: Splunk, ELK, SIEM, MITRE ATT&CK, incident response\n• Cloud & DevSecOps: AWS, EKS, Kubernetes, Docker, Terraform, GitHub Actions, Trivy\n• Code & data: Python, Bash, PowerShell, Scikit-learn, Pandas', chips: [{ label: 'Experience', action: 'experience' }, { label: 'Projects', action: 'projects' }, { label: 'Book a call', action: 'book' }] },
  experience: { text: '4+ years across security engineering, SOC and offensive work:\n\n• Graduate Assistant, UMD (Jan – May 2026): hands-on security labs\n• Security Engineer, Cognizant (Jun 2023 – Dec 2024): Nessus/Nmap assessments, Splunk & ELK investigations, MITRE ATT&CK mapping\n• Cybersecurity Engineer Intern, Nestack (Dec 2022 – May 2023): AWS IAM & network security\n• Cybersecurity Club Lead (2020 – 2022): pentest workshops and CTFs', chips: [{ label: 'Projects', action: 'projects' }, { label: 'View resume', action: 'resume' }, { label: 'Book a call', action: 'book' }] },
  projects: { text: 'A few things I\'ve built:', card: 'projects', chips: [{ label: 'Skills', action: 'skills' }, { label: 'Book a call', action: 'book' }] },
  location: { text: `I'm based in ${baseLocation} and open to relocating for the right role.`, chips: [{ label: 'Availability', action: 'availability' }, { label: 'Book a call', action: 'book' }] },
  availability: { text: 'I\'m completing my M.Eng in Cybersecurity at UMD (expected December 2026) and I\'m open to full-time roles as a Security Engineer, Penetration Tester, SOC Analyst, Cloud Security or DevSecOps Engineer, plus AppSec, vulnerability management and incident response. Happy to talk through start dates on a call.', chips: [{ label: 'Book a call', action: 'book' }, { label: 'View resume', action: 'resume' }] },
  certs: { text: '• Certified Professional Penetration Tester (eCPPT)\n• Google Cybersecurity Professional Certificate\n• CompTIA Security+ (in progress)', chips: [{ label: 'Skills', action: 'skills' }, { label: 'View resume', action: 'resume' }] },
  salary: { text: 'I\'d love to discuss compensation on a quick call so we can talk about the full role.', chips: [{ label: 'Book a call', action: 'book' }, { label: 'Email me', action: 'email' }] },
  auth: { text: 'Happy to go over work authorization details directly. A quick call or email is the fastest way.', chips: [{ label: 'Book a call', action: 'book' }, { label: 'Email me', action: 'email' }] },
  resume: { text: 'Here\'s my resume:', card: 'resume', chips: [{ label: 'Book a call', action: 'book' }, { label: 'Experience', action: 'experience' }] },
  contact: { text: 'You can reach me here:', card: 'contact', chips: [{ label: 'Book a call', action: 'book' }] },
  personal: { text: 'Nice to meet you! For personal messages, email or LinkedIn reach me fastest:', card: 'contact' },
  thanks: { text: 'Anytime! Anything else I can help with?', chips: suggest.slice(0, 4) },
  greet: { text: 'Hey! Ask me about my skills, experience or availability, or book a call.', chips: suggest.slice(0, 4) },
};

function Chat({ open, setOpen, onSchedule }: { open: boolean; setOpen: (o: boolean) => void; onSchedule: () => void }) {
  const now = useNow();
  const [msgs, setMsgs] = useState<CMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('idle');
  const [draft, setDraft] = useState<Partial<Booking>>({});
  const [pending, setPending] = useState('');
  const body = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(1);
  const days = useMemo(() => bookableDays(6), []);
  const vtz = useMemo(getVisitorTz, []);

  // restore this visit's conversation
  useEffect(() => {
    try { const s = sessionStorage.getItem('sm-chat'); if (s) { const m = JSON.parse(s) as CMsg[]; setMsgs(m); idRef.current = m.length + 1; } } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => { try { sessionStorage.setItem('sm-chat', JSON.stringify(msgs.map(m => ({ ...m, booking: undefined })))); } catch { /* */ } }, [msgs]);
  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' }); }, [msgs, typing]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350); }, [open]);

  const push = (m: Omit<CMsg, 'id' | 't'>) => setMsgs(list => [...list.map(x => ({ ...x, chips: undefined })), { ...m, id: idRef.current++, t: Date.now() }]);
  const bot = (items: Omit<CMsg, 'id' | 't' | 'from'>[]) => {
    setTyping(true);
    items.forEach((it, i) => setTimeout(() => { push({ from: 'bot', ...it }); if (i === items.length - 1) setTyping(false); }, 550 + i * 650));
  };
  useEffect(() => {
    if (open && msgs.length === 0) bot([
      { text: 'Hey, I\'m Siddharth 👋' },
      { text: `Security & pentest engineer based in ${baseLocation}, open to relocation. Ask me anything, or pick one:`, chips: [{ label: 'I\'m hiring', action: 'hiring' }, { label: 'Book a call', action: 'book' }, { label: 'View resume', action: 'resume' }, { label: 'Just saying hi', action: 'personal' }] },
    ]);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const startBooking = () => {
    if (calendlyUrl) { bot([{ text: 'Grab any open slot on my calendar:', chips: [{ label: 'Open booking page', action: 'calendly' }] }]); return; }
    setDraft({}); setMode('idle');
    bot([{ text: 'Let\'s find a time. What kind of call?', chips: callTypes.map(c => ({ label: `${c.label} · ${c.len} min`, action: 'bt:' + c.id })) }]);
  };
  const run = (action: string, label?: string) => {
    if (label) push({ from: 'me', text: label });
    if (action.startsWith('bt:')) { setDraft(d => ({ ...d, type: action.slice(3) })); bot([{ text: 'Video or phone?', chips: formats.map(f => ({ label: f.label, action: 'bf:' + f.id })) }]); return; }
    if (action.startsWith('bf:')) { setDraft(d => ({ ...d, format: action.slice(3) })); bot([{ text: 'Pick a day (Eastern Time):', chips: [...days.map(d => ({ label: d.short, action: 'bd:' + d.key })), { label: 'More dates…', action: 'wizard' }] }]); return; }
    if (action.startsWith('bd:')) {
      const day = days.find(d => d.key === action.slice(3))!;
      setDraft(d => ({ ...d, day }));
      bot([{ text: `What time on ${day.short}? (ET)`, chips: slotTimes.map(([h, m], i) => ({ label: fmtTime(homeToDate(day.y, day.m, day.d, h, m), homeTimeZone), action: 'bs:' + i })) }]);
      return;
    }
    if (action.startsWith('bs:')) { setDraft(d => ({ ...d, slot: +action.slice(3) })); setMode('b-name'); bot([{ text: 'Perfect. What\'s your name?' }]); return; }
    switch (action) {
      case 'book': return startBooking();
      case 'wizard': setOpen(false); onSchedule(); return;
      case 'calendly': window.open(calendlyUrl, '_blank', 'noopener'); return;
      case 'skip-company': return finishBooking('');
      case 'email': window.location.href = mailto('Hi Siddharth', 'Hi Siddharth,\n\n'); return;
      case 'send-pending': window.location.href = mailto('Message from your portfolio', pending); bot([{ text: 'Your email app should be open with your message. Press send and I\'ll get back to you soon!' }]); return;
      case 'transcript': return sendTranscript();
      case 'more': bot([{ text: 'What would you like to know?', chips: suggest }]); return;
      default: {
        const a = answers[action];
        if (a) bot([{ text: a.text, card: a.card, chips: a.chips }]);
      }
    }
  };
  const finishBooking = (company: string) => {
    const b = { ...draft, company, role: '', phone: '', notes: '' } as Booking;
    setDraft(b); setMode('idle');
    notify(`📅 New call booking (chat): ${b.name}${b.company ? ` (${b.company})` : ''}`, bookingFields(b), b.email);
    bot([{ text: 'Here\'s your call. I\'ve been notified, and adding it to your calendar sends me the invite:', card: 'booking', booking: b, chips: [{ label: 'Change time', action: 'book' }, { label: 'Ask something else', action: 'more' }] }]);
  };
  const send = () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    push({ from: 'me', text: t });
    if (mode === 'b-name') { setDraft(d => ({ ...d, name: t })); setMode('b-email'); bot([{ text: `Thanks, ${t.split(' ')[0]}! What's your work email?` }]); return; }
    if (mode === 'b-email') {
      if (!validEmail(t)) { bot([{ text: 'Hmm, that doesn\'t look like an email. Could you check it?' }]); return; }
      setDraft(d => ({ ...d, email: t })); setMode('b-company'); bot([{ text: 'And your company? (optional)', chips: [{ label: 'Skip', action: 'skip-company' }] }]); return;
    }
    if (mode === 'b-company') return finishBooking(t);
    const hit = intents.find(([re]) => re.test(t));
    if (hit) return run(hit[1]);
    setPending(t);
    const who = draft.email ? `${draft.name || ''} <${draft.email}>` : 'Anonymous visitor';
    notify('💬 New question from your portfolio chat', { 'Question': t, 'From': who, 'Conversation': msgs.slice(-8).map(m => `${m.from === 'me' ? 'Visitor' : 'Bot'}: ${m.text || '[' + m.card + ']'}`).join('\n') }, draft.email);
    bot([{ text: 'Good question! I\'ve passed it to Siddharth. If you\'d like a reply, send it from your email too, or book a quick call:', chips: [{ label: 'Send to Siddharth', action: 'send-pending' }, { label: 'Book a call', action: 'book' }, { label: 'Ask something else', action: 'more' }] }]);
  };
  const sendTranscript = () => {
    const tr = msgs.map(m => `${m.from === 'me' ? 'Visitor' : 'Siddharth (auto)'} · ${new Date(m.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}: ${m.text || '[' + m.card + ']'}`).join('\n');
    window.location.href = mailto('Chat from your portfolio', tr);
  };
  const reset = () => { setMsgs([]); setMode('idle'); setDraft({}); try { sessionStorage.removeItem('sm-chat'); } catch { /* */ } setTimeout(() => bot([{ text: 'Fresh start! What can I help with?', chips: suggest.slice(0, 4) }]), 50); };

  const renderCard = (m: CMsg) => {
    if (m.card === 'resume') return <div className="ccard"><img className="thumb" src={resumePages[0]} alt="" /><div><b>{fullName} · Resume</b><span>2 pages · PDF</span><div className="crow"><a className="cbtn pri" href={resume}><FileText size={14} />View</a><a className="cbtn" href={resume} download="SiddharthMuragundla_Resume.pdf" data-raw><Download size={14} />Download</a></div></div></div>;
    if (m.card === 'projects') return <div className="ccard col">{projects.map(p => <a key={p.title} className="cproj" href={p.repo || p.live || '#projects'} target={p.repo || p.live ? '_blank' : undefined} rel="noopener noreferrer" onClick={() => { if (!p.repo && !p.live) setOpen(false); }}><b>{p.title}</b><span>{p.tag}</span></a>)}</div>;
    if (m.card === 'contact') return <div className="ccard col"><a className="cproj" href={`mailto:${email}`}><b><Brand name="gmail" size={14} /> Email</b><span>{email}</span></a><a className="cproj" href={linkedinUrl} target="_blank" rel="noopener noreferrer"><b><Brand name="linkedin" size={14} /> LinkedIn</b><span>linkedin.com/in/siddhum</span></a><a className="cproj" href={githubUrl} target="_blank" rel="noopener noreferrer"><b><Brand name="github" size={14} /> GitHub</b><span>github.com/S18-01</span></a></div>;
    if (m.card === 'booking') {
      const b = m.booking || (draft as Booking);
      if (!b || !b.day || b.slot === undefined || !b.email) return null;
      const l = bookingLinks(b);
      return (
        <div className="ccard col bk">
          <div className="bk-h"><CalendarDays size={16} /><div><b>{l.t.label} · {l.t.len} min</b><span>{l.whenET}{vtz !== homeTimeZone ? ` · ${fmtTime(l.start, vtz)} your time` : ''}</span></div></div>
          <div className="bk-w"><User size={14} />{b.name}{b.company ? ` · ${b.company}` : ''} · {b.format === 'phone' ? 'Phone' : 'Video'}</div>
          <a className="cbtn pri" href={l.gcal} target="_blank" rel="noopener noreferrer" onClick={() => bot([{ text: 'Your calendar opened with me invited. Hit Save and you\'re all set! 🙌' }])}><CalendarDays size={14} />Add to Google Calendar</a>
          <div className="crow">
            <a className="cbtn" href={l.outlook} target="_blank" rel="noopener noreferrer"><CalendarDays size={14} />Outlook</a>
            <button className="cbtn" onClick={() => { window.location.href = l.mail; }}><Brand name="gmail" size={14} />Email</button>
            <button className="cbtn" onClick={() => downloadIcs(l.ics)}><Download size={14} />.ics</button>
          </div>
        </div>
      );
    }
    return null;
  };
  const placeholder = mode === 'b-name' ? 'Your name…' : mode === 'b-email' ? 'you@company.com' : mode === 'b-company' ? 'Company name…' : 'Ask about skills, experience, availability…';
  const last = msgs[msgs.length - 1];
  return (
    <>
      <button className={'chat-fab' + (open ? ' hide' : '')} onClick={() => setOpen(true)} aria-label="Open chat">
        <span className="av"><img src={portrait} alt="" /></span>
        <span className="t">Message me<small>{now ? `${homeTime(now)} ET · usually quick` : 'Usually replies quickly'}</small></span>
        <MessageCircle size={18} style={{ marginLeft: 2 }} />
      </button>
      <div className={'chat' + (open ? ' on' : '')} role="dialog" aria-label="Chat with Siddharth" aria-hidden={!open}>
        <div className="ch">
          <span className="cav"><img src={portrait} alt="" /></span>
          <div className="ch-id"><b>{fullName}</b><span className="st">{now ? `${replyStatus(now).split(' · ')[0]} · ${homeTime(now)} ET` : 'Online'}</span></div>
          <div className="ch-a">
            <button onClick={() => { setOpen(false); onSchedule(); }} aria-label="Book a call" title="Book a call"><CalendarDays size={16} /></button>
            <button onClick={sendTranscript} aria-label="Email this conversation" title="Email this conversation"><Send size={15} /></button>
            <button onClick={reset} aria-label="Restart chat" title="Restart chat"><RotateCcw size={15} /></button>
            <button onClick={() => setOpen(false)} aria-label="Close chat" title="Close"><X size={16} /></button>
          </div>
        </div>
        <div className="cb" ref={body}>
          <div className="cday">Today · replies are automated, I read everything you send</div>
          {msgs.map(m => (
            <div key={m.id} className={'mwrap ' + m.from}>
              {m.text && <div className={'msg ' + m.from}>{m.text}<time>{new Date(m.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}{m.from === 'me' && ' ✓✓'}</time></div>}
              {m.card && renderCard(m)}
              {m.chips && m === last && <div className="qr">{m.chips.map(c => <button key={c.action + c.label} onClick={() => run(c.action, c.label)}>{c.label}</button>)}</div>}
            </div>
          ))}
          {typing && <div className="typing"><i /><i /><i /></div>}
        </div>
        {mode === 'idle' && <div className="sug">{suggest.map(c => <button key={c.action} onClick={() => run(c.action, c.label)}>{c.label}</button>)}</div>}
        <form className="cf" onSubmit={e => { e.preventDefault(); send(); }}>
          <input ref={inputRef} className="inp" placeholder={placeholder} value={text} onChange={e => setText(e.target.value)} aria-label="Message" type={mode === 'b-email' ? 'email' : 'text'} />
          <button type="submit" aria-label="Send"><Send size={18} /></button>
        </form>
      </div>
    </>
  );
}

/* ---------- rating ---------- */
const rateLabels = ['', 'Needs work', 'Okay', 'Good', 'Great', 'Outstanding'];
function Rating() {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem('sm-rating'); if (s) { setScore(+s); setSent(true); } } catch { /* storage unavailable */ }
  }, []);
  const submit = () => {
    if (!score) return;
    try { localStorage.setItem('sm-rating', String(score)); } catch { /* storage unavailable */ }
    notify(`⭐ Portfolio rated ${score}/5`, { 'Rating': `${score}/5 (${rateLabels[score]})`, 'Comment': note || '-' });
    setSent(true);
  };
  const shown = hover || score;
  return (
    <div className="rate reveal">
      {sent ? (
        <div className="thanks">
          <div className="stars" aria-label={`You rated ${score} out of 5`}>{[1, 2, 3, 4, 5].map(i => <button key={i} className={i <= score ? 'on' : ''} disabled aria-hidden="true"><Star fill="currentColor" /></button>)}</div>
          <b>Thanks for rating!</b>
          <p>Your feedback means a lot. Want to tell me more? It goes straight to my inbox.</p>
          <div className="row">
            <a className="btn light" href={mailto(`Portfolio feedback: ${score}/5`, `Rating: ${score}/5 (${rateLabels[score]})\n\n${note}`)}><Send />Send feedback</a>
            <button className="btn ghost" onClick={() => { setSent(false); try { localStorage.removeItem('sm-rating'); } catch { /* */ } }}>Change rating</button>
          </div>
        </div>
      ) : (
        <>
          <h3>Rate this portfolio</h3>
          <p>How did it land? Your honest rating helps me improve.</p>
          <div className="stars" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map(i => <button key={i} role="radio" aria-checked={score === i} aria-label={`${i} star${i > 1 ? 's' : ''}`} className={i <= shown ? 'on' : ''} onMouseEnter={() => setHover(i)} onClick={() => setScore(i)}><Star fill="currentColor" /></button>)}
          </div>
          <div className="rlabel">{rateLabels[shown]}</div>
          <textarea className="inp" placeholder="What stood out, or what could be better? (optional)" value={note} onChange={e => setNote(e.target.value)} />
          <div className="row"><button className="btn light" onClick={submit} disabled={!score} style={{ opacity: score ? 1 : 0.5 }}><Star />Submit rating</button></div>
        </>
      )}
    </div>
  );
}

/* ---------- opening: secure access sequence (first visit of a session) ---------- */
const bootLog = ['Establishing encrypted TLS 1.3 session', `Verifying identity · ${fullName}`, 'Loading security profile & credentials', 'Access granted · welcome'];
function Boot({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<'load' | 'granted' | 'reveal' | 'open'>('load');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finished = useRef(false);
  const finish = (delay: number) => {
    if (finished.current) return;
    finished.current = true;
    setPhase('open');
    timers.current.push(setTimeout(onDone, delay));
  };
  useEffect(() => {
    if (document.documentElement.dataset.seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onDone(); return; }
    let raf = 0;
    const start = performance.now(), dur = 1700;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      setPct(Math.round((1 - Math.pow(1 - k, 2.2)) * 100));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    timers.current.push(setTimeout(() => setPhase(p => (p === 'load' ? 'granted' : p)), 1800));
    timers.current.push(setTimeout(() => finish(800), 2500));
    return () => { cancelAnimationFrame(raf); timers.current.forEach(clearTimeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const C = 2 * Math.PI * 58;
  const granted = phase !== 'load';
  const stepAt = [0, 28, 60, 100];
  return (
    <div className={'boot' + (granted ? ' granted' : '') + (phase === 'open' ? ' open' : '')} onClick={() => finish(900)} aria-hidden="true">
      <div className="boot-grid" />
      <div className="boot-in">
        <div className="boot-load">
          <div className="core">
            <svg viewBox="0 0 150 150">
              <circle className="dash" cx="75" cy="75" r="72" />
              <circle className="ticks" cx="75" cy="75" r="66" />
              <circle className="trk" cx="75" cy="75" r="58" />
              <circle className="bar" cx="75" cy="75" r="58" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
            </svg>
            <div className="halo" />
            <div className="mono">{granted ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>}</div>
          </div>
          <div className="boot-who">{fullName}</div>
          <div className="pct">{granted ? 'ACCESS GRANTED' : `SECURING CONNECTION · ${String(pct).padStart(3, '0')}%`}</div>
          <ul className="log">
            {bootLog.map((l, i) => {
              const on = pct >= stepAt[i] || granted;
              const ok = i < 3 ? pct >= stepAt[i + 1] || granted : granted;
              return <li key={l} className={(on ? 'on' : '') + (ok ? ' ok' : '') + (i === 3 && granted ? ' final' : '')}><i>{ok ? '✓' : '·'}</i>{l}</li>;
            })}
          </ul>
        </div>
      </div>
      <div className="skip">Click anywhere to skip</div>
    </div>
  );
}

/* ---------- resume viewer ---------- */
function ResumeViewer({ open, onClose, onHire, onSchedule }: { open: boolean; onClose: () => void; onHire: () => void; onSchedule: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const pagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { setPage(1); pagesRef.current?.scrollTo({ top: 0 }); }
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  const onScroll = () => {
    const el = pagesRef.current;
    if (!el) return;
    const kids = Array.from(el.querySelectorAll<HTMLElement>('.paper'));
    const mid = el.scrollTop + el.clientHeight * 0.35;
    let cur = 1;
    kids.forEach((k, i) => { if (k.offsetTop <= mid) cur = i + 1; });
    setPage(cur);
  };
  const z = (d: number) => setZoom(v => Math.min(1.6, Math.max(0.6, Math.round((v + d) * 10) / 10)));
  return (
    <div className={'rv' + (open ? ' on' : '')} role="dialog" aria-modal="true" aria-label="Resume" aria-hidden={!open} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rv-top">
        <div className="rv-id"><img src={portrait} alt="" /><div><b>{fullName} · Resume</b><span>Security Engineer · Pentest · SOC · Cloud</span></div></div>
        <div className="rv-tools">
          <button onClick={() => z(-0.2)} aria-label="Zoom out"><ZoomOut /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => z(0.2)} aria-label="Zoom in"><ZoomIn /></button>
          <button onClick={() => setZoom(1)} aria-label="Fit to width">Fit</button>
          <span>Page {page}/{resumePages.length}</span>
        </div>
        <div className="rv-act">
          <a className="btn light" href={resume} download="SiddharthMuragundla_Resume.pdf" data-raw><Download /><span>Download PDF</span></a>
          <a className="btn ghost" href={resume} target="_blank" rel="noopener noreferrer" data-raw><ExternalLink /><span>Open</span></a>
          <button className="rv-x" onClick={onClose} aria-label="Close resume"><X size={18} /></button>
        </div>
      </div>
      <div className="rv-body">
        <aside className="rv-side">
          <div className="avail">Open to full-time roles</div>
          <div className="roles-mini">{openRoles.map(r => <span key={r}>{r}</span>)}</div>
          <div>
            <h4>At a glance</h4>
            <div className="rv-fact"><Award /><div><small>Experience</small><b>4+ years in cybersecurity</b></div></div>
            <div className="rv-fact"><GraduationCap /><div><small>Education</small><b>M.Eng Cybersecurity, UMD · Dec 2026</b></div></div>
            <div className="rv-fact"><MapPin /><div><small>Location</small><b>{baseLocation}</b></div></div>
            <div className="rv-fact"><Plane /><div><small>Relocation</small><b>Open to relocation</b></div></div>
            <div className="rv-fact"><ShieldCheck /><div><small>Certifications</small><b>eCPPT · Google Cybersecurity · Security+ (in progress)</b></div></div>
          </div>
          <div>
            <h4>Core skills</h4>
            <div className="tags">{['Splunk', 'ELK', 'Burp Suite', 'Metasploit', 'Nessus', 'Nmap', 'MITRE ATT&CK', 'AWS', 'Kubernetes', 'Terraform', 'Python', 'Scikit-learn'].map(t => <span key={t}>{t}</span>)}</div>
          </div>
          <div className="btns">
            <HireButton onClick={() => { onClose(); onHire(); }} />
            <button className="btn call" onClick={() => { onClose(); onSchedule(); }}><CalendarDays />Book a call</button>
          </div>
        </aside>
        <div className="rv-pages" ref={pagesRef} onScroll={onScroll}>
          {resumePages.map((src, i) => (
            <div className="paper" key={src} style={{ width: `calc(min(100%, 820px) * ${zoom})` }}>
              <img src={src} alt={`Resume page ${i + 1}`} loading="eager" />
              <span className="pn">{i + 1} / {resumePages.length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- command palette (Ctrl/⌘ K) ---------- */
type Cmd = { group: string; label: string; hint?: string; icon: ReactNode; run: () => void };
function Palette({ open, onClose, cmds }: { open: boolean; onClose: () => void; cmds: Cmd[] }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  const list = cmds.filter(c => (c.label + ' ' + c.group).toLowerCase().includes(q.toLowerCase()));
  const go = (c?: Cmd) => { if (!c) return; onClose(); setTimeout(c.run, 60); };
  let lastGroup = '';
  return (
    <div className={'pal-wrap' + (open ? ' on' : '')} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-hidden={!open}>
      <div className="pal" role="dialog" aria-modal="true" aria-label="Quick actions">
        <div className="pal-in">
          <Search size={18} />
          <input ref={inputRef} value={q} placeholder="Jump to a section or action…" aria-label="Search actions"
            onChange={e => { setQ(e.target.value); setSel(0); }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel(i => Math.min(list.length - 1, i + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel(i => Math.max(0, i - 1)); }
              if (e.key === 'Enter') { e.preventDefault(); go(list[sel]); }
              if (e.key === 'Escape') onClose();
            }} />
          <kbd>Esc</kbd>
        </div>
        <div className="pal-list">
          {list.length === 0 && <div className="pal-empty">No matches. Try “resume” or “call”.</div>}
          {list.map((c, i) => {
            const head = c.group !== lastGroup; lastGroup = c.group;
            return (
              <div key={c.group + c.label}>
                {head && <div className="pal-g">{c.group}</div>}
                <button className={'pal-i' + (i === sel ? ' on' : '')} onMouseEnter={() => setSel(i)} onClick={() => go(c)}>
                  <span className="pi">{c.icon}</span><span className="pl">{c.label}</span>{c.hint && <span className="ph">{c.hint}</span>}{i === sel && <CornerDownLeft size={14} className="pe" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="pal-f"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>Ctrl</kbd><kbd>K</kbd> toggle</span></div>
      </div>
    </div>
  );
}

/* ---------- music player: real music via Spotify embeds (never autoplays) ---------- */
// Swap these for your own Spotify playlists: open a playlist > Share > Copy link, and paste the ID after /playlist/
const playlists = [
  { name: 'Lo-fi focus', id: '37i9dQZF1DWWQRwui0ExPn' },
  { name: 'Deep focus', id: '37i9dQZF1DWZeKCadgRdKQ' },
  { name: 'Chill hits', id: '37i9dQZF1DX4WYpdgoIcn6' },
];
function MusicPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [pi, setPi] = useState(0);
  useEffect(() => { if (open) setLoaded(true); }, [open]);
  return (
    <div className={'player' + (open ? ' on' : '')} role="dialog" aria-label="Music player" aria-hidden={!open}>
      <div className="player-h">
        <span className="pic"><Music size={18} /></span>
        <div><b>Listen while you browse</b><span>Real music via Spotify · nothing plays until you press play</span></div>
        <button onClick={onClose} aria-label="Close music player"><X size={16} /></button>
      </div>
      <div className="player-tabs">{playlists.map((p, i) => <button key={p.id} className={i === pi ? 'on' : ''} onClick={() => setPi(i)}>{p.name}</button>)}</div>
      {loaded && <iframe key={playlists[pi].id} title={`Spotify playlist: ${playlists[pi].name}`} src={`https://open.spotify.com/embed/playlist/${playlists[pi].id}?utm_source=generator&theme=0`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />}
      <p>Log in to Spotify in this browser for full tracks; otherwise Spotify plays previews.</p>
    </div>
  );
}

/* ---------- project case study ---------- */
type Project = (typeof projects)[number];
function CaseStudy({ idx, onClose, onNav, onSchedule }: { idx: number | null; onClose: () => void; onNav: (i: number) => void; onSchedule: () => void }) {
  const open = idx !== null;
  const p: Project = projects[idx ?? 0];
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  return (
    <div className={'cs-wrap' + (open ? ' on' : '')} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-hidden={!open}>
      <article className="cs" role="dialog" aria-modal="true" aria-label={p.title + ' case study'} key={p.title}>
        <header className="cs-h">
          <div className="cs-tag"><Layers size={14} />Case study {p.number} · {p.tag}</div>
          <button className="hp-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
          <h3>{p.title}</h3>
          <p>{p.overview}</p>
          <div className="cs-links">
            {p.live && <a className="btn light" href={p.live} target="_blank" rel="noopener noreferrer"><ExternalLink />Live project</a>}
            {p.repo && <a className="btn ghost" href={p.repo} target="_blank" rel="noopener noreferrer"><Brand name="github" size={16} />Source code</a>}
            {!p.live && !p.repo && <span className="chip">More details on request</span>}
          </div>
        </header>
        <div className="cs-stats">{p.highlights.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div>
        <div className="cs-body">
          <section><h4>What I built</h4><ul>{p.points.map((x, i) => <li key={i}>{x}</li>)}</ul></section>
          <section><h4>Security coverage</h4><div className="tags">{p.security.map(x => <span key={x}>{x}</span>)}</div>
            <h4 style={{ marginTop: 22 }}>Tech stack</h4><div className="pills">{p.stack.map(x => <span className="pill" key={x}>{x}</span>)}</div></section>
        </div>
        <footer className="cs-f">
          <button className="btn ghost" onClick={() => onNav(((idx ?? 0) + projects.length - 1) % projects.length)}><ChevronLeft size={16} />{projects[((idx ?? 0) + projects.length - 1) % projects.length].title}</button>
          <button className="btn call" onClick={() => { onClose(); onSchedule(); }}><CalendarDays />Discuss this project</button>
          <button className="btn ghost" onClick={() => onNav(((idx ?? 0) + 1) % projects.length)}>{projects[((idx ?? 0) + 1) % projects.length].title}<ChevronRight size={16} /></button>
        </footer>
      </article>
    </div>
  );
}

/* ---------- cursor glow (desktop only) ---------- */
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; if (ref.current) ref.current.style.opacity = '1'; };
    const loop = () => { cx += (x - cx) * 0.12; cy += (y - cy) * 0.12; if (ref.current) ref.current.style.transform = `translate(${cx - 300}px, ${cy - 300}px)`; raf = requestAnimationFrame(loop); };
    window.addEventListener('pointermove', move, { passive: true }); raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
  return <div className="cglow" ref={ref} aria-hidden="true" />;
}

/* ---------- count-up numbers ---------- */
function CountUp({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => { const k = Math.min(1, (t - t0) / 1200); setV(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>;
}

/* ---------- About: 3D portrait card (drag / swipe to spin with momentum, optional auto-rotate) ---------- */
function ProfileVisual() {
  const cardRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [auto, setAuto] = useState(true);
  const autoRef = useRef(true);
  const st = useRef({ ry: 0, rx: 0, trx: 0, v: 0, drag: false, lx: 0, lt: 0, hover: false, seen: false });
  useEffect(() => { autoRef.current = auto; }, [auto]);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { autoRef.current = false; setAuto(false); }
    const box = boxRef.current; if (!box) return;
    const io = new IntersectionObserver(es => { st.current.seen = es[0].isIntersecting; }, { threshold: 0.15 });
    io.observe(box);
    let raf = 0, last = performance.now();
    const SPEED = 0.024; // deg per ms: one full turn every 15 s
    const loop = (t: number) => {
      const dt = Math.min(48, t - last); last = t;
      const s = st.current, el = cardRef.current;
      if (el && s.seen) {
        if (!s.drag) {
          if (autoRef.current) {
            const target = s.hover ? SPEED * 0.35 : SPEED;
            s.v += (target - s.v) * Math.min(1, dt / 420);
          } else {
            s.v *= Math.pow(0.9935, dt);
            if (Math.abs(s.v) < 0.02) { // settle on the nearest face
              const goal = Math.round(s.ry / 180) * 180;
              s.ry += (goal - s.ry) * Math.min(1, dt / 160);
              s.v = 0;
            }
          }
          s.ry += s.v * dt;
        }
        s.rx += (s.trx - s.rx) * Math.min(1, dt / 120);
        const rad = (s.ry * Math.PI) / 180;
        el.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
        el.style.setProperty('--sheen', (50 - Math.sin(rad) * 70).toFixed(1) + '%');
        el.style.setProperty('--lit', (0.55 + 0.45 * Math.abs(Math.cos(rad))).toFixed(3));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = st.current; s.drag = true; s.lx = e.clientX; s.lt = performance.now(); s.v = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = st.current, r = e.currentTarget.getBoundingClientRect();
    if (s.drag) {
      const now = performance.now(), dx = e.clientX - s.lx, dt = Math.max(1, now - s.lt);
      s.ry += dx * 0.55; s.v = s.v * 0.4 + ((dx * 0.55) / dt) * 0.6; s.lx = e.clientX; s.lt = now;
      s.trx = Math.max(-10, Math.min(10, ((e.clientY - r.top) / r.height - 0.5) * -14));
    } else if (e.pointerType === 'mouse') {
      s.hover = true; s.trx = ((e.clientY - r.top) / r.height - 0.5) * -10;
    }
  };
  const up = () => {
    const s = st.current; if (!s.drag) return; s.drag = false; s.trx = 0;
    s.v = Math.max(-1.2, Math.min(1.2, s.v));
  };
  const leave = () => { const s = st.current; s.hover = false; if (!s.drag) s.trx = 0; };
  const face = (img: string, tl: string, tr: string, bl: string, back?: boolean) => (
    <div className={'pv-face' + (back ? ' pv-back' : '')}>
      <div className="pv-spot" />
      <div className="pv-grid" />
      <div className="pv-floor" />
      <img className="pv-img" src={img} alt={back ? '' : fullName} draggable={false} />
      <div className="pv-fade" />
      <div className="pv-sheen" />
      <i className="pv-c tl" /><i className="pv-c tr" /><i className="pv-c bl" /><i className="pv-c br" />
      <span className="pv-lab l">{tl}</span><span className="pv-lab r">{tr}</span>
      <span className="pv-id">{bl}</span>
    </div>
  );
  return (
    <div className="pv reveal">
      <div className="pv-3d" ref={boxRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={leave} aria-label="Drag to rotate the portrait">
        <div className="pv-card" ref={cardRef}>
          {face(portraitFront, 'SEC-ENG', 'MD · USA', 'SIDDHARTH MURAGUNDLA')}
          {face(portraitBack, 'OFFENSIVE · DEFENSIVE', 'CLOUD', 'OPEN TO RELOCATION', true)}
        </div>
        <div className="pv-shadow" />
      </div>
      <div className="pv-bar">
        <div className="pv-status"><span className="sd" />Open to work · Relocation ✓</div>
        <button className={'pv-auto' + (auto ? ' on' : '')} onClick={() => setAuto(a => !a)} aria-pressed={auto} title={auto ? 'Pause rotation' : 'Auto-rotate 360°'}>
          {auto ? <Pause size={14} /> : <Rotate3d size={15} />}<span>{auto ? 'Pause' : 'Auto 360°'}</span>
        </button>
      </div>
      <p className="pv-hint">Drag or swipe the photo to spin it</p>
    </div>
  );
}

/* ---------- role fit: recruiters pick a role, see the matching evidence ---------- */
function RoleFit({ onCase, onSchedule }: { onCase: (title: string) => void; onSchedule: () => void }) {
  const [i, setI] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const r = roleFit[i];
  // fit exactly the first 3 points in view; the rest are a scroll away
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const size = () => {
      const lis = el.querySelectorAll('li');
      if (lis.length < 4) { el.style.maxHeight = ''; setAtEnd(true); return; }
      el.style.maxHeight = (lis[3] as HTMLElement).offsetTop - (lis[0] as HTMLElement).offsetTop + 'px';
      el.scrollTop = 0; setAtEnd(false);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(el);
    return () => ro.disconnect();
  }, [i]);
  return (
    <div className="fit reveal">
      <div className="fit-h">
        <div><b>Hiring for a specific role?</b><span>Pick it and see exactly how my experience matches.</span></div>
      </div>
      <div className="fit-tabs" role="tablist" aria-label="Role">{roleFit.map((x, k) => <button key={x.role} role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{x.role}</button>)}</div>
      <div className="fit-body" key={r.role}>
        <div className="fit-main">
          <div className="fit-t"><Target size={18} />Why I fit: {r.role}</div>
          <div className={'fit-scroll' + (atEnd ? ' end' : '')} ref={listRef} onScroll={e => { const el = e.currentTarget; setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 6); }}>
            <ul>{r.fit.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul>
          </div>
          {!atEnd && <div className="fit-more">Scroll for more ↓</div>}
        </div>
        <div className="fit-side">
          <small>Tools for this role</small>
          <div className="tags">{r.tools.map(t => <span key={t}>{t}</span>)}</div>
          <small>Related work</small>
          <div className="fit-work">{r.work.map(w => <button key={w} onClick={() => onCase(w)}><Layers size={14} />{w}<ArrowRight size={14} /></button>)}</div>
          <button className="btn light" onClick={onSchedule}><CalendarDays />Talk about this role</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- save contact (vCard) + share ---------- */
function saveContact() {
  const v = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${fullName}`, 'N:Muragundla;Siddharth;;;', 'TITLE:Security Engineer · Pentest · SOC · Cloud', `EMAIL;TYPE=INTERNET:${email}`, 'ADR;TYPE=HOME:;;;;Maryland;;USA', `URL:${linkedinUrl}`, `X-SOCIALPROFILE;TYPE=github:${githubUrl}`, 'NOTE:Open to full-time roles · Open to relocation', 'END:VCARD'].join('\r\n');
  try {
    const url = URL.createObjectURL(new Blob([v], { type: 'text/vcard' }));
    const a = document.createElement('a'); a.href = url; a.download = 'Siddharth-Muragundla.vcf';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch { /* downloads blocked */ }
}
async function sharePortfolio(toast: (m: string) => void) {
  const data = { title: `${fullName} · Security Engineer`, text: 'Security Engineer · Pentest · SOC · Cloud · DevSecOps', url: window.location.href };
  try {
    if (navigator.share) { await navigator.share(data); return; }
    await navigator.clipboard.writeText(data.url); toast('Portfolio link copied');
  } catch { /* cancelled or blocked */ }
}

/* ================= page ================= */
export default function Home() {
  const now = useNow();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hireOpen, setHireOpen] = useState(false);
  const [schedOpen, setSchedOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [palOpen, setPalOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [caseIdx, setCaseIdx] = useState<number | null>(null);
  const [skillTab, setSkillTab] = useState('All');
  const [toastMsg, setToastMsg] = useState('');
  const [musicOpen, setMusicOpen] = useState(false);
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = (m: string) => { setToastMsg(m); if (toastT.current) clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(''), 2200); };
  const [showTop, setShowTop] = useState(false);
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);
  const [videoOk, setVideoOk] = useState(false);
  const [deg, setDeg] = useState(0);
  const [theme, setThemeState] = useState<Theme>('dark');
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState('home');
  const [ind, setInd] = useState({ x: 0, w: 0, on: false });

  // Ctrl/⌘ K opens quick actions; back-to-top appears after the hero
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalOpen(o => !o); } };
    const onScroll = () => setShowTop(window.scrollY > (heroRef.current?.offsetHeight || 1200));
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll); };
  }, []);

  // After the opening, greet visitors once per session: chat opens on desktop, a bubble on phones
  // Returning visitors this session skip the opening (marked before paint by the layout script, so nothing flashes)
  useEffect(() => { if (document.documentElement.dataset.seen) setBooted(true); }, []);

  useEffect(() => {
    if (!booted) return;
    const t = setTimeout(() => {
      try { if (sessionStorage.getItem('sm-greeted')) return; sessionStorage.setItem('sm-greeted', '1'); } catch { /* storage unavailable */ }
      if (window.innerWidth >= 760) { setChatOpen(true); return; }
      // phones: wait until the visitor scrolls past the hero so the bubble never covers the buttons
      const onScroll = () => {
        const hero = heroRef.current;
        if (hero && window.scrollY > hero.offsetHeight - window.innerHeight * 0.6) { setTeaser(true); window.removeEventListener('scroll', onScroll); }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }, 1600);
    return () => clearTimeout(t);
  }, [booted]);

  // Every resume link opens the viewer (links marked data-raw open the PDF itself)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.(`a[href="${resume}"]`);
      if (!a || a.hasAttribute('data-raw')) return;
      e.preventDefault();
      setHireOpen(false);
      setResumeOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Theme: restore saved choice, apply to <html>
  useEffect(() => {
    const cur = document.documentElement.dataset.theme as Theme | undefined;
    if (cur === 'light' || cur === 'graphite' || cur === 'dark') setThemeState(cur);
  }, []);
  const setTheme = (t: Theme) => {
    setThemeState(t);
    toast(`${t === 'dark' ? 'Midnight' : t === 'light' ? 'Light' : 'Graphite'} theme`);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('sm-theme', t); } catch { /* storage unavailable */ }
  };

  // Scrollspy + page progress
  useEffect(() => {
    const ids = ['home', 'why', ...navigation.map(n => n.toLowerCase())];
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      navRef.current?.style.setProperty('--sp', (h > 0 ? (window.scrollY / h) * 100 : 0).toFixed(2) + '%');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);
  useEffect(() => {
    const place = () => {
      const a = linksRef.current?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
      setInd(a ? { x: a.offsetLeft, w: a.offsetWidth, on: true } : i => ({ ...i, on: false }));
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  // Hero: scroll turns the portrait and pops roles in one by one
  useEffect(() => {
    // smoothed: the turn eases toward the scroll position so touch/trackpad flicks glide instead of jumping
    let cur = -1, target = 0, raf = 0;
    const apply = (p: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const turnP = Math.min(1, Math.max(0, (p - 0.04) / 0.9));
      const seg = turnP * 2, k = Math.min(1, Math.floor(seg)), f = Math.min(1, seg - k);
      const ease = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
      const angle = 180 * (k + ease);
      const c = Math.abs(Math.cos((angle * Math.PI) / 180));
      stage.style.setProperty('--ry', angle.toFixed(2) + 'deg');
      stage.style.setProperty('--bl', (Math.pow(1 - c, 2) * 18).toFixed(2) + 'px');
      stage.style.setProperty('--op', (0.12 + 0.88 * Math.pow(c, 0.7)).toFixed(3));
      stage.style.setProperty('--bb', (1 + (1 - c) * 0.7).toFixed(3));
      stage.style.setProperty('--bu', Math.pow(1 - c, 2.2).toFixed(3));
      stage.style.setProperty('--sc', (0.94 + 0.06 * c).toFixed(3));
      stage.style.setProperty('--sx', (50 + Math.sin((angle * Math.PI) / 180) * 16).toFixed(1) + '%');
      stage.style.setProperty('--sa', (0.24 + Math.sin(turnP * Math.PI) * 0.18).toFixed(3));
      barRef.current?.style.setProperty('--p', (p * 100).toFixed(1) + '%');
      setDeg(Math.round(angle));
      setStep(Math.min(roles.length - 1, Math.floor(turnP * roles.length * 0.999)));
      const v = videoRef.current;
      if (v && v.duration) v.currentTime = turnP * (v.duration - 0.05);
    };
    const tick = () => {
      const d = target - cur;
      cur = Math.abs(d) < 0.0004 ? target : cur + d * 0.14;
      apply(cur);
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const max = hero.offsetHeight - window.innerHeight;
      target = Math.min(1, Math.max(0, window.scrollY / max));
      if (cur < 0) { cur = target; apply(cur); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (step === shown) return;
    setFading(true);
    const t = setTimeout(() => { setShown(step); setFading(false); }, 280);
    return () => clearTimeout(t);
  }, [step, shown]);

  // Magnetic pull on the main call-to-action buttons (mouse only)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.cta .hire, .cta .btn, .about-cta .btn, .why-cta .btn'));
    const mv = (e: PointerEvent) => { const el = e.currentTarget as HTMLElement, r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`; };
    const out = (e: PointerEvent) => { (e.currentTarget as HTMLElement).style.transform = ''; };
    els.forEach(el => { el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', out); });
    return () => els.forEach(el => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', out); });
  }, []);

  // Reveal on scroll + card glow
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    const boxes = Array.from(document.querySelectorAll<HTMLElement>('.box'));
    const move = (e: PointerEvent) => {
      const c = e.currentTarget as HTMLElement, r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px');
      c.style.setProperty('--my', e.clientY - r.top + 'px');
    };
    boxes.forEach(b => b.addEventListener('pointermove', move));
    return () => { io.disconnect(); boxes.forEach(b => b.removeEventListener('pointermove', move)); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setHireOpen(false); setSchedOpen(false); setChatOpen(false); setResumeOpen(false); setMusicOpen(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openHire = () => { setMenuOpen(false); setHireOpen(true); };
  const openSchedule = () => {
    setHireOpen(false); setMenuOpen(false);
    if (calendlyUrl) { window.open(calendlyUrl, '_blank', 'noopener'); return; }
    setSchedOpen(true);
  };
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(email); setCopied(true); toast('Email copied to clipboard'); setTimeout(() => setCopied(false), 1800); } catch { toast(email); }
  };
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cmds: Cmd[] = [
    { group: 'Actions', label: 'Book a call', hint: '15–45 min', icon: <CalendarDays size={16} />, run: openSchedule },
    { group: 'Actions', label: 'View resume', hint: 'PDF', icon: <FileText size={16} />, run: () => setResumeOpen(true) },
    { group: 'Actions', label: 'Message me', icon: <MessageCircle size={16} />, run: () => setChatOpen(true) },
    { group: 'Actions', label: 'Hire me: contact options', icon: <Send size={16} />, run: openHire },
    { group: 'Actions', label: 'Copy email address', hint: email, icon: <Copy size={16} />, run: copyEmail },
    { group: 'Actions', label: 'Save contact card', hint: '.vcf', icon: <User size={16} />, run: () => { saveContact(); toast('Contact card downloaded'); } },
    { group: 'Actions', label: 'Share this portfolio', icon: <Send size={16} />, run: () => sharePortfolio(toast) },
    ...['Home', 'About', 'Why hire me', ...navigation.slice(1)].map(n => ({ group: 'Go to', label: n, icon: <ChevronRight size={16} />, run: () => jump(n === 'Why hire me' ? 'why' : n.toLowerCase()) })),
    { group: 'Actions', label: 'Open music player', hint: 'Spotify', icon: <Music size={16} />, run: () => { setChatOpen(false); setMusicOpen(true); } },
    { group: 'Theme', label: 'Midnight (dark)', icon: <Moon size={16} />, run: () => setTheme('dark') },
    { group: 'Theme', label: 'Light', icon: <Sun size={16} />, run: () => setTheme('light') },
    { group: 'Theme', label: 'Graphite', icon: <Contrast size={16} />, run: () => setTheme('graphite') },
    { group: 'Links', label: 'LinkedIn', icon: <Brand name="linkedin" size={16} />, run: () => window.open(linkedinUrl, '_blank', 'noopener') },
    { group: 'Links', label: 'GitHub', icon: <Brand name="github" size={16} />, run: () => window.open(githubUrl, '_blank', 'noopener') },
  ];
  const r = roles[shown];
  const timeStr = now ? homeTime(now) : '--:--';
  const navLinks = (close?: boolean) => navigation.map(n => <a key={n} href={'#' + n.toLowerCase()} className={active === n.toLowerCase() ? 'act' : undefined} onClick={close ? () => setMenuOpen(false) : undefined}>{n}</a>);

  return (
    <main>


      {!booted && <Boot onDone={() => { setBooted(true); try { sessionStorage.setItem('sm-booted', '1'); } catch { /* */ } document.documentElement.dataset.seen = '1'; }} />}
      <a className="skip-link" href="#about">Skip to content</a>
      <Palette open={palOpen} onClose={() => setPalOpen(false)} cmds={cmds} />
      <CaseStudy idx={caseIdx} onClose={() => setCaseIdx(null)} onNav={setCaseIdx} onSchedule={openSchedule} />
      <CursorGlow />
      <nav className="dots" aria-label="Section progress">
        {[['home', 'Intro'], ['about', 'About'], ['why', 'Why hire me'], ['focus', 'Focus'], ['skills', 'Skills'], ['projects', 'Projects'], ['experience', 'Experience'], ['recognition', 'Recognition'], ['contact', 'Contact']].map(([id, label]) => (
          <a key={id} href={'#' + id} className={active === id ? 'on' : ''} aria-label={label}><span>{label}</span></a>
        ))}
      </nav>
      <MusicPlayer open={musicOpen} onClose={() => setMusicOpen(false)} />
      <div className={'toast' + (toastMsg ? ' on' : '')} role="status" aria-live="polite"><Check size={15} />{toastMsg}</div>
      <button className={'totop' + (showTop ? ' on' : '')} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUp size={18} /></button>

      <header className="nav" ref={navRef}>
        <div className="nav-in">
          <a href="#home" className="logo" aria-label={`${fullName} home`}><span className="mk">SM</span><span className="nm">{fullName}<small>Security Engineer · {baseLocation}</small></span><span className="nm-m">Siddharth Muragundla</span></a>
          <nav className="links" ref={linksRef} aria-label="Main navigation">
            <span className="ind" aria-hidden="true" style={{ transform: `translateX(${ind.x}px)`, width: ind.w, opacity: ind.on ? 1 : 0 }} />
            {navLinks()}
          </nav>
          <div className="nav-r">
            <button className="kbtn" onClick={() => setPalOpen(true)} aria-label="Quick actions (Ctrl K)" title="Quick actions (Ctrl K)"><Search size={15} /><kbd>⌘K</kbd></button>
            <button className={'kbtn mus' + (musicOpen ? ' on' : '')} onClick={() => { setChatOpen(false); setMusicOpen(o => !o); }} aria-label="Music player" aria-expanded={musicOpen} title="Music"><Music size={15} /></button>
            <ThemeSwitch theme={theme} setTheme={setTheme} />
            <HireButton onClick={openHire} />
            <button className="menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
        <nav className={'mob' + (menuOpen ? ' on' : '')} aria-label="Mobile navigation">
          {navLinks(true)}
          <div className="mob-extra"><ThemeSwitch theme={theme} setTheme={setTheme} /><button className="kbtn mus show" onClick={() => { setMenuOpen(false); setMusicOpen(true); }} aria-label="Music player"><Music size={15} /><span>Music</span></button></div>
        </nav>
        <span className="prog" aria-hidden="true" />
      </header>

      {/* hire panel */}
      <div className={'scrim' + (hireOpen || schedOpen ? ' on' : '')} onClick={() => { setHireOpen(false); setSchedOpen(false); }} />
      <div className={'hp' + (hireOpen ? ' on' : '')} role="dialog" aria-modal="true" aria-label="Contact Siddharth" aria-hidden={!hireOpen}>
        <button className="hp-x" onClick={() => setHireOpen(false)} aria-label="Close"><X size={18} /></button>
        <div className="hp-top"><img src={portrait} alt="" /><div><b>{fullName}</b><span>Security · Pentest · SOC · Cloud · DevSecOps</span></div></div>
        <div className="avail">Open to full-time roles</div>
        <div className="roles-mini">{openRoles.slice(0, 6).map(r => <span key={r}>{r}</span>)}</div>
        <div className="meta-row">
          <span className="chip"><MapPin />Based in {baseLocation}</span>
          <span className="chip now"><Plane />Open to relocation</span>
          <span className="chip"><Clock />{timeStr} ET</span>
        </div>
        <button className="hp-row pri" onClick={openSchedule}><CalendarDays /><span className="t">Schedule a call</span><em>15–45 min</em></button>
        <a className="hp-row" href={`mailto:${email}`}><Brand name="gmail" /><span className="t">{email}</span><em>Email</em></a>
        <button className="hp-row" onClick={copyEmail}>{copied ? <Check /> : <Copy />}<span className="t">{copied ? 'Copied to clipboard' : 'Copy email address'}</span></button>
        <a className="hp-row" href={linkedinUrl} target="_blank" rel="noopener noreferrer"><Brand name="linkedin" /><span className="t">Connect on LinkedIn</span><em>↗</em></a>
        <a className="hp-row" href={resume} onClick={() => setHireOpen(false)}><FileText /><span className="t">View resume</span><em>PDF</em></a>
        <a className="hp-row" href={githubUrl} target="_blank" rel="noopener noreferrer"><Brand name="github" /><span className="t">GitHub projects</span><em>↗</em></a>
        <div className="hp-two">
          <button className="hp-row" onClick={() => { saveContact(); toast('Contact card downloaded'); }}><User /><span className="t">Save contact</span></button>
          <button className="hp-row" onClick={() => sharePortfolio(toast)}><Send /><span className="t">Share portfolio</span></button>
        </div>
      </div>

      <Schedule open={schedOpen} onClose={() => setSchedOpen(false)} />
      <Chat open={chatOpen} setOpen={o => { setChatOpen(o); setTeaser(false); }} onSchedule={openSchedule} />
      {teaser && !chatOpen && (
        <div className="teaser" onClick={() => { setTeaser(false); setChatOpen(true); }} role="button" tabIndex={0}>
          <button onClick={e => { e.stopPropagation(); setTeaser(false); }} aria-label="Dismiss"><X size={14} /></button>
          <b>Hi, I&apos;m Siddharth 👋</b>
          <span>Hiring for Security, Pentest, SOC, Cloud or DevSecOps? Tap to chat or book a quick call.</span>
        </div>
      )}
      <ResumeViewer open={resumeOpen} onClose={() => setResumeOpen(false)} onHire={openHire} onSchedule={openSchedule} />

      <section className="hero" id="home" ref={heroRef}>
        <div className="stage" ref={stageRef}>
          <div className="grid-bg" aria-hidden="true" />
          <div className="spot" aria-hidden="true" />
          <div className="ring" aria-hidden="true" />
          <div className="floor" aria-hidden="true" />
          <video ref={videoRef} className="vid" src={turnaroundVideo} muted playsInline preload="auto"
            onLoadedData={() => setVideoOk(true)} onError={() => setVideoOk(false)}
            style={{ display: videoOk ? 'block' : 'none' }} aria-hidden="true" />
          {!videoOk && <Spinner />}
          <div className="shade" aria-hidden="true" />

          <div className="hi">
            <div className="loc"><span><MapPin />Based in {baseLocation}</span><span className="g"><Plane />Open to relocation</span></div>
            <small>HI, I&apos;M <b>SIDDHARTH MURAGUNDLA</b></small>
            <h1 className={'title' + (fading ? ' out' : '')}><span className="take">{r.a}</span><span className="take">{r.b}</span></h1>
            <p className={fading ? 'out' : ''}>{r.p}</p>
          </div>

          <div className="roles" aria-label="Roles">
            <h4>Positions</h4>
            {roles.map((x, i) => (
              <div key={x.short} className={'role' + (i <= step ? ' on' : '') + (i === step ? ' cur' : '')}>
                <i>{i <= step ? '✓' : i + 1}</i>{x.short}
              </div>
            ))}
          </div>

          <div className="cta"><HireButton onClick={openHire} big /><button className="btn call" onClick={openSchedule}><CalendarDays />Book a call</button></div>
          <div className="scrub"><span>Scroll to turn</span><div className="bar"><i ref={barRef} /></div><span className="deg">{deg}°</span><button className="skipb" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Skip to profile">Skip ↓</button></div>
        </div>
      </section>

      <section className="snap" aria-label="Recruiter snapshot">
        <div className="wrap">
          <div className="snap-in reveal">
            <div><small><ShieldCheck />Target roles</small><b>Security Eng · Pentest · SOC · Cloud · DevSecOps</b></div>
            <div><small><Award />Experience</small><b>4+ years in cybersecurity</b></div>
            <div><small><FileText />Education</small><b>M.Eng Cybersecurity, UMD<em>Graduating Dec 2026</em></b></div>
            <div><small><MapPin />Location</small><b>{baseLocation}<em>Open to relocation</em></b></div>
            <div className="clock"><small><Clock />My local time</small><b>{now ? homeTime(now, true) : '--:--'} ET<em>{now ? replyStatus(now).split(' · ')[0] : ''}</em></b></div>
            <div className="snap-act">
              <HireButton onClick={openHire} />
              <button className="btn call" onClick={openSchedule}><CalendarDays />Book a call</button>
              <a className="btn ghost" href={resume}><FileText />Resume</a>
            </div>
          </div>
        </div>
        <div className="mq" aria-hidden="true"><div className="mq-t">{[...marquee, ...marquee].map((m, i) => <span key={i}>{m}</span>)}</div></div>
      </section>

      <section className="band alt" id="about">
        <div className="wrap about">
          <ProfileVisual />
          <div className="reveal">
            <div className="sh-tag"><span className="sh-n">01</span>About me</div>
            <h2>Hello, I&apos;m<br /><em>{fullName}</em></h2>
            <div className="now-line"><span className="pd" />Currently completing my M.Eng in Cybersecurity at UMD and working toward CompTIA Security+</div>
            <p className="big">A security and penetration testing engineer who breaks systems to make them stronger.</p>
            <p>I started on the offensive side: <b>vulnerability assessments, network reconnaissance and OWASP Top 10 testing</b> with Nmap, Nessus, Burp Suite and Metasploit. At Cognizant I added the defensive side, <b>investigating Splunk and ELK alerts in SOC workflows</b>, analyzing IOCs and network traffic, and mapping activity to MITRE ATT&amp;CK.</p>
            <p>Today I bring that together with <b>cloud security</b> across AWS, EKS and Kubernetes, <b>DevSecOps automation</b> in CI/CD, and <b>machine learning and data science</b> applied to cybersecurity, classifying incidents and surfacing threat patterns from data. I&apos;m based in <b>{baseLocation}</b> and <b>open to relocation</b>.</p>
            <div className="facts">
              <div className="fact"><div className="ico"><MapPin /></div><div><small>Location</small><b>{baseLocation}</b></div></div>
              <div className="fact"><div className="ico"><Plane /></div><div><small>Relocation</small><b>Open to relocating across the US</b></div></div>
              <div className="fact"><div className="ico"><GraduationCap /></div><div><small>Education</small><b>M.Eng Cybersecurity, UMD · Dec 2026</b></div></div>
              <div className="fact"><div className="ico"><Target /></div><div><small>Target roles</small><b>Security Eng · Pentest · SOC · Cloud · DevSecOps · AppSec</b></div></div>
            </div>
            <div className="stats">
              <div className="stat"><div className="ico"><Award /></div><div><b><CountUp to={4} suffix="+ yrs" /></b><span>Security experience</span></div></div>
              <div className="stat"><div className="ico"><ShieldCheck /></div><div><b>Red + Blue</b><span>Pentest &amp; SOC</span></div></div>
              <div className="stat"><div className="ico"><BrainCircuit /></div><div><b>ML</b><span>For threat detection</span></div></div>
            </div>
            <div className="about-cta">
              <a className="btn light" href={resume}><FileText />View resume</a>
              <button className="btn call" onClick={openSchedule}><CalendarDays />Book a call</button>
            </div>
          </div>
        </div>
      </section>

      <section className="band why" id="why">
        <div className="wrap">
          <SectionHead n="02" label="Why hire me" sub="What I bring to a security team from day one.">Built for <em>real-world security</em></SectionHead>
          <div className="whys">
            {strengths.map((x, i) => { const Icon = x.icon; return (
              <article className="wcard reveal" key={x.title}>
                <div className="wtop"><div className="ico"><Icon strokeWidth={1.7} /></div><span className="wn">0{i + 1}</span></div>
                <h3>{x.title}</h3>
                <p>{x.text}</p>
                <div className="proof"><Check size={14} />{x.proof}</div>
              </article>
            ); })}
          </div>
          <RoleFit onCase={t => setCaseIdx(projects.findIndex(p => p.title === t))} onSchedule={openSchedule} />
          <div className="why-cta reveal">
            <div><b>Hiring for Security, Pentest, SOC, Cloud or DevSecOps?</b><span>Let&apos;s talk. Pick a time that works for you.</span></div>
            <div className="row"><button className="btn light" onClick={openSchedule}><CalendarDays />Book a call</button><a className="btn ghost" href={resume}><FileText />View resume</a></div>
          </div>
        </div>
      </section>

      <section className="band alt" id="focus">
        <div className="wrap">
          <SectionHead n="03" label="Core focus" sub="Offense, defense, automation and data: one security-first approach.">Areas of <em>focus</em></SectionHead>
          <div className="g3">
            {focus.map((f, i) => { const Icon = f.icon; return (
              <article className="box reveal" key={f.title}>
                <div className="ptop"><div className="ico"><Icon strokeWidth={1.7} /></div><span>0{i + 1}</span></div>
                <h3>{f.title}</h3><p>{f.description}</p>
                <div className="tags">{f.tags.map(x => <span key={x}>{x}</span>)}</div>
              </article>
            ); })}
          </div>
        </div>
      </section>

      <section className="band" id="skills">
        <div className="wrap">
          <SectionHead n="04" label="Technical stack">Technologies I <em>work with</em></SectionHead>
          <div className="stabs reveal" role="tablist" aria-label="Filter skills">{skillTabs.map(t => <button key={t} role="tab" aria-selected={skillTab === t} className={skillTab === t ? 'on' : ''} onClick={() => setSkillTab(t)}>{t}<span>{t === 'All' ? skills.reduce((n, g) => n + g.items.length, 0) : skills.filter(g => g.dom === t).reduce((n, g) => n + g.items.length, 0)}</span></button>)}</div>
          <div className="sk" key={skillTab}>
            {skills.filter(g => skillTab === 'All' || g.dom === skillTab).map((g, i) => (
              <div className="skg in-anim" key={g.name} style={{ animationDelay: `${i * 60}ms` }}><h3><span>0{i + 1}</span>{g.name}</h3><div className="pills">{g.items.map(s => <span className="pill" key={s}>{s}</span>)}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="projects">
        <div className="wrap">
          <SectionHead n="05" label="Selected work" sub="Hands-on security, DevSecOps and machine learning projects.">Built. Tested. <em>Verified.</em></SectionHead>
          <div className="g3">
            {projects.map(p => (
              <article className="box reveal" key={p.title}>
                <div className="ptop"><span>{p.tag}</span><span>{p.number}</span></div>
                <h3>{p.title}</h3>
                <ul>{p.points.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
                <div className="tags">{p.stack.map(s => <span key={s}>{s}</span>)}</div>
                <div className="plinks">
                  <button className="csbtn" onClick={() => setCaseIdx(projects.indexOf(p))}>Read case study<ArrowRight size={15} /></button>
                  {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer">Live ↗</a>}
                  {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer"><Brand name="github" size={14} />Code</a>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="experience">
        <div className="wrap">
          <SectionHead n="06" label="Professional experience" sub="Enterprise security engineering, SOC investigations and hands-on offensive work.">Experience in <em>practice</em></SectionHead>
          <div className="xsum reveal">
            <div><b><CountUp to={4} suffix="+ yrs" /></b><span>In cybersecurity</span></div>
            <div><b><CountUp to={1.5} decimals={1} suffix=" yrs" /></b><span>Enterprise security at Cognizant</span></div>
            <div><b>Red + Blue</b><span>Pentest &amp; SOC experience</span></div>
            <div><b>CTF</b><span>3rd place finish</span></div>
          </div>
          <div className="xp">
            {experience.map(e => (
              <article className={'job reveal' + (e.featured ? ' feat' : '')} key={e.role}>
                <div className="jl">
                  <div className="logo-sq">{e.mark}</div>
                  <h3>{e.role}</h3>
                  <strong>{e.org}</strong>
                  <div className="meta">
                    <span className="chip k">{e.date}</span>
                    <span className="chip">{e.length}</span>
                    <span className="chip"><MapPin />{e.place}</span>
                    <span className={'chip' + (e.featured ? ' now' : '')}>{e.kind}</span>
                  </div>
                </div>
                <div className="jr">
                  <ul>{e.points.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
                  <div className="tags">{e.tools.map(t => <span key={t}>{t}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="recognition">
        <div className="wrap">
          <SectionHead n="07" label="Recognition">Milestones &amp; <em>credentials</em></SectionHead>
          <div className="cols">
            <div className="reveal"><h3 className="ch">Achievements</h3><div className="stackv">
              {achievements.map(a => <div className="mini" key={a.title}><div className="ico"><Award strokeWidth={1.7} /></div><div><span className="d">{a.date}</span><h3>{a.title}</h3><p>{a.detail}</p></div></div>)}
            </div></div>
            <div className="reveal"><h3 className="ch">Certifications</h3><div className="stackv">
              {certifications.map(c => <div className="mini" key={c.title}><div className="ico"><ShieldCheck strokeWidth={1.7} /></div><div><h3>{c.title}</h3><p>{c.status}</p></div></div>)}
            </div></div>
          </div>
          <div className="edu reveal" id="education">
            <div><h3>University of Maryland, College Park</h3><p>Master of Engineering · Cybersecurity</p><span>Coursework and projects in penetration testing, Linux administration, cloud infrastructure and digital forensics.</span></div>
            <div className="d">Expected December 2026</div>
          </div>
        </div>
      </section>

      <section className="band" id="contact">
        <div className="wrap">
          <SectionHead n="08" label="Let's connect" sub="Open to Security Engineer, Penetration Tester, SOC Analyst, Cloud Security, DevSecOps and AppSec roles, and open to relocation.">Let&apos;s build something <em>secure</em></SectionHead>
          <div className="contact">
            <div className="term reveal"><div className="tb"><i /><i /><i /><span>siddharth@sec:~</span></div><Terminal /></div>
            <div className="reach reveal">
              <small>Security is not a feature.</small>
              <strong>It&apos;s a mindset.</strong>
              <a className="mail" href={`mailto:${email}`}><Brand name="gmail" size={16} />{email}</a>
              <div className="note"><MapPin />Based in {baseLocation} · open to relocation</div>
              <div className="note"><Clock />It&apos;s {timeStr} ET for me right now</div>
              <div className="row">
                <button className="btn light" onClick={openSchedule}><CalendarDays />Book a call</button>
                <button className="btn ghost" onClick={() => setChatOpen(true)}><MessageCircle />Message me</button>
                <a className="btn ghost" href={resume}><FileText />Resume</a>
              </div>
              <Social />
            </div>
          </div>
        </div>
      </section>

      <section className="band alt" id="rate" aria-label="Rate this portfolio">
        <div className="wrap"><Rating /></div>
      </section>

      <footer>
        <div className="wrap">
          <svg className="giant" viewBox="0 0 1000 160" role="img" aria-label="Siddharth">
            <defs><linearGradient id="gn" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="20" y2="142"><stop offset="0" stopOpacity=".95" /><stop className="mid" offset=".6" stopOpacity=".55" /><stop offset="1" stopOpacity="0" /></linearGradient></defs>
            <text x="500" y="140" textAnchor="middle" textLength="990" lengthAdjust="spacingAndGlyphs" fill="url(#gn)" style={{ font: '900 168px Archivo, Arial Black, sans-serif', letterSpacing: '-4px' } as CSSProperties}>SIDDHARTH</text>
          </svg>
          <div className="foot">
            <span>© {new Date().getFullYear()} {fullName} · {baseLocation}</span>
            <span className="clock"><Clock />{now ? homeTime(now, true) : '--:--'} ET</span>
            <span style={{ display: 'flex', gap: 18 }}><a href={`mailto:${email}`}>Email</a><a href={linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
