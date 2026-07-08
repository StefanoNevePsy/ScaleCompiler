import type { TestDefinition } from '../types';

// Attaccamento e relazioni — strumenti free-to-use (Fraley; Bartholomew & Horowitz).

const A7 = [
  { value: 1, label: '1 — Fortemente in disaccordo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
  { value: 4, label: '4 — Neutro' }, { value: 5, label: '5' }, { value: 6, label: '6' },
  { value: 7, label: '7 — Fortemente d’accordo' },
];

const ANX: [string, boolean?][] = [
  ['Ho paura di perdere l’amore del/della mio/a partner'],
  ['Mi preoccupo spesso che il/la mio/a partner non voglia restare con me'],
  ['Mi preoccupo spesso che il/la mio/a partner non mi ami davvero'],
  ['Mi preoccupo che i/le partner non tengano a me quanto io tengo a loro'],
  ['Vorrei spesso che i sentimenti del/della mio/a partner per me fossero forti quanto i miei per lui/lei'],
  ['Mi preoccupo molto per le mie relazioni'],
  ['Quando il/la mio/a partner è lontano/a, temo che possa interessarsi a qualcun altro'],
  ['Quando mostro i miei sentimenti ai/alle partner, ho paura che non provino lo stesso per me'],
  ['Raramente mi preoccupo che il/la mio/a partner mi lasci', true],
  ['Il/la mio/a partner mi fa dubitare di me stesso/a'],
  ['Non mi preoccupo spesso di essere abbandonato/a', true],
  ['Trovo che i/le partner non vogliano avvicinarsi quanto vorrei io'],
  ['A volte i/le partner cambiano i loro sentimenti verso di me senza un motivo apparente'],
  ['Il mio desiderio di grande vicinanza a volte fa scappare le persone'],
  ['Ho paura che, una volta conosciuto/a a fondo, al/alla partner non piaccia chi sono davvero'],
  ['Mi fa arrabbiare non ricevere dal/dalla partner l’affetto e il sostegno di cui ho bisogno'],
  ['Mi preoccupo di non essere all’altezza delle altre persone'],
  ['Il/la mio/a partner sembra accorgersi di me solo quando sono arrabbiato/a'],
];
const AVO: [string, boolean?][] = [
  ['Preferisco non mostrare al/alla partner come mi sento nel profondo'],
  ['Mi sento a mio agio nel condividere pensieri e sentimenti privati con il/la partner', true],
  ['Trovo difficile permettermi di dipendere dai/dalle partner'],
  ['Mi sento molto a mio agio nella vicinanza con i/le partner', true],
  ['Non mi sento a mio agio ad aprirmi con i/le partner'],
  ['Preferisco non essere troppo vicino/a ai/alle partner'],
  ['Mi sento a disagio quando un/una partner vuole molta vicinanza'],
  ['Trovo relativamente facile avvicinarmi al/alla mio/a partner', true],
  ['Non è difficile per me avvicinarmi al/alla mio/a partner', true],
  ['Di solito discuto i miei problemi e le mie preoccupazioni con il/la partner', true],
  ['Nei momenti di bisogno mi aiuta rivolgermi al/alla partner', true],
  ['Racconto al/alla partner praticamente tutto', true],
  ['Parlo delle cose con il/la mio/a partner', true],
  ['Divento nervoso/a quando i/le partner si avvicinano troppo'],
  ['Mi sento a mio agio a dipendere dai/dalle partner', true],
  ['Trovo facile dipendere dai/dalle partner', true],
  ['È facile per me essere affettuoso/a con il/la partner', true],
  ['Il/la mio/a partner capisce davvero me e i miei bisogni', true],
];

export const ecrR: TestDefinition = {
  id: 'ecr-r',
  acronym: 'ECR-R',
  name: 'Experiences in Close Relationships — Revised',
  author: 'Fraley, Waller & Brennan (2000)',
  source: 'Uso libero (Fraley)',
  description: 'Attaccamento adulto nelle relazioni sentimentali su due dimensioni: Ansia (da abbandono) ed Evitamento (della vicinanza).',
  population: 'Adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Attaccamento e relazioni'],
  viz: { poles: {
    ansia: ['Sicurezza sul legame', 'Ansia da abbandono', 1, 7],
    evitamento: ['Ricerca di vicinanza', 'Evitamento dell\u2019intimità', 1, 7],
  } },
  defaultOptions: A7,
  sections: [
    {
      id: 'anx', title: 'Come vivo le relazioni (1-18)',
      note: 'Indica quanto sei d’accordo pensando a come vivi in generale le relazioni sentimentali.',
      items: ANX.map(([text, rev], i) => ({ id: `q${i + 1}`, text: `${i + 1}. ${text}`, type: 'likert' as const, reverse: rev })),
    },
    {
      id: 'avo', title: 'Vicinanza e intimità (19-36)',
      items: AVO.map(([text, rev], i) => ({ id: `q${i + 19}`, text: `${i + 19}. ${text}`, type: 'likert' as const, reverse: rev })),
    },
  ],
  scales: [
    { id: 'ansia', name: 'Ansia (media 1-7)', items: ANX.map((_, i) => `q${i + 1}`), compute: 'mean', decimals: 2, bands: [
      { min: 1, max: 2.99, label: 'Bassa', severity: 0 }, { min: 3, max: 4.99, label: 'Media', severity: 1 }, { min: 5, max: 7, label: 'Alta', severity: 2 },
    ] },
    { id: 'evitamento', name: 'Evitamento (media 1-7)', items: AVO.map((_, i) => `q${i + 19}`), compute: 'mean', decimals: 2, bands: [
      { min: 1, max: 2.99, label: 'Basso', severity: 0 }, { min: 3, max: 4.99, label: 'Medio', severity: 1 }, { min: 5, max: 7, label: 'Alto', severity: 2 },
    ] },
  ],
  info: `SCORING: media per dimensione (1-7). Ansia = item 1-18 (invertiti 9, 11); Evitamento = item 19-36 (invertiti 20, 22, 26-31, 33-36).
INTERPRETAZIONE: le due dimensioni collocano nel piano dell'attaccamento adulto — Ansia bassa + Evitamento basso = sicuro; Ansia alta + Evitamento basso = preoccupato; Ansia bassa + Evitamento alto = distanziante/evitante; entrambi alti = timoroso. Non esistono cutoff clinici: usare medie campionarie (≈3-3.5) come riferimento e valutare il profilo nel colloquio.
USO: riferito alle relazioni sentimentali in generale, non solo alla relazione attuale.`,
  notes: 'Le fasce sono descrittive (non cutoff clinici): l’interpretazione classica colloca il profilo nel piano Ansia × Evitamento (basso/basso = sicuro; alta ansia = preoccupato; alto evitamento = distanziante; alti entrambi = timoroso). Item invertiti: 9, 11, 20, 22, 26-31, 33-36 — chiave e testi DA VERIFICARE sulla versione italiana validata (es. Busonera et al.).',
};

