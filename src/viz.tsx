import type { Band, ScoreResult, Section, TestDefinition } from './types';
import { itemOptions } from './scoring';

const SEV = ['var(--sev0)', 'var(--sev1)', 'var(--sev2)', 'var(--sev3)'];
const SEV_SOFT = ['var(--sev0-soft)', 'var(--sev1-soft)', 'var(--sev2-soft)', 'var(--sev3-soft)'];

/** Mini-barra colorata per fasce con marcatore sul valore (evidenziazione del punteggio). */
export function ScaleBar({ bands, value, max }: { bands: Band[]; value: number; max?: number }) {
  const lo = Math.min(...bands.map(b => b.min));
  const hi = max ?? Math.max(...bands.map(b => b.max));
  const W = 220, H = 14;
  const x = (v: number) => ((Math.max(lo, Math.min(v, hi)) - lo) / (hi - lo)) * W;
  return (
    <svg width={W} height={H + 8} className="scalebar" role="img" aria-label={`Punteggio ${value} su scala da ${lo} a ${hi}`}>
      {bands.map((b, i) => (
        <rect key={i} x={x(b.min)} y={4} width={Math.max(0, x(Math.min(b.max, hi)) - x(b.min))} height={H - 4}
          fill={SEV_SOFT[b.severity ?? 1]} />
      ))}
      {bands.map((b, i) => (
        <rect key={'s' + i} x={x(b.min)} y={H} width={Math.max(0, x(Math.min(b.max, hi)) - x(b.min))} height={3}
          fill={SEV[b.severity ?? 1]} />
      ))}
      <line x1={x(value)} x2={x(value)} y1={0} y2={H + 3} stroke="var(--ink)" strokeWidth={2} />
      <circle cx={x(value)} cy={2.5} r={2.5} fill="var(--ink)" />
    </svg>
  );
}

/** Barra bipolare: dimensione con due estremi e marcatore. */
export function BipolarBar({ low, high, min, max, value }: { low: string; high: string; min: number; max: number; value: number }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="bipolar">
      <div className="track">
        <div className="mid" />
        <div className="marker" style={{ left: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <div className="poles small muted"><span>{low}</span><span>{high}</span></div>
    </div>
  );
}

/** Stella radiale stile TCOM/CANS: un raggio per item, distanza dal centro = punteggio, colore = livello di azione. */
export function StarChart({ def, section, answers }: { def: TestDefinition; section: Section; answers: Record<string, unknown> }) {
  const items = section.items.filter(i => i.type !== 'text');
  const n = items.length;
  if (n < 3) return null;
  const SIZE = 360, C = SIZE / 2, RMAX = SIZE / 2 - 92;
  const maxVal = Math.max(...items.flatMap(i => itemOptions(def, section, i).map(o => o.value)), 1);
  const ang = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (i: number, r: number) => [C + r * Math.cos(ang(i)), C + r * Math.sin(ang(i))];
  const vals = items.map(i => {
    const v = answers[i.id];
    return typeof v === 'number' ? v : null;
  });
  const ringStep = RMAX / maxVal;
  const poly = vals.map((v, i) => pt(i, ((v ?? 0) / maxVal) * RMAX).join(',')).join(' ');

  return (
    <svg className="star" viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} role="img" aria-label={`Stella ${section.title}`}>
      <title>{section.title}</title>
      {/* anelli di livello */}
      {Array.from({ length: maxVal }, (_, k) => (
        <circle key={k} cx={C} cy={C} r={ringStep * (k + 1)} fill="none" stroke="var(--border)"
          strokeDasharray={k + 1 === maxVal ? undefined : '2 3'} />
      ))}
      {/* soglia di attuabilità (≥2) evidenziata */}
      {maxVal >= 2 && <circle cx={C} cy={C} r={ringStep * 2} fill="none" stroke="var(--sev2)" strokeWidth={1.2} strokeDasharray="4 3" />}
      {/* raggi */}
      {items.map((_, i) => {
        const [x2, y2] = pt(i, RMAX);
        return <line key={i} x1={C} y1={C} x2={x2} y2={y2} stroke="var(--border)" strokeWidth={0.5} />;
      })}
      {/* area del profilo */}
      <polygon points={poly} fill="var(--primary-soft)" fillOpacity={0.7} stroke="var(--primary)" strokeWidth={1.5} />
      {/* punti item colorati per livello */}
      {items.map((it, i) => {
        const v = vals[i];
        const [cx, cy] = pt(i, ((v ?? 0) / maxVal) * RMAX);
        const sevIdx = v === null ? null : Math.min(Math.round((v / maxVal) * 3), 3);
        return (
          <circle key={it.id} cx={cx} cy={cy} r={5}
            fill={sevIdx === null ? 'var(--bg)' : SEV[sevIdx]}
            stroke={sevIdx === null ? 'var(--ink-2)' : 'white'} strokeWidth={1.5}>
            <title>{it.text}: {v ?? 'non valutato'}</title>
          </circle>
        );
      })}
      {/* etichette */}
      {items.map((it, i) => {
        const [x, y] = pt(i, RMAX + 12);
        const a = ang(i);
        const anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
        const label = it.text.length > 17 ? it.text.slice(0, 16) + '…' : it.text;
        const v = vals[i];
        return (
          <text key={it.id} x={x} y={y + (Math.sin(a) > 0.5 ? 8 : Math.sin(a) < -0.5 ? -2 : 4)} textAnchor={anchor}
            fontSize={9.5} fill={v !== null && v / maxVal >= 2 / 3 ? SEV[3] : 'var(--ink-2)'}
            fontWeight={v !== null && v >= 2 ? 650 : 400}>
            {label}{v !== null ? ` (${v})` : ''}
          </text>
        );
      })}
    </svg>
  );
}

