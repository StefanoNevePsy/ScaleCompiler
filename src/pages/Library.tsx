import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { addCustomCategory, db, deleteTest, getAllTests, getCatOverrides, getCustomCategories, getHiddenTests, testCategories, uid, unhideTest } from '../db';
import { StatusBadge, href, nav, readFileText, toast } from '../components';
import { allItems, validateDefinition } from '../scoring';
import type { TestDefinition } from '../types';

export function Library() {
  const tests = useLiveQuery(() => getAllTests(), []) ?? [];
  const overrides = useLiveQuery(() => getCatOverrides(), []) ?? {};
  const custom = useLiveQuery(() => getCustomCategories(), []) ?? [];
  const hiddenIds = useLiveQuery(() => getHiddenTests(), []) ?? [];
  const [filter, setFilter] = useState<string>('');

  const hidden = new Set(hiddenIds);
  const visible = tests.filter(t => !hidden.has(t.id));
  const allCats = [...new Set([...visible.flatMap(t => testCategories(t, overrides)), ...custom])].sort((a, b) => a.localeCompare(b));
  const uncategorized = visible.some(t => testCategories(t, overrides).length === 0);
  const inHiddenView = filter === '__hidden__';
  const list = inHiddenView
    ? tests.filter(t => hidden.has(t.id))
    : visible.filter(t => {
        const cats = testCategories(t, overrides);
        if (filter === '') return true;
        if (filter === '__none__') return cats.length === 0;
        return cats.includes(filter);
      });

  const remove = async (e: React.MouseEvent, t: TestDefinition) => {
    e.stopPropagation();
    if (!confirm(
      `Eliminare «${t.acronym} — ${t.name}» dalla libreria?\n\n` +
      `• I test integrati vengono nascosti e sono ripristinabili in seguito.\n` +
      `• I test personalizzati senza somministrazioni vengono eliminati definitivamente.\n` +
      `• Le somministrazioni già registrate restano sempre consultabili.`,
    )) return;
    toast((await deleteTest(t.id)).message);
  };
  const restore = async (e: React.MouseEvent, t: TestDefinition) => {
    e.stopPropagation();
    await unhideTest(t.id);
    toast(`«${t.acronym}» ripristinato nella libreria.`);
  };

  const newEmpty = async () => {
    const id = `nuovo-test-${uid().slice(0, 6)}`;
    await db.tests.put({
      id, acronym: 'NUOVO', name: 'Nuovo test (rinomina)', status: 'bozza', repeatable: true,
      categories: filter && filter !== '__none__' ? [filter] : [],
      defaultOptions: [{ value: 0, label: 'Mai' }, { value: 1, label: 'Qualche volta' }, { value: 2, label: 'Spesso' }],
      sections: [{ id: 's1', title: 'Sezione 1', items: [{ id: 'q1', text: 'Primo item…', type: 'likert' }] }],
      scales: [{ id: 'tot', name: 'Totale', items: ['*'], compute: 'sum' }],
    });
    nav('libreria', id);
  };

  const newCategory = async () => {
    const name = prompt('Nome della nuova categoria:')?.trim();
    if (!name) return;
    await addCustomCategory(name);
    setFilter(name);
    toast(`Categoria «${name}» creata: assegnala ai test dalla loro pagina.`);
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

      <div className="chips" role="group" aria-label="Filtra per categoria">
        <button className={`chip${filter === '' ? ' sel' : ''}`} onClick={() => setFilter('')}>Tutte ({visible.length})</button>
        {allCats.map(c => {
          const n = visible.filter(t => testCategories(t, overrides).includes(c)).length;
          return <button key={c} className={`chip${filter === c ? ' sel' : ''}`} onClick={() => setFilter(c)}>{c} ({n})</button>;
        })}
        {uncategorized && (
          <button className={`chip${filter === '__none__' ? ' sel' : ''}`} onClick={() => setFilter('__none__')}>Senza categoria</button>
        )}
        <button className="chip new" onClick={newCategory}>+ Nuova categoria</button>
        {hidden.size > 0 && (
          <button className={`chip${inHiddenView ? ' sel' : ''}`} onClick={() => setFilter(inHiddenView ? '' : '__hidden__')}>
            Nascosti ({hidden.size})
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <strong>{inHiddenView ? 'Nessun test nascosto' : 'Nessun test in questa categoria'}</strong>
          {inHiddenView ? 'I test rimossi dalla libreria compaiono qui.' : 'Assegna i test alle categorie dalla pagina di ciascun test.'}
        </div>
      ) : (
        <table className="data">
          <thead><tr><th>Sigla</th><th>Nome</th><th>Categorie</th><th className="num">Item</th><th>Stato</th><th></th></tr></thead>
          <tbody>
            {list.map(t => (
              <tr key={t.id} className="click" onClick={() => nav('libreria', t.id)}>
                <td><strong>{t.acronym}</strong></td>
                <td>{t.name}<div className="small muted">{t.population}{t.respondent ? ` · ${t.respondent}` : ''}</div></td>
                <td>{testCategories(t, overrides).map(c => <span key={c} className="badge cat">{c}</span>)}</td>
                <td className="num">{allItems(t).length}</td>
                <td><StatusBadge status={t.status} /></td>
                <td className="num">
                  {inHiddenView
                    ? <button className="btn-secondary btn-sm" onClick={e => restore(e, t)}>Ripristina</button>
                    : <button className="btn-danger btn-sm" onClick={e => remove(e, t)}>Elimina</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="small muted" style={{ marginTop: '1rem' }}>
        Stati: <strong>verificato</strong> = controllato sul manuale, pronto all’uso clinico · <strong>da verificare</strong> = struttura completa ma testi/cutoff da confrontare col manuale · <strong>bozza</strong> = contenitore da completare (non somministrabile).
      </p>
    </>
  );
}
