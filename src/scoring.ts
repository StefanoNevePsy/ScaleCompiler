import type { Answers, Band, Item, Option, Scale, ScoreResult, Section, TestDefinition } from './types';

export function itemOptions(def: TestDefinition, section: Section, item: Item): Option[] {
  if (item.type === 'yesno') return item.options ?? [{ value: 0, label: 'No' }, { value: 1, label: 'Sì' }];
  return item.options ?? section.options ?? def.defaultOptions ?? [];
}

export function allItems(def: TestDefinition): { item: Item; section: Section }[] {
  return def.sections.flatMap(s => s.items.map(item => ({ item, section: s })));
}

/** valore numerico di una risposta ai fini dello scoring (multi = somma dei selezionati) */
function numericValue(def: TestDefinition, section: Section, item: Item, v: unknown): number | null {
  if (v === null || v === undefined || v === '' || item.type === 'text') return null;
  let n: number;
  if (Array.isArray(v)) n = v.reduce((a, b) => a + b, 0);
  else if (typeof v === 'number') n = v;
  else return null;
  if (item.reverse) {
    const opts = itemOptions(def, section, item);
    if (opts.length) {
      const vals = opts.map(o => o.value);
      n = Math.min(...vals) + Math.max(...vals) - n;
    }
  }
  return n;
}

export function findBand(bands: Band[] | undefined, v: number): Band | undefined {
  return bands?.find(b => v >= b.min && v <= b.max);
}

export interface ScoreContext {
  gender?: 'M' | 'F';
}

export function computeScores(def: TestDefinition, answers: Answers, ctx: ScoreContext = {}): ScoreResult[] {
  const entries = allItems(def);
  const byId = new Map(entries.map(e => [e.item.id, e]));

  // primo passaggio: punteggi grezzi (serve il grezzo di K prima delle scale K-corrette)
  const results = def.scales
    .filter(scale => !scale.gender || !ctx.gender || scale.gender === ctx.gender)
    .map(scale => {
      let raw: number | null = null;
      let missing = 0;

      if (scale.compute === 'key') {
        raw = 0;
        for (const [ids, keyed] of [[scale.keyTrue ?? [], 1], [scale.keyFalse ?? [], 0]] as const) {
          for (const id of ids) {
            const v = answers[id];
            if (v === null || v === undefined || v === '') missing++;
            else if (v === keyed) raw++;
          }
        }
      } else if (scale.compute === 'pairs') {
        raw = scale.base ?? 0;
        for (const [a, va, b, vb, pts] of scale.pairs ?? []) {
          if (answers[a] === undefined || answers[b] === undefined) { missing++; continue; }
          if (answers[a] === va && answers[b] === vb) raw += pts;
        }
      } else {
        const ids = scale.items[0] === '*'
          ? entries.filter(e => e.item.type !== 'text').map(e => e.item.id)
          : scale.items;
        const values: number[] = [];
        for (const id of ids) {
          const e = byId.get(id);
          if (!e) continue;
          const n = numericValue(def, e.section, e.item, answers[id]);
          if (n === null) missing++;
          else values.push(n);
        }
        const maxMissing = scale.maxMissing ?? 0;
        if (values.length > 0 && missing <= maxMissing) {
          const sum = values.reduce((a, b) => a + b, 0);
          switch (scale.compute) {
            case 'sum':
              // prorate: somma riportata al numero totale di item
              raw = missing > 0 ? (sum / values.length) * ids.length : sum;
              break;
            case 'mean':
              raw = sum / values.length;
              break;
            case 'mean10':
              raw = (sum / values.length) * 10;
              break;
            case 'count_gte':
              raw = values.filter(v => v >= (scale.threshold ?? 1)).length;
              break;
          }
        }
      }

      const decimals = scale.decimals ?? (['mean', 'mean10'].includes(scale.compute) ? 1 : 0);
      if (raw !== null) raw = Number(raw.toFixed(decimals));
      return { scale, raw, missing };
    });

  const kRaw = results.find(r => r.scale.id === 'k')?.raw ?? null;

  return results.map(({ scale, raw, missing }) => {
    let kAdj: number | undefined;
    let t: number | null | undefined;
    if (scale.tscores && raw !== null) {
      let lookup = raw;
      if (scale.kFraction) {
        kAdj = kRaw !== null ? Math.floor(raw + scale.kFraction * kRaw + 0.5) : undefined;
        lookup = kAdj ?? raw;
      }
      const table = ctx.gender === 'F' ? scale.tscores.f : ctx.gender === 'M' ? scale.tscores.m : (scale.tscores.m && !scale.tscores.f ? scale.tscores.m : scale.tscores.f && !scale.tscores.m ? scale.tscores.f : undefined);
      t = table ? table[Math.max(0, Math.min(lookup, table.length - 1))] ?? null : null;
    }
    const bandValue = scale.tscores ? (t ?? null) : raw;
    return {
      scaleId: scale.id,
      name: scale.name,
      raw,
      missing,
      kAdj,
      t,
      band: bandValue !== null ? findBand(scale.bands, bandValue) : undefined,
    };
  });
}

