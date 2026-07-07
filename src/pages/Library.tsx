import { useLiveQuery } from 'dexie-react-hooks';
import { db, getAllTests, uid } from '../db';
import { StatusBadge, href, nav, toast } from '../components';
import { allItems } from '../scoring';
import { readFileText } from '../components';
import { validateDefinition } from '../scoring';

export function Library() {
  const tests = useLiveQuery(() => getAllTests(), []) ?? [];

  const newEmpty = async () => {
    const id = `nuovo-test-${uid().slice(0, 6)}`;
    await db.tests.put({
      id, acronym: 'NUOVO', name: 'Nuovo test (rinomina)', status: 'bozza', repeatable: true,
      defaultOptions: [{ value: 0, label: 'Mai' }, { value: 1, label: 'Qualche volta' }, { value: 2, label: 'Spesso' }],
      sections: [{ id: 's1', title: 'Sezione 1', items: [{ id: 'q1', text: 'Primo item…', type: 'likert' }] }],
      scales: [{ id: 'tot', name: 'Totale', items: ['*'], compute: 'sum' }],
    });
    nav('libreria', id);
  };

  const importJson = async (file: File) => {
    try {
      const def = JSON.parse(await readFileText(file));
      const errs = validateDefinition(def);
      if (errs.length) { toast(`Definizione non valida: ${errs[0]}`); return; }
      await db.tests.put(def);
      toast(`Test ${def.acronym} importato.`);
      nav('libreria', def.id);
    } catch (e: any) {
      toast('Errore di lettura del file: ' + e.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Libreria test</h1>
          <div className="sub">I test sono definizioni JSON: modificabili, esportabili e condivisibili tra colleghi.</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href={href('importa')}>Importa da manuale (IA)</a>
          <button className="btn-secondary" onClick={newEmpty}>Nuovo test vuoto</button>
          <label className="btn btn-secondary" style={{ marginBottom: 0 }}>
            Importa file JSON
            <input type="file" accept=".json,application/json" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }} />
          </label>
        </div>
      </div>

      <table className="data">
        <thead><tr><th>Sigla</th><th>Nome</th><th>Compilante</th><th className="num">Item</th><th className="num">Scale</th><th>Stato</th></tr></thead>
        <tbody>
          {tests.map(t => (
            <tr key={t.id} className="click" onClick={() => nav('libreria', t.id)}>
              <td><strong>{t.acronym}</strong></td>
              <td>{t.name}<div className="small muted">{t.population}</div></td>
              <td>{t.respondent ?? '—'}</td>
              <td className="num">{allItems(t).length}</td>
              <td className="num">{t.scales.length}</td>
              <td><StatusBadge status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted" style={{ marginTop: '1rem' }}>
        Stati: <strong>verificato</strong> = controllato sul manuale, pronto all’uso clinico · <strong>da verificare</strong> = struttura completa ma testi/cutoff da confrontare col manuale · <strong>bozza</strong> = contenitore da completare (non somministrabile).
      </p>
    </>
  );
}
