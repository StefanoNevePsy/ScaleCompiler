import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getAllTests, getCatOverrides, testCategories } from '../db';
import { BandBadge, StatusBadge, fmtDate, href, nav, toast } from '../components';
import { computeScores } from '../scoring';
import { exportScoresCsv, patientLabel } from '../csv';
import type { TestDefinition } from '../types';

export function PatientDetail({ id }: { id: string }) {
  const patient = useLiveQuery(() => db.patients.get(id), [id]);
  const admins = useLiveQuery(() => db.administrations.where('patientId').equals(id).toArray(), [id]) ?? [];
  const tests = useLiveQuery(() => getAllTests(), []) ?? [];
  const overrides = useLiveQuery(() => getCatOverrides(), []) ?? {};
  const [pickTest, setPickTest] = useState('');
  const [editNotes, setEditNotes] = useState<string | null>(null);

  if (!patient) return <div className="empty"><strong>Paziente non trovato</strong><a href={href()}>Torna all’elenco</a></div>;

  const testMap = new Map(tests.map(t => [t.id, t]));
  const byTest = new Map<string, typeof admins>();
  for (const a of [...admins].sort((x, y) => y.date.localeCompare(x.date))) {
    byTest.set(a.testId, [...(byTest.get(a.testId) ?? []), a]);
  }
  const administrable = tests.filter(t => t.status !== 'bozza');

  const start = () => {
    if (!pickTest) { toast('Scegli prima un test.'); return; }
    nav('p', id, 'nuova', pickTest);
  };

  const exportCsv = async () => {
    exportScoresCsv(admins, new Map([[patient.id, patient]]), testMap, `punteggi_${patient.code}.csv`);
  };

  const summaryScore = (t: TestDefinition, a: (typeof admins)[number]) => {
    const s = computeScores(t, a.answers)[0];
    if (!s || s.raw === null) return <span className="muted">—</span>;
    return <>{s.raw} <BandBadge band={s.band} /></>;
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{patientLabel(patient)}</h1>
          <div className="sub">
            {patient.birthDate ? `Nato/a il ${fmtDate(patient.birthDate)} · ` : ''}
            {admins.length} somministrazioni
            {patient.archived ? ' · archiviato' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={exportCsv} disabled={admins.length === 0}>Esporta CSV punteggi</button>
          <button className="btn-secondary" onClick={async () => {
            await db.patients.update(id, { archived: !patient.archived });
          }}>{patient.archived ? 'Ripristina' : 'Archivia'}</button>
        </div>
      </div>

      <div className="panel soft">
        <div className="row">
          <label className="field" style={{ flex: 2, marginBottom: 0 }}>Somministra un test
            <select value={pickTest} onChange={e => setPickTest(e.target.value)}>
              <option value="">— scegli un test —</option>
              {(() => {
                const cats = [...new Set(administrable.flatMap(t => testCategories(t, overrides)))].sort((a, b) => a.localeCompare(b));
                const noCat = administrable.filter(t => testCategories(t, overrides).length === 0);
                return (
                  <>
                    {cats.map(c => (
                      <optgroup key={c} label={c}>
                        {administrable.filter(t => testCategories(t, overrides).includes(c)).map(t => (
                          <option key={t.id} value={t.id}>{t.acronym} — {t.name}</option>
                        ))}
                      </optgroup>
                    ))}
                    {noCat.length > 0 && (
                      <optgroup label="Senza categoria">
                        {noCat.map(t => <option key={t.id} value={t.id}>{t.acronym} — {t.name}</option>)}
                      </optgroup>
                    )}
                  </>
                );
              })()}
            </select>
          </label>
          <div className="grow-0"><button className="btn-primary" onClick={start}>Avvia compilazione</button></div>
        </div>
      </div>

      <h2>Note cliniche</h2>
      {editNotes === null ? (
        <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>
          {patient.notes || 'Nessuna nota.'}{' '}
          <button className="btn-secondary btn-sm" onClick={() => setEditNotes(patient.notes ?? '')}>Modifica</button>
        </p>
      ) : (
        <div>
          <textarea rows={3} value={editNotes} onChange={e => setEditNotes(e.target.value)} />
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary btn-sm" onClick={async () => { await db.patients.update(id, { notes: editNotes }); setEditNotes(null); }}>Salva</button>
            <button className="btn-secondary btn-sm" onClick={() => setEditNotes(null)}>Annulla</button>
          </div>
        </div>
      )}

      <h2>Somministrazioni</h2>
      {admins.length === 0 && <div className="empty"><strong>Ancora nessuna somministrazione</strong>Scegli un test qui sopra per iniziare.</div>}
      {[...byTest.entries()].map(([testId, list]) => {
        const t = testMap.get(testId);
        if (!t) return null;
        return (
          <div className="panel" key={testId}>
            <div className="page-head" style={{ marginBottom: '0.5rem' }}>
              <div>
                <strong>{t.acronym}</strong> <span className="muted small">{t.name}</span> <StatusBadge status={t.status} />
              </div>
              {list.length >= 2 && t.scales.length > 0 && (
                <a className="btn btn-secondary btn-sm" href={href('p', id, 'andamento', testId)}>Andamento nel tempo ({list.length})</a>
              )}
            </div>
            <table className="data">
              <thead><tr><th>Data</th><th>{t.scales[0]?.name ?? 'Punteggio'}</th><th>Stato</th><th></th></tr></thead>
              <tbody>
                {list.map(a => (
                  <tr key={a.id} className="click" onClick={() => (a.draft ? nav('somm', a.id, 'modifica') : nav('somm', a.id))}>
                    <td>{fmtDate(a.date)}</td>
                    <td>{summaryScore(t, a)}</td>
                    <td>{a.draft
                      ? <span className="badge sev1">sospesa — clicca per riprendere</span>
                      : a.completed ? 'completata' : <span className="badge sev1">incompleta</span>}</td>
                    <td className="num">
                      <button className="btn-danger btn-sm" onClick={async e => {
                        e.stopPropagation();
                        if (confirm(`Eliminare la somministrazione ${t.acronym} del ${fmtDate(a.date)}? L’operazione non è reversibile.`)) {
                          await db.administrations.delete(a.id);
                          toast('Somministrazione eliminata.');
                        }
                      }}>Elimina</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}
