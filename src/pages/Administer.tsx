import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getTest, uid } from '../db';
import { href, nav, toast } from '../components';
import { allItems, countAnswered, itemOptions } from '../scoring';
import type { Administration, Answers, Item, Option, Section, TestDefinition } from '../types';

type Props = { patientId?: string; testId?: string; adminId?: string };

export function Administer({ patientId, testId, adminId }: Props) {
  const existing = useLiveQuery(async () => (adminId ? db.administrations.get(adminId) : undefined), [adminId]);
  const pid = patientId ?? existing?.patientId;
  const tid = testId ?? existing?.testId;
  const patient = useLiveQuery(async () => (pid ? db.patients.get(pid) : undefined), [pid]);
  const test = useLiveQuery(async () => (tid ? getTest(tid) : undefined), [tid]);

  if (adminId && existing === undefined) return null; // in caricamento
  if (!pid || !tid) return <div className="empty"><strong>Somministrazione non trovata</strong></div>;
  if (test === undefined || patient === undefined) return null;
  if (!test || !patient) return <div className="empty"><strong>Test o paziente non trovato</strong></div>;

  return <Form key={adminId ?? `${pid}-${tid}`} test={test} patientCode={patient.code} patientId={pid} existing={existing ?? undefined} />;
}

function Form({ test, patientId, patientCode, existing }: {
  test: TestDefinition; patientId: string; patientCode: string; existing?: Administration;
}) {
  const [answers, setAnswers] = useState<Answers>(existing?.answers ?? {});
  const [date, setDate] = useState((existing?.date ?? new Date().toISOString()).slice(0, 10));
  const [respondent, setRespondent] = useState(existing?.respondent ?? test.respondent ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [mode, setMode] = useState<'griglia' | 'guidata'>('griglia');
  const [active, setActive] = useState(0);

  const entries = useMemo(() => allItems(test), [test]);
  const { answered, total } = countAnswered(test, answers);
  const listRef = useRef<HTMLDivElement>(null);

  const setAns = (item: Item, v: Answers[string], advance = true) => {
    setAnswers(a => ({ ...a, [item.id]: v }));
    if (!advance) return;
    const idx = entries.findIndex(e => e.item.id === item.id);
    const next = entries.findIndex((e, i) => i > idx && answers[e.item.id] === undefined && e.item.id !== item.id);
    const target = next === -1 ? Math.min(idx + 1, entries.length - 1) : next;
    setActive(target);
    if (mode === 'griglia') {
      requestAnimationFrame(() => {
        listRef.current?.querySelector(`[data-idx="${target}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    }
  };

  // Tastiera: cifre = opzione (per valore se le opzioni sono 0-9, altrimenti per posizione 1-N), frecce = navigazione
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const entry = entries[active];
      if (!entry) return;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') { setActive(a => Math.min(a + 1, entries.length - 1)); ev.preventDefault(); return; }
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') { setActive(a => Math.max(a - 1, 0)); ev.preventDefault(); return; }
      if (!/^[0-9]$/.test(ev.key)) return;
      const { item, section } = entry;
      if (!['likert', 'single', 'yesno'].includes(item.type)) return;
      const opts = itemOptions(test, section, item);
      const digit = Number(ev.key);
      const byValue = opts.every(o => Number.isInteger(o.value) && o.value >= 0 && o.value <= 9)
        && new Set(opts.map(o => o.value)).size === opts.length;
      const opt = byValue ? opts.find(o => o.value === digit) : opts[digit - 1];
      if (opt) { setAns(item, opt.value); ev.preventDefault(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const save = async () => {
    const completed = entries.every(({ item }) => item.optional || answers[item.id] !== undefined && answers[item.id] !== '' && !(Array.isArray(answers[item.id]) && (answers[item.id] as number[]).length === 0));
    if (!completed && !confirm(`Mancano ${total - answered} risposte. Salvare comunque come incompleta?`)) return;
    const admin: Administration = {
      id: existing?.id ?? uid(),
      patientId,
      testId: test.id,
      date: new Date(date + 'T12:00:00').toISOString(),
      respondent: respondent || undefined,
      notes: notes || undefined,
      answers,
      completed,
    };
    await db.administrations.put(admin);
    toast('Somministrazione salvata.');
    nav('somm', admin.id);
  };

  return (
    <>
      <div className="progress no-print">
        <div className="page-head" style={{ marginBottom: '0.5rem' }}>
          <div>
            <strong>{test.acronym}</strong> · {patientCode}
            <span className="muted small"> — {answered}/{total} risposte</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="small muted">Tasti <kbd>0</kbd>–<kbd>9</kbd> rispondono, <kbd>↑</kbd><kbd>↓</kbd> navigano</span>
            <button className="btn-secondary btn-sm" onClick={() => setMode(m => m === 'griglia' ? 'guidata' : 'griglia')}>
              {mode === 'griglia' ? 'Modalità paziente (guidata)' : 'Modalità clinico (griglia)'}
            </button>
            <a className="btn btn-secondary btn-sm" href={href('p', patientId)}>Esci senza salvare</a>
            <button className="btn-primary btn-sm" onClick={save}>Salva</button>
          </div>
        </div>
        <div className="bar"><div style={{ transform: `scaleX(${total ? answered / total : 0})` }} /></div>
      </div>

      <div className="row" style={{ margin: '1rem 0' }}>
        <label className="field">Data somministrazione
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </label>
        <label className="field">Compilato da
          <input value={respondent} onChange={e => setRespondent(e.target.value)} placeholder="paziente, clinico, genitore…" />
        </label>
        <label className="field" style={{ flex: 2 }}>Note
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="contesto, osservazioni…" />
        </label>
      </div>

      {test.timeframe && <p className="callout">Finestra temporale di riferimento: <strong>{test.timeframe}</strong></p>}

      {mode === 'griglia' ? (
        <div ref={listRef}>
          {test.sections.map(sec => (
            <section key={sec.id}>
              <h2>{sec.title}</h2>
              {sec.note && <p className="muted small">{sec.note}</p>}
              {sec.items.map(item => {
                const idx = entries.findIndex(e => e.item.id === item.id);
                return (
                  <div key={item.id} data-idx={idx} className={`item-row${idx === active ? ' active' : ''}`} onClick={() => setActive(idx)}>
                    <div className="txt">{item.text}{item.help && <span className="help">{item.help}</span>}</div>
                    <ItemInput test={test} section={sec} item={item} value={answers[item.id]} onChange={(v, adv) => setAns(item, v, adv)} />
                  </div>
                );
              })}
            </section>
          ))}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={save}>Salva somministrazione</button>
          </div>
        </div>
      ) : (
        <Guided test={test} entries={entries} answers={answers} active={active} setActive={setActive}
          onAnswer={(item, v) => setAns(item, v)} onDone={save} />
      )}
    </>
  );
}

function ItemInput({ test, section, item, value, onChange, big }: {
  test: TestDefinition; section: Section; item: Item; value: Answers[string];
  onChange: (v: Answers[string], advance?: boolean) => void; big?: boolean;
}) {
  const opts = itemOptions(test, section, item);
  if (item.type === 'likert' || item.type === 'single' || item.type === 'yesno') {
    return (
      <div className="optgroup" role="radiogroup" aria-label={item.text}>
        {opts.map(o => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value}
            className={`opt${value === o.value ? ' sel' : ''}`}
            onClick={e => { e.stopPropagation(); onChange(value === o.value ? null : o.value); }}>
            {o.label}
          </button>
        ))}
      </div>
    );
  }
  if (item.type === 'multi') {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div className="optgroup">
        {opts.map(o => {
          const sel = arr.includes(o.value);
          return (
            <button key={o.value} type="button" aria-pressed={sel} className={`opt${sel ? ' sel' : ''}`}
              onClick={e => { e.stopPropagation(); onChange(sel ? arr.filter(v => v !== o.value) : [...arr, o.value], false); }}>
              {sel ? '☑' : '☐'} {o.label}
            </button>
          );
        })}
      </div>
    );
  }
  if (item.type === 'number') {
    return <input type="number" style={{ maxWidth: big ? 200 : 120 }} value={value === null || value === undefined ? '' : String(value)}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value), false)} onClick={e => e.stopPropagation()} />;
  }
  return <textarea rows={big ? 4 : 2} style={{ maxWidth: 420 }} value={typeof value === 'string' ? value : ''}
    onChange={e => onChange(e.target.value || null, false)} onClick={e => e.stopPropagation()} />;
}

function Guided({ test, entries, answers, active, setActive, onAnswer, onDone }: {
  test: TestDefinition; entries: { item: Item; section: Section }[]; answers: Answers;
  active: number; setActive: (n: number) => void;
  onAnswer: (item: Item, v: Answers[string]) => void; onDone: () => void;
}) {
  const e = entries[active];
  if (!e) return null;
  const last = active === entries.length - 1;
  return (
    <div className="guided">
      <div className="muted small">{e.section.title} — domanda {active + 1} di {entries.length}</div>
      {e.section.note && <p className="muted">{e.section.note}</p>}
      <div className="q">{e.item.text}</div>
      <ItemInput big test={test} section={e.section} item={e.item} value={answers[e.item.id]}
        onChange={v => { onAnswer(e.item, v); }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }} className="no-print">
        <button className="btn-secondary" disabled={active === 0} onClick={() => setActive(active - 1)}>← Indietro</button>
        {last
          ? <button className="btn-primary" onClick={onDone}>Concludi e salva</button>
          : <button className="btn-secondary" onClick={() => setActive(active + 1)}>Avanti →</button>}
      </div>
    </div>
  );
}