export function countAnswered(def: TestDefinition, answers: Answers): { answered: number; total: number } {
  const entries = allItems(def);
  const answered = entries.filter(({ item }) => {
    const v = answers[item.id];
    return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
  }).length;
  return { answered, total: entries.length };
}

/** Valida una definizione di test (per import IA / editor). Ritorna lista di errori, vuota se ok. */
export function validateDefinition(d: any): string[] {
  const errs: string[] = [];
  const req = (cond: boolean, msg: string) => { if (!cond) errs.push(msg); };
  req(d && typeof d === 'object', 'La definizione deve essere un oggetto JSON.');
  if (!d || typeof d !== 'object') return errs;
  req(typeof d.id === 'string' && /^[a-z0-9-]+$/.test(d.id), 'Campo "id" mancante o non valido (solo minuscole, numeri, trattini).');
  req(typeof d.acronym === 'string' && d.acronym.length > 0, 'Campo "acronym" mancante.');
  req(typeof d.name === 'string' && d.name.length > 0, 'Campo "name" mancante.');
  req(['verificato', 'da_verificare', 'bozza'].includes(d.status), 'Campo "status" deve essere: verificato | da_verificare | bozza.');
  if (d.categories !== undefined) {
    req(Array.isArray(d.categories) && d.categories.every((c: any) => typeof c === 'string'),
      'Campo "categories" deve essere un array di stringhe.');
  }
  req(Array.isArray(d.sections), 'Campo "sections" deve essere un array.');
  req(Array.isArray(d.scales), 'Campo "scales" deve essere un array.');
  if (!Array.isArray(d.sections) || !Array.isArray(d.scales)) return errs;

  const itemIds = new Set<string>();
  const validTypes = ['likert', 'single', 'multi', 'yesno', 'number', 'text'];
  d.sections.forEach((s: any, si: number) => {
    req(typeof s.id === 'string' && typeof s.title === 'string', `Sezione ${si + 1}: "id" e "title" obbligatori.`);
    req(Array.isArray(s.items) && s.items.length > 0, `Sezione ${si + 1}: "items" vuoto o mancante.`);
    (s.items ?? []).forEach((it: any, ii: number) => {
      const where = `Sezione ${si + 1}, item ${ii + 1}`;
      req(typeof it.id === 'string' && it.id.length > 0, `${where}: "id" mancante.`);
      if (it.id) {
        req(!itemIds.has(it.id), `${where}: id duplicato "${it.id}".`);
        itemIds.add(it.id);
      }
      req(typeof it.text === 'string' && it.text.length > 0, `${where}: "text" mancante.`);
      req(validTypes.includes(it.type), `${where}: "type" non valido (${it.type}).`);
      const opts = it.options ?? s.options ?? d.defaultOptions;
      if (['likert', 'single', 'multi'].includes(it.type)) {
        req(Array.isArray(opts) && opts.length >= 2, `${where}: opzioni mancanti (né item, né sezione, né defaultOptions).`);
        (Array.isArray(opts) ? opts : []).forEach((o: any) => {
          req(typeof o.value === 'number' && typeof o.label === 'string', `${where}: ogni opzione richiede value numerico e label.`);
        });
      }
    });
  });

  d.scales.forEach((sc: any, i: number) => {
    const where = `Scala ${i + 1} (${sc.id ?? '?'})`;
    req(typeof sc.id === 'string' && typeof sc.name === 'string', `${where}: "id" e "name" obbligatori.`);
    req(['sum', 'mean', 'mean10', 'count_gte', 'key', 'pairs'].includes(sc.compute), `${where}: "compute" deve essere sum | mean | mean10 | count_gte | key | pairs.`);
    if (sc.compute === 'key') {
      const keyed = [...(sc.keyTrue ?? []), ...(sc.keyFalse ?? [])];
      req(keyed.length > 0, `${where}: compute "key" richiede keyTrue e/o keyFalse.`);
      keyed.forEach((id: any) => req(itemIds.has(id), `${where}: item "${id}" inesistente.`));
    } else if (sc.compute === 'pairs') {
      req(Array.isArray(sc.pairs) && sc.pairs.length > 0, `${where}: compute "pairs" richiede "pairs".`);
      (sc.pairs ?? []).forEach((p: any) => {
        req(Array.isArray(p) && p.length === 5 && itemIds.has(p[0]) && itemIds.has(p[2]), `${where}: coppia non valida (${JSON.stringify(p)}).`);
      });
    } else {
      req(Array.isArray(sc.items) && sc.items.length > 0, `${where}: "items" vuoto.`);
      if (Array.isArray(sc.items) && sc.items[0] !== '*') {
        sc.items.forEach((id: any) => req(itemIds.has(id), `${where}: item "${id}" inesistente.`));
      }
    }
    (sc.bands ?? []).forEach((b: any, bi: number) => {
      req(typeof b.min === 'number' && typeof b.max === 'number' && typeof b.label === 'string',
        `${where}, fascia ${bi + 1}: richiede min, max numerici e label.`);
    });
  });
  return errs;
}
