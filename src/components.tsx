import { useEffect, useState } from 'react';
import type { Band, TestStatus } from './types';

// ---------- Router hash minimale ----------

export function useRoute(): string[] {
  const [h, setH] = useState(location.hash);
  useEffect(() => {
    const f = () => setH(location.hash);
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return h.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}
export const href = (...seg: (string | number)[]) => '#/' + seg.map(s => encodeURIComponent(String(s))).join('/');
export const nav = (...seg: (string | number)[]) => { location.hash = href(...seg); };

// ---------- Tema chiaro/scuro ----------

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => document.documentElement.dataset.theme ?? 'light');
  const toggle = () => {
    const t = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* storage non disponibile */ }
    setTheme(t);
  };
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}>
      {theme === 'dark' ? '☀︎ Tema chiaro' : '☾ Tema scuro'}
    </button>
  );
}

// ---------- Badge ----------

const STATUS_LABEL: Record<TestStatus, string> = {
  verificato: 'verificato', da_verificare: 'da verificare', bozza: 'bozza',
};
export const StatusBadge = ({ status }: { status: TestStatus }) => (
  <span className={`badge ${status}`}>{STATUS_LABEL[status]}</span>
);

export const BandBadge = ({ band }: { band?: Band }) =>
  band ? <span className={`badge sev${band.severity ?? 1}`} title={band.note}>{band.label}</span> : null;

// ---------- Toast ----------

let showToastFn: (msg: string) => void = () => {};
export const toast = (msg: string) => showToastFn(msg);

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    showToastFn = (m: string) => {
      setMsg(m);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 3500);
    };
    return () => { showToastFn = () => {}; clearTimeout(t); };
  }, []);
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}

// ---------- Util ----------

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export function readFileText(file: File): Promise<string> {
  return file.text();
}
export function readFileBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