/** Profilo a punti T stile MMPI: scale sull'asse X, T sull'asse Y, linee di riferimento a 50 e 65. */
export function TScoreProfile({ points }: { points: { label: string; t: number }[] }) {
  if (points.length < 2) return null;
  const W = Math.max(560, points.length * 42 + 80), H = 320, PL = 40, PR = 12, PT = 12, PB = 46;
  const LO = 30, HI = 120;
  const x = (i: number) => PL + (i / (points.length - 1)) * (W - PL - PR);
  const y = (t: number) => PT + (1 - (Math.max(LO, Math.min(t, HI)) - LO) / (HI - LO)) * (H - PT - PB);
  return (
    <div className="chart-wrap panel">
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 480 }} role="img" aria-label="Profilo punti T">
        <rect x={PL} y={y(HI)} width={W - PL - PR} height={y(65) - y(HI)} fill="var(--sev2-soft)" opacity={0.55} />
        {Array.from({ length: (HI - LO) / 10 + 1 }, (_, k) => {
          const t = LO + k * 10;
          return (
            <g key={t}>
              <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray="2 3" />
              <text x={PL - 5} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="var(--ink-2)">{t}</text>
            </g>
          );
        })}
        <line x1={PL} x2={W - PR} y1={y(65)} y2={y(65)} stroke="var(--sev2)" strokeWidth={1.4} />
        <line x1={PL} x2={W - PR} y1={y(50)} y2={y(50)} stroke="var(--ink-2)" strokeWidth={1} strokeDasharray="5 4" />
        <polyline fill="none" stroke="var(--primary)" strokeWidth={2}
          points={points.map((p, i) => `${x(i)},${y(p.t)}`).join(' ')} />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.t)} r={4} fill={p.t >= 65 ? 'var(--sev2)' : 'var(--primary)'} stroke="white" strokeWidth={1.2}>
              <title>{p.label}: T {p.t}</title>
            </circle>
            <text x={x(i)} y={y(p.t) - 8} textAnchor="middle" fontSize={9.5} fontWeight={650}
              fill={p.t >= 65 ? 'var(--sev2)' : 'var(--ink)'}>{p.t}</text>
            <text x={x(i)} y={H - PB + 14} textAnchor="middle" fontSize={10} fill="var(--ink-2)"
              transform={points.length > 14 ? `rotate(-45 ${x(i)} ${H - PB + 14})` : undefined}>{p.label}</text>
          </g>
        ))}
      </svg>
      <div className="small muted">Linea continua: T = 65 (soglia clinica) · tratteggiata: T = 50 (media normativa)</div>
    </div>
  );
}

/** Risultato per una scala nel profilo (etichetta corta dal nome). */
export function shortLabel(s: ScoreResult): string {
  return s.name.split(' — ')[0].split(' · ').pop() ?? s.name;
}