const RQ_TEXTS = [
  'A. Per me è facile stabilire legami affettivi con gli altri. Mi sento a mio agio sia nel dipendere dagli altri sia nel sapere che gli altri dipendono da me. Non mi preoccupo di restare solo/a o che gli altri non mi accettino. (Sicuro)',
  'B. Mi sento a disagio nell’avvicinarmi agli altri. Desidero relazioni strette, ma trovo difficile fidarmi completamente o dipendere dagli altri. A volte temo di soffrire se mi lascio andare troppo. (Timoroso)',
  'C. Vorrei una totale intimità con gli altri, ma spesso trovo che gli altri sono riluttanti ad avvicinarsi quanto vorrei io. Sto male senza relazioni strette, e a volte temo di tenere agli altri più di quanto loro tengano a me. (Preoccupato)',
  'D. Sto bene anche senza relazioni affettive strette. Per me è molto importante sentirmi indipendente e autosufficiente, e preferisco non dipendere dagli altri né che gli altri dipendano da me. (Distanziante)',
];

export const rq: TestDefinition = {
  id: 'rq',
  acronym: 'RQ',
  name: 'Relationship Questionnaire',
  author: 'Bartholomew & Horowitz (1991)',
  source: 'Uso libero',
  description: 'Autovalutazione rapida dello stile di attaccamento adulto secondo il modello a quattro categorie (sicuro, timoroso, preoccupato, distanziante).',
  population: 'Adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Attaccamento e relazioni'],
  viz: { poles: {
    sicuro: ['Non mi descrive', 'Mi descrive molto', 1, 7],
    timoroso: ['Non mi descrive', 'Mi descrive molto', 1, 7],
    preoccupato: ['Non mi descrive', 'Mi descrive molto', 1, 7],
    distanziante: ['Non mi descrive', 'Mi descrive molto', 1, 7],
  } },
  defaultOptions: A7,
  sections: [
    {
      id: 'rating', title: 'Quanto ti descrive ciascuno stile',
      note: 'Valuta quanto ciascuna descrizione corrisponde al tuo modo generale di vivere le relazioni strette.',
      items: RQ_TEXTS.map((text, i) => ({ id: `stile${i + 1}`, text, type: 'likert' as const })),
    },
    {
      id: 'scelta', title: 'Scelta categoriale',
      items: [{
        id: 'best', text: 'Quale descrizione ti rappresenta meglio nel complesso?', type: 'single',
        options: [
          { value: 1, label: 'A — Sicuro' }, { value: 2, label: 'B — Timoroso' },
          { value: 3, label: 'C — Preoccupato' }, { value: 4, label: 'D — Distanziante' },
        ],
      }],
    },
  ],
  scales: [
    { id: 'sicuro', name: 'Sicuro (1-7)', items: ['stile1'], compute: 'sum' },
    { id: 'timoroso', name: 'Timoroso (1-7)', items: ['stile2'], compute: 'sum' },
    { id: 'preoccupato', name: 'Preoccupato (1-7)', items: ['stile3'], compute: 'sum' },
    { id: 'distanziante', name: 'Distanziante (1-7)', items: ['stile4'], compute: 'sum' },
  ],
  notes: 'Interpretazione: profilo dei quattro punteggi + scelta categoriale. Con i rating si possono derivare le dimensioni: Modello di sé = (A + D) − (B + C); Modello dell’altro = (A + C) − (B + D).',
};
