import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getTest } from '../db';
import { BandBadge, fmtDate, href, toast } from '../components';
import { allItems, computeScores, itemOptions } from '../scoring';
import { patientLabel } from '../csv';

export function Report({ adminId }: { adminId: string }) {
  const admin = useLiveQuery(() => db.administrations.get(adminId), [adminId]);
  const patient = useLiveQuery(async () => (admin ? db.patients.get(admin.patientId) : undefined), [admin?.patientId]);
  const test = useLiveQuery(async () => (admin ? getTest(admin.testId) : undefined), [admin?.testId]);
  const [showAnswers, setShowAnswers] = useState(false);

  if (admin === undefined) return null;
  if (!admin) return <div className="empty"><strong>Somministrazione non trovata</strong></div>;
  if (!patient || !test) return null;

  const scores = computeScores(test, admin.answers, { gender: patient.gender });
  const entries = allItems(test);
  const hasT = scores.some(s => s.t !== undefined);
  const needsGender = hasT && !patient.gender;

  return (
    <>
      <div className="page-head no-print">
        <a className="btn btn-secondary btn-sm" href={href('p', patient.id)}>← {patient.code}</a>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a className="btn btn-secondary btn-sm" href={href('somm', admin.id, 'modifica')}>Modifica risposte</a>
          <button className="btn-secondary btn-sm" onClick={() => setShowAnswers(v => !v)}>
            {showAnswers ? 'Nascondi risposte' : 'Mostra risposte'}
          </button>
          <button className="btn-primary btn-sm" onClick={() => window.print()}>Stampa / PDF</button>
        </div>
      </div>

      {admin.draft && (
        <p className="callout warn no-print">
          Compilazione <strong>sospesa</strong>: i punteggi sono parziali.{' '}
          <a className="btn btn-secondary btn-sm" href={href('somm', admin.id, 'modifica')}>Riprendi la compilazione</a>
        </p>
      )}
      <h1>{test.acronym} — Report</h1>
      <p className="sub muted">
        {test.name}{test.version ? ` (${test.version})` : ''}
      </p>
      <div className="panel soft">
        <table className="data"><tbody>
          <tr><td className="muted">Paziente</td><td><strong>{patientLabel(patient)}</strong></td>
            <td className="muted">Data somministrazione</td><td><strong>{fmtDate(admin.date)}</strong></td></tr>
          <tr><td className="muted">Compilato da</td><td>{admin.respondent ?? '—'}</td>
            <td className="muted">Stato</td><td>{admin.completed ? 'completa' : 'incompleta'}</td></tr>
          {admin.notes && <tr><td className="muted">Note</td><td colSpan={3}>{admin.notes}</td></tr>}
        </tbody></table>
      </div>

      <h2>Punteggi</h2>
      {needsGender && (
        <p className="callout warn small">
          Questo test usa norme per genere: imposta il sesso del paziente nella sua scheda per calcolare i punti T.
        </p>
      )}
      {scores.length === 0 && <p className="muted">Questo test non definisce scale di punteggio.</p>}
      <table className="data">
        <thead><tr><th>Scala</th><th className="num">Grezzo</th>{hasT && <th className="num">+K</th>}{hasT && <th className="num">T</th>}<th>Fascia interpretativa</th><th className="num">Mancanti</th></tr></thead>
        <tbody>
          {scores.map(s => (
            <tr key={s.scaleId}>
              <td>{s.name}</td>
              <td className="num"><strong>{s.raw ?? 'n.c.'}</strong></td>
              {hasT && <td className="num">{s.kAdj ?? ''}</td>}
              {hasT && <td className="num"><strong>{s.t === null ? '—' : s.t ?? ''}</strong></td>}
              <td>{s.raw === null ? <span className="muted small">troppi item mancanti</span> : <BandBadge band={s.band} />}
                {s.band?.note && <div className="small muted">{s.band.note}</div>}</td>
              <td className="num">{s.missing}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {test.notes && <p className="small muted" style={{ marginTop: '1rem' }}>{test.notes}</p>}
      {test.status !== 'verificato' && (
        <p className="callout warn small no-print">
          Definizione del test in stato «{test.status === 'bozza' ? 'bozza' : 'da verificare'}»: prima dell’uso clinico dei punteggi, verificare item, scoring e cutoff sul manuale (Libreria test).
        </p>
      )}

      {showAnswers && (
        <>
          <h2>Risposte</h2>
          <table className="data">
            <thead><tr><th>Item</th><th>Risposta</th></tr></thead>
            <tbody>
              {entries.map(({ item, section }) => {
                const v = admin.answers[item.id];
                const opts = itemOptions(test, section, item);
                let label: string;
                if (v === null || v === undefined || v === '') label = '—';
                else if (Array.isArray(v)) label = v.map(x => opts.find(o => o.value === x)?.label ?? x).join('; ');
                else if (typeof v === 'number') label = opts.find(o => o.value === v)?.label ?? String(v);
                else label = v;
                return <tr key={item.id}><td>{item.text}</td><td>{label}</td></tr>;
              })}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
