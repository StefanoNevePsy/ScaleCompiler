import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getTest } from '../db';
import { BandBadge, fmtDate, href } from '../components';
import { computeScores } from '../scoring';
import { exportItemsCsv, exportScoresCsv } from '../csv';
import { DomainStar, StarLegend, StrengthsStar } from '../viz';
import type { Band } from '../types';

const SEV_SOFT = ['var(--sev0-soft)', 'var(--sev1-soft)', 'var(--sev2-soft)', 'var(--sev3-soft)'];

export function Compare({ patientId, testId }: { patientId: string; testId: string }) {
  const patient = useLiveQuery(() => db.patients.get(patientId), [patientId]);
  const test = useLiveQuery(() => getTest(testId), [testId]);
  const admins = useLiveQuery(
    () => db.administrations.where('patientId').equals(patientId).and(a => a.testId === testId).sortBy('date'),
    [patientId, testId],
  ) ?? [];
  const [scaleId, setScaleId] = useState('');

  const rows = useMemo(
    () => (test && patient ? admins.map(a => ({ a, scores: computeScores(test, a.answers, { gender: patient.gender }) })) : []),
    [test, admins, patient],
  );

  if (!patient || !test) return null;
  const scale = test.scales.find(s => s.id === scaleId) ?? test.scales[0];
  const points = scale
    ? rows.map(r => ({ date: r.a.date, score: r.scores.find(s => s.scaleId === scale.id) }))
        .filter(p => p.score && (p.score.t ?? p.score.raw) !== null && (p.score.t ?? p.score.raw) !== undefined)
        .map(p => ({ date: p.date, raw: (p.score!.t ?? p.score!.raw) as number, band: p.score!.band }))
    : [];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Andamento — {test.acronym}</h1>
          <div className="sub">{patient.code} · {admins.length} somministrazioni</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} className="no-print">
          <a className="btn btn-secondary btn-sm" href={href('p', patientId)}>← Torna al paziente</a>
          <button className="btn-secondary btn-sm" onClick={() => exportScoresCsv(admins, new Map([[patient.id, patient]]), new Map([[test.id, test]]), `andamento_${patient.code}_${test.id}.csv`)}>CSV punteggi</button>
          <button className="btn-secondary btn-sm" onClick={() => exportItemsCsv(admins, new Map([[patient.id, patient]]), test, `item_${patient.code}_${test.id}.csv`)}>CSV item</button>
          <button className="btn-primary btn-sm" onClick={() => window.print()}>Stampa / PDF</button>
        </div>
      </div>

      {test.scales.length > 1 && (
        <label className="field no-print" style={{ maxWidth: 420 }}>Scala da visualizzare
          <select value={scale?.id ?? ''} onChange={e => setScaleId(e.target.value)}>
            {test.scales.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      )}

      {points.length >= 2 && scale
        ? <Chart points={points} bands={scale.bands} name={scale.name} />
        : <p className="muted">Servono almeno due somministrazioni con punteggio calcolabile per il grafico.</p>}

      {test.viz?.stars && admins.length >= 2 && (() => {
        const t0 = admins[0], t1 = admins[admins.length - 1];
        const strengthsSec = test.sections.find(sec => sec.id === test.viz?.starsStrengths);
        const needSections = test.sections.filter(sec => sec.id !== test.viz?.starsStrengths);
        return (
          <>
            <h2>Confronto polare: prima e ultima somministrazione</h2>
            <div className="stars-grid">
              <div className="star-cell">
                <DomainStar def={test} sections={needSections} answers={t0.answers} title={`T0 — ${fmtDate(t0.date)}`} />
              </div>
              <div className="star-cell">
                <DomainStar def={test} sections={needSections} answers={t1.answers} title={`T1 — ${fmtDate(t1.date)}`} />
              </div>
            </div>
            <StarLegend />
            {strengthsSec && (
              <div className="star-cell" style={{ maxWidth: 420, margin: '0 auto' }}>
                <strong className="small">{strengthsSec.title} — T0 e T1 sovrapposti</strong>
                <StrengthsStar def={test} section={strengthsSec} series={[
                  { label: 'T0', answers: t0.answers, color: 'var(--ink-2)', fillOpacity: 0.3 },
                  { label: 'T1', answers: t1.answers, color: 'var(--primary)', fillOpacity: 0.35 },
                ]} />
                <div className="star-legend small">
                  <span><i style={{ background: 'var(--ink-2)' }} /> T0 — {fmtDate(t0.date)}</span>
                  <span><i style={{ background: 'var(--primary)' }} /> T1 — {fmtDate(t1.date)}</span>
                </div>
                <div className="small muted">Pieno = forza utilizzabile nel piano; vuoto = forza mancante o critica.</div>
              </div>
            )}
          </>
        );
      })()}

      <h2>Tutti i punteggi per data</h2>
      <div className="chart-wrap">
        <table className="data">
          <thead>
            <tr><th>Scala</th>{rows.map(r => <th key={r.a.id} className="num">{fmtDate(r.a.date)}</th>)}</tr>
          </thead>
          <tbody>
            {test.scales.map(sc => (
              <tr key={sc.id}>
                <td>{sc.name}</td>
                {rows.map(r => {
                  const s = r.scores.find(x => x.scaleId === sc.id);
                  return (
                    <td key={r.a.id} className="num">
                      {s?.t != null ? `T ${s.t}` : s?.raw ?? '—'}{' '}
                      {s?.band && <BandBadge band={s.band} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Chart({ points, bands, name }: { points: { date: string; raw: number }[]; bands?: Band[]; name: string }) {
  const W = 720, H = 300, PL = 44, PR = 60, PT = 16, PB = 36;
  const values = points.map(p => p.raw);
  const bandMax = bands?.length ? Math.max(...bands.map(b => Math.min(b.max, Math.max(...values) * 2 + 10))) : undefined;
  let lo = Math.min(0, ...values);
  let hi = Math.max(...values, bandMax !== undefined && isFinite(bandMax) ? Math.min(bandMax, Math.max(...values) * 1.3 + 5) : 0);
  if (hi === lo) hi = lo + 1;
  const x = (i: number) => PL + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - PL - PR));
  const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
  const ticks = 5;

  return (
    <div className="chart-wrap panel">
      <div className="small muted" style={{ marginBottom: 4 }}>{name}</div>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 480 }} role="img" aria-label={`Grafico andamento ${name}`}>
        {bands?.map((b, i) => {
          const y1 = y(Math.min(b.max, hi)), y2 = y(Math.max(b.min, lo));
          if (b.min > hi || b.max < lo) return null;
          return <rect key={i} x={PL} width={W - PL - PR} y={y1} height={Math.max(0, y2 - y1)} fill={SEV_SOFT[b.severity ?? 1]} />;
        })}
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const v = lo + ((hi - lo) * i) / ticks;
          return (
            <g key={i}>
              <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeDasharray="2 3" />
              <text x={PL - 6} y={y(v) + 4} textAnchor="end">{Number(v.toFixed(1))}</text>
            </g>
          );
        })}
        {bands?.filter(b => b.min > lo && b.min < hi).map((b, i) => (
          <text key={i} x={PL + 6} y={y(b.min) - 3} textAnchor="start" fontSize={10}>{b.label}</text>
        ))}
        <polyline fill="none" stroke="var(--primary)" strokeWidth={2.5}
          points={points.map((p, i) => `${x(i)},${y(p.raw)}`).join(' ')} />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.raw)} r={4.5} fill="var(--primary)" stroke="white" strokeWidth={1.5} />
            <text x={x(i)} y={y(p.raw) - 10} textAnchor="middle" fontWeight={600} fill="var(--ink)">{p.raw}</text>
            <text x={x(i)} y={H - 12} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>{fmtDate(p.date)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
