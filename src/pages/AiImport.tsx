import { useEffect, useState } from 'react';
import { DEFAULT_MODELS, MASTER_PROMPT, extractJson, generateDefinition, type AiConfig } from '../ai';
import { db, getSetting, setSetting } from '../db';
import { href, nav, readFileBase64, toast } from '../components';
import { allItems, validateDefinition } from '../scoring';
import type { TestDefinition } from '../types';

export function AiImport() {
  const [provider, setProvider] = useState<AiConfig['provider']>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_MODELS.gemini);
  const [text, setText] = useState('');
  const [extra, setExtra] = useState('');
  const [pdf, setPdf] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pasted, setPasted] = useState('');
  const [preview, setPreview] = useState<TestDefinition | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const p = (await getSetting('ai.provider')) as AiConfig['provider'] | undefined;
      if (p) setProvider(p);
      setApiKey((await getSetting(`ai.key.${p ?? 'gemini'}`)) ?? '');
      const m = await getSetting(`ai.model.${p ?? 'gemini'}`);
      if (m) setModel(m);
    })();
  }, []);

  const switchProvider = async (p: AiConfig['provider']) => {
    setProvider(p);
    setApiKey((await getSetting(`ai.key.${p}`)) ?? '');
    setModel((await getSetting(`ai.model.${p}`)) ?? DEFAULT_MODELS[p]);
  };

  const persistCfg = async () => {
    await setSetting('ai.provider', provider);
    await setSetting(`ai.key.${provider}`, apiKey);
    await setSetting(`ai.model.${provider}`, model);
  };

  const validate = (raw: string) => {
    try {
      const def = extractJson(raw);
      const errs = validateDefinition(def);
      setErrors(errs);
      setPreview(errs.length ? null : def);
      if (!errs.length) toast('Definizione valida: controlla l’anteprima e salva.');
    } catch (e: any) {
      setErrors([e.message]);
      setPreview(null);
    }
  };

  const generate = async () => {
    if (!apiKey) { toast('Inserisci la chiave API.'); return; }
    if (!text.trim() && !pdf) { toast('Incolla il materiale del test o carica un PDF.'); return; }
    setBusy(true); setErrors([]); setPreview(null);
    try {
      await persistCfg();
      const out = await generateDefinition(
        { provider, apiKey, model },
        { text, extraInstructions: extra || undefined, pdf: pdf ?? undefined },
      );
      setPasted(out);
      validate(out);
    } catch (e: any) {
      setErrors([String(e.message ?? e)]);
    } finally {
      setBusy(false);
    }
  };

  const copyPrompt = async () => {
    const full = MASTER_PROMPT + '\n\n' + (extra ? `ISTRUZIONI AGGIUNTIVE: ${extra}\n\n` : '') + (text || '[INCOLLA QUI IL MATERIALE DEL TEST / ALLEGA IL MANUALE]');
    await navigator.clipboard.writeText(full);
    toast('Prompt copiato: incollalo in un chatbot (con il manuale) e riporta qui il JSON prodotto.');
  };

  const save = async () => {
    if (!preview) return;
    const exists = await db.tests.get(preview.id);
    if (exists && !confirm(`Esiste già un test personalizzato con id "${preview.id}": sovrascrivere?`)) return;
    await db.tests.put({ ...preview, status: preview.status === 'verificato' ? 'da_verificare' : preview.status });
    toast(`Test ${preview.acronym} salvato nella libreria.`);
    nav('libreria', preview.id);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Importa test da manuale (IA)</h1>
          <div className="sub" style={{ maxWidth: '72ch' }}>
            Fornisci il materiale del test (consegna, item, scoring, cutoff): l’IA ricostruisce la definizione digitale completa, che viene validata e salvata come «da verificare».
          </div>
        </div>
      </div>

      <p className="callout warn small">
        Privacy: il materiale inserito qui viene inviato al provider IA scelto. Inserisci solo il testo dello strumento (mai dati di pazienti) e rispetta i termini della licenza del test.
      </p>

      <h2>1 · Provider IA</h2>
      <div className="row">
        <label className="field">Provider
          <select value={provider} onChange={e => switchProvider(e.target.value as AiConfig['provider'])}>
            <option value="gemini">Google Gemini (consigliato: supporta PDF)</option>
            <option value="nvidia">build.nvidia.com (OpenAI-compatibile)</option>
          </select>
        </label>
        <label className="field">Chiave API
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder={provider === 'gemini' ? 'AI Studio → Get API key' : 'build.nvidia.com → API key (nvapi-…)'} />
        </label>
        <label className="field">Modello
          <input value={model} onChange={e => setModel(e.target.value)} />
        </label>
      </div>
      <p className="small muted">La chiave resta salvata solo in questo browser. In alternativa, usa «Copia prompt» e lavora in un chatbot qualsiasi senza chiave.</p>

      <h2>2 · Materiale del test</h2>
      <label className="field">Testo del manuale / protocollo / articolo (incolla qui)
        <textarea rows={10} value={text} onChange={e => setText(e.target.value)}
          placeholder="Incolla consegna, elenco item con le opzioni di risposta, regole di scoring, sottoscale e cutoff…" />
      </label>
      <div className="row">
        <label className="field">PDF del manuale (solo Gemini)
          <input type="file" accept="application/pdf" onChange={async e => {
            const f = e.target.files?.[0];
            if (f) setPdf({ name: f.name, base64: await readFileBase64(f), mimeType: 'application/pdf' });
          }} />
        </label>
        <label className="field" style={{ flex: 2 }}>Istruzioni aggiuntive (opzionale)
          <input value={extra} onChange={e => setExtra(e.target.value)}
            placeholder='es. "genera solo la forma genitori", "mantieni i testi in inglese"' />
        </label>
      </div>
      {pdf && <p className="small muted">PDF allegato: {pdf.name} <button className="btn-secondary btn-sm" onClick={() => setPdf(null)}>Rimuovi</button></p>}

      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={generate} disabled={busy}>{busy ? 'Generazione in corso…' : 'Genera con IA'}</button>
        <button className="btn-secondary" onClick={copyPrompt}>Copia prompt completo (per chatbot esterno)</button>
      </div>

      <h2>3 · Risultato</h2>
      <label className="field">JSON prodotto (dall’IA o incollato da un chatbot esterno)
        <textarea rows={10} style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem' }}
          value={pasted} onChange={e => setPasted(e.target.value)} spellCheck={false}
          placeholder='{"id":"…","acronym":"…",…}' />
      </label>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={() => validate(pasted)} disabled={!pasted.trim()}>Valida</button>
        <button className="btn-primary" onClick={save} disabled={!preview}>Salva nella libreria</button>
      </div>

      {errors.length > 0 && (
        <div className="callout error small" style={{ marginTop: '1rem' }}>
          <strong>Problemi rilevati:</strong>
          {errors.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}

      {preview && (
        <div className="panel" style={{ marginTop: '1rem' }}>
          <strong>{preview.acronym}</strong> — {preview.name}
          <div className="small muted">
            {preview.sections.length} sezioni · {allItems(preview).length} item · {preview.scales.length} scale
            {preview.timeframe ? ` · finestra: ${preview.timeframe}` : ''}
          </div>
          <ul className="small" style={{ paddingLeft: '1.2rem' }}>
            {preview.scales.map(s => <li key={s.id}>{s.name} ({s.compute}{s.bands ? `, ${s.bands.length} fasce` : ''})</li>)}
          </ul>
          <p className="small muted">Dopo il salvataggio: confronta item per item con il manuale, poi usa «Segna come verificato» nella pagina del test (<a href={href('libreria')}>Libreria</a>).</p>
        </div>
      )}
    </>
  );
}
