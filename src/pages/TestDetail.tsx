import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, download, getTest } from '../db';
import { StatusBadge, href, nav, toast } from '../components';
import { allItems, validateDefinition } from '../scoring';
import { builtinTests } from '../tests';

export function TestDetail({ id }: { id: string }) {
  const test = useLiveQuery(() => getTest(id), [id]);
  const isOverride = useLiveQuery(() => db.tests.get(id).then(Boolean), [id]) ?? false;
  const isBuiltin = builtinTests.some(t => t.id === id);
  const [json, setJson] = useState('');
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => { if (test) setJson(JSON.stringify(test, null, 2)); }, [test]);

  if (test === undefined) return null;
  if (!test) return <div className="empty"><strong>Test non trovato</strong><a href={href('libreria')}>Torna alla libreria</a></div>;

  const saveJson = async () => {
    try {
      const def = JSON.parse(json);
      const errs = validateDefinition(def);
      setErrors(errs);
      if (errs.length) return;
      if (def.id !== id) {
        if (!confirm(`L'id è cambiato (${id} → ${def.id}): verrà salvato come nuovo test. Continuare?`)) return;
      }
      await db.tests.put(def);
      toast('Definizione salvata.');
      setEditing(false);
      if (def.id !== id) nav('libreria', def.id);
    } catch (e: any) {
      setErrors(['JSON non valido: ' + e.message]);
    }
  };

  const markVerified = async () => {
    await db.tests.put({ ...test, status: 'verificato' });
    toast('Test contrassegnato come verificato.');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{test.acronym} <StatusBadge status={test.status} /></h1>
          <div className="sub">{test.name}{test.version ? ` — ${test.version}` : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a className="btn btn-secondary btn-sm" href={href('libreria')}>← Libreria</a>
          <button className="btn-secondary btn-sm" onClick={() => download(`test_${test.id}.json`, JSON.stringify(test, null, 2))}>Esporta JSON</button>
          {test.status === 'da_verificare' && <button className="btn-secondary btn-sm" onClick={markVerified}>Segna come verificato</button>}
          <button className="btn-primary btn-sm" onClick={() => setEditing(v => !v)}>{editing ? 'Chiudi editor' : 'Modifica (JSON)'}</button>
        </div>
      </div>

      <div className="panel soft">
        <table className="data"><tbody>
          {test.description && <tr><td className="muted" style={{ width: 160 }}>Descrizione</td><td>{test.description}</td></tr>}
          {test.population && <tr><td className="muted">Popolazione</td><td>{test.population}</td></tr>}
          {test.timeframe && <tr><td className="muted">Finestra temporale</td><td>{test.timeframe}</td></tr>}
          {test.respondent && <tr><td className="muted">Compilante</td><td>{test.respondent}</td></tr>}
          {test.author && <tr><td className="muted">Autori</td><td>{test.author}</td></tr>}
          {test.source && <tr><td className="muted">Fonte/licenza</td><td>{test.source}</td></tr>}
          <tr><td className="muted">Struttura</td><td>{test.sections.length} sezioni · {allItems(test).length} item · {test.scales.length} scale</td></tr>
        </tbody></table>
      </div>

      {test.notes && <p className="callout small">{test.notes}</p>}

      {isOverride && isBuiltin && (
        <p className="small muted">
          Questa è una versione personalizzata di un test integrato.{' '}
          <button className="btn-secondary btn-sm" onClick={async () => {
            if (confirm('Ripristinare la versione integrata? Le modifiche personalizzate verranno perse.')) {
              await db.tests.delete(id);
              toast('Versione integrata ripristinata.');
            }
          }}>Ripristina versione integrata</button>
        </p>
      )}
      {isOverride && !isBuiltin && (
        <p className="small muted">
          Test personalizzato.{' '}
          <button className="btn-danger btn-sm" onClick={async () => {
            const n = await db.administrations.where('testId').equals(id).count();
            if (n > 0) { toast(`Impossibile eliminare: esistono ${n} somministrazioni di questo test.`); return; }
            if (confirm('Eliminare definitivamente questo test?')) {
              await db.tests.delete(id);
              nav('libreria');
            }
          }}>Elimina test</button>
        </p>
      )}

      {editing ? (
        <>
          <h2>Editor JSON</h2>
          <p className="small muted">Modifica la definizione e salva: la validazione segnala id duplicati, scale che puntano a item inesistenti, opzioni mancanti. Per ricostruire il test da un manuale usa <a href={href('importa')}>Importa da manuale (IA)</a>.</p>
          {errors.length > 0 && <div className="callout error small">{errors.map((e, i) => <div key={i}>• {e}</div>)}</div>}
          <textarea rows={24} style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem' }}
            value={json} onChange={e => setJson(e.target.value)} spellCheck={false} />
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={saveJson}>Valida e salva</button>
            <button className="btn-secondary" onClick={() => { setJson(JSON.stringify(test, null, 2)); setErrors([]); }}>Ripristina</button>
          </div>
        </>
      ) : (
        <>
          <h2>Anteprima struttura</h2>
          {test.sections.map(s => (
            <div className="panel" key={s.id}>
              <strong>{s.title}</strong> <span className="muted small">({s.items.length} item)</span>
              {s.note && <div className="small muted">{s.note}</div>}
              <ul className="small" style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                {s.items.slice(0, 6).map(i => <li key={i.id}>{i.text}{i.reverse ? ' ↺' : ''}</li>)}
                {s.items.length > 6 && <li className="muted">… e altri {s.items.length - 6} item</li>}
              </ul>
            </div>
          ))}
          <h3>Scale e punteggi</h3>
          <table className="data">
            <thead><tr><th>Scala</th><th>Calcolo</th><th className="num">Item</th><th>Fasce</th></tr></thead>
            <tbody>
              {test.scales.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{{ sum: 'somma', mean: 'media', mean10: 'media × 10', count_gte: `conteggio ≥ ${s.threshold ?? 1}` }[s.compute]}</td>
                  <td className="num">{s.items[0] === '*' ? 'tutti' : s.items.length}</td>
                  <td className="small">{s.bands?.map(b => `${b.min}–${b.max} ${b.label}`).join(' · ') ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
