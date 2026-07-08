import type { Item, Option, Scale, Section, TestDefinition } from '../types';
import data from './mmpi2-data.json';

// MMPI-2 — dati (567 item, 130 scale con chiavi V/F, correzione K e tabelle T per genere)
// estratti dallo scorer GPL "mmpi2008" di Kevin Timmerman fornito dall'utente
// (https://github.com/nucular/mmpi-2). Item in inglese (originale). Le tabelle T contenevano
// alcuni refusi corretti per interpolazione: verificare sul manuale prima dell'uso clinico.

const VF: Option[] = [{ value: 1, label: 'Vero' }, { value: 0, label: 'Falso' }];
const q = (n: number) => `q${n}`;

const CHUNK = 100;
const sections: Section[] = [];
for (let start = 0; start < (data.questions as string[]).length; start += CHUNK) {
  const items: Item[] = (data.questions as string[]).slice(start, start + CHUNK).map((text, i) => ({
    id: q(start + i + 1),
    text: `${start + i + 1}. ${text}`,
    type: 'yesno' as const,
    options: VF,
  }));
  sections.push({ id: `s${start / CHUNK + 1}`, title: `Item ${start + 1}–${start + items.length}`, items });
}

// Fasce standard sui punti T per le scale cliniche/di contenuto (non per validità e Mf/GM/GF)
const T_BANDS = [
  { min: 0, max: 64, label: 'Nella norma (T < 65)', severity: 0 as const },
  { min: 65, max: 79, label: 'Clinicamente significativo (T 65-79)', severity: 2 as const },
  { min: 80, max: 200, label: 'Marcatamente elevato (T ≥ 80)', severity: 3 as const },
];
const NO_BANDS = new Set(['F', 'Fb', 'Fp', 'L', 'K', 'S', 'Mf', 'GM', 'GF', 'Es', 'Do', 'Re', 'R', 'O-H']);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const seen = new Map<string, number>();

const scales: Scale[] = [
  // VRIN / TRIN (coppie di item; punteggio grezzo, senza conversione T direzionale)
  ...(data.rin as { code: string; desc: string; base: number; pairs: [number, string, number, string, number][] }[]).map(r => ({
    id: slug(r.code),
    name: `${r.code} — ${r.desc} (grezzo)`,
    items: [] as string[],
    compute: 'pairs' as const,
    base: r.base,
    pairs: r.pairs.map(([a, va, b, vb, pts]) => [q(a), va === 'T' ? 1 : 0, q(b), vb === 'T' ? 1 : 0, pts] as [string, number, string, number, number]),
  })),
  ...(data.scales as {
    welsh: string; code: string; desc: string; trueItems: number[]; falseItems: number[];
    kFraction?: number; tM: (number | null)[] | null; tF: (number | null)[] | null; gender?: 'M' | 'F';
  }[]).map(s => {
    let id = slug(s.code) + (s.gender ? `-${s.gender.toLowerCase()}` : '');
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n + 1}`;
    return {
      id: s.code === 'K' ? 'k' : id, // la scala K deve avere id "k" per la correzione
      name: `${s.welsh && s.welsh !== s.code ? s.welsh + ' · ' : ''}${s.code} — ${s.desc}${s.kFraction ? ` (+${s.kFraction}K)` : ''}`,
      items: [] as string[],
      compute: 'key' as const,
      keyTrue: s.trueItems.map(q),
      keyFalse: s.falseItems.map(q),
      kFraction: s.kFraction,
      gender: s.gender,
      tscores: { m: s.tM ?? undefined, f: s.tF ?? undefined },
    } as Scale;
  }),
];

// applica le fasce T standard dove ha senso clinicamente
for (const sc of scales) {
  const code = sc.name.split(' — ')[0].split(' · ').pop() ?? '';
  if (sc.compute === 'key' && sc.tscores && !NO_BANDS.has(code)) sc.bands = T_BANDS;
}

export const mmpi2: TestDefinition = {
  id: 'mmpi-2',
  acronym: 'MMPI-2',
  name: 'Minnesota Multiphasic Personality Inventory — 2',
  author: 'Hathaway & McKinley; rev. Butcher et al. (1989)',
  source: 'University of Minnesota Press / Pearson — richiede licenza e qualifica; dati di scoring dallo scorer GPL mmpi2008 (Timmerman) fornito dal centro',
  description: 'Inventario di personalità a 567 item vero/falso: scale di validità (VRIN, TRIN, F, Fb, Fp, L, K, S), cliniche con sottoscale Harris-Lingoes, di contenuto e componenti, supplementari, RC e PSY-5. Punti T non uniformati per genere con correzione K.',
  population: 'Adulti (18+)',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Personalità'],
  sections,
  scales,
  notes: 'IMPORTANTE: (1) impostare il sesso del paziente nella sua scheda, altrimenti i punti T non sono calcolabili; (2) i punti T qui calcolati sono quelli LINEARI dello scorer di origine (non i T uniformati delle norme italiane Pancheri-Sirigatti): confrontare con il manuale in licenza prima dell’uso refertale; (3) alcune tabelle T contenevano refusi nella fonte, corretti per interpolazione — verificare le scale Mf-M, Pt, Sc, Ma, Sc4-F, ASP-F, AAS-F, Mt-M, PK-F, NEGE-F; (4) VRIN/TRIN sono riportate come punteggio grezzo (cutoff manuale: grezzo ≥13 protocollo dubbio); (5) item lasciati in blocchi da 100 con possibilità di sospendere e riprendere la compilazione; (6) interpretazione riservata a professionisti qualificati secondo la licenza dell’editore.',
};
