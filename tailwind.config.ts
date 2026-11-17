import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#0a1020', panel:'#111b30', accent:'#78b7ff' } } }, plugins: [] };
export default config;
