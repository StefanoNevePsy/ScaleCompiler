import type { TestDefinition } from '../types';

// CORE-OM — Clinical Outcomes in Routine Evaluation - Outcome Measure (Evans et al., 2000; ad. it. Palmieri et al., 2009)
// Strumento free-to-use. Testi in italiano da verificare rispetto alla versione italiana ufficiale.

const O = [
  { value: 0, label: 'Per niente' },
  { value: 1, label: 'Solo occasionalmente' },
  { value: 2, label: 'Ogni tanto' },
  { value: 3, label: 'Spesso' },
  { value: 4, label: 'Molto spesso o sempre' },
];

const T: [number, string, boolean?][] = [
  [1, 'Mi sono sentito/a terribilmente solo/a e isolato/a'],
  [2, 'Mi sono sentito/a teso/a, ansioso/a o nervoso/a'],
  [3, 'Ho sentito di avere qualcuno a cui rivolgermi nel momento del bisogno', true],
  [4, 'Mi sono sentito/a bene con me stesso/a', true],
  [5, 'Mi sono sentito/a completamente privo/a di energie ed entusiasmo'],
  [6, 'Sono stato/a fisicamente violento/a verso altre persone'],
  [7, 'Mi sono sentito/a in grado di affrontare le difficoltà', true],
  [8, 'Sono stato/a disturbato/a da dolori o altri problemi fisici'],
  [9, 'Ho pensato di farmi del male'],
  [10, 'Parlare con le persone mi è sembrato troppo faticoso'],
  [11, 'La tensione e l’ansia mi hanno impedito di fare cose importanti'],
  [12, 'Sono stato/a contento/a delle cose che ho fatto', true],
  [13, 'Sono stato/a disturbato/a da pensieri e sentimenti indesiderati'],
  [14, 'Mi è venuto da piangere'],
  [15, 'Ho provato panico o terrore'],
  [16, 'Ho fatto piani per mettere fine alla mia vita'],
  [17, 'Mi sono sentito/a sopraffatto/a dai miei problemi'],
  [18, 'Ho avuto difficoltà ad addormentarmi o a mantenere il sonno'],
  [19, 'Ho provato calore o affetto per qualcuno', true],
  [20, 'Mi è stato impossibile mettere da parte i miei problemi'],
  [21, 'Sono stato/a in grado di fare la maggior parte delle cose che dovevo fare', true],
  [22, 'Ho minacciato o intimidito qualcuno'],
  [23, 'Mi sono sentito/a senza speranza, disperato/a'],
  [24, 'Ho pensato: "sarebbe meglio essere morto/a"'],
  [25, 'Mi sono sentito/a criticato/a da altre persone'],
  [26, 'Ho pensato di non avere amici'],
  [27, 'Mi sono sentito/a infelice'],
  [28, 'Immagini o ricordi indesiderati mi hanno turbato/a'],
  [29, 'Mi sono sentito/a irritabile in compagnia di altre persone'],
  [30, 'Ho pensato di essere la causa dei miei problemi e delle mie difficoltà'],
  [31, 'Mi sono sentito/a ottimista riguardo al mio futuro', true],
  [32, 'Ho ottenuto ciò che volevo', true],
  [33, 'Mi sono sentito/a umiliato/a o messo/a in imbarazzo da altre persone'],
  [34, 'Ho fatto del male a me stesso/a o ho messo seriamente a rischio la mia salute'],
];

const q = (n: number) => `q${n}`;
const ids = (nums: number[]) => nums.map(q);

const CLINICAL_BANDS = [
  { min: 0, max: 5.9, label: 'Range sano', severity: 0 as const },
  { min: 6, max: 9.9, label: 'Livello basso (non clinico)', severity: 0 as const },
  { min: 10, max: 14.9, label: 'Lieve (sopra cutoff clinico)', severity: 1 as const },
  { min: 15, max: 19.9, label: 'Moderato', severity: 2 as const },
  { min: 20, max: 24.9, label: 'Moderato-grave', severity: 2 as const },
  { min: 25, max: 40, label: 'Grave', severity: 3 as const },
];

export const coreOm: TestDefinition = {
  id: 'core-om',
  acronym: 'CORE-OM',
  name: 'Clinical Outcomes in Routine Evaluation — Outcome Measure',
  author: 'Evans, Mellor-Clark, Margison et al. (2000); ad. it. Palmieri, Evans et al. (2009)',
  source: 'CORE System Trust — strumento libero da licenza (riproduzione consentita senza modifiche)',
  description: 'Misura di esito panteorica a 34 item: benessere soggettivo, problemi/sintomi, funzionamento, rischio. Pensata per valutazione di esito di routine (inizio/fine terapia e monitoraggio).',
  population: 'Adulti (17+)',
  timeframe: 'Ultima settimana',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Esito e monitoraggio', 'Screening generale'],
  defaultOptions: O,
  sections: [
    {
      id: 'main',
      title: 'CORE-OM',
      note: 'Leggendo ogni frase, indichi con quale frequenza si è sentito/a così NELL’ULTIMA SETTIMANA.',
      items: T.map(([n, text, rev]) => ({ id: q(n), text: `${n}. ${text}`, type: 'likert' as const, reverse: rev })),
    },
  ],
  scales: [
    { id: 'tot', name: 'Punteggio clinico totale (media × 10)', items: ['*'], compute: 'mean10', maxMissing: 3, decimals: 1, bands: CLINICAL_BANDS },
    { id: 'tot-nr', name: 'Totale senza item di rischio', items: ids([1,2,3,4,5,7,8,10,11,12,13,14,15,17,18,19,20,21,23,25,26,27,28,29,30,31,32,33]), compute: 'mean10', maxMissing: 2, decimals: 1 },
    { id: 'benessere', name: 'Benessere soggettivo (W)', items: ids([4, 14, 17, 31]), compute: 'mean10', decimals: 1 },
    { id: 'problemi', name: 'Problemi/Sintomi (P)', items: ids([2, 5, 8, 11, 13, 15, 18, 20, 23, 27, 28, 30]), compute: 'mean10', maxMissing: 1, decimals: 1 },
    { id: 'funzionamento', name: 'Funzionamento (F)', items: ids([1, 3, 7, 10, 12, 19, 21, 25, 26, 29, 32, 33]), compute: 'mean10', maxMissing: 1, decimals: 1 },
    { id: 'rischio', name: 'Rischio (R)', items: ids([6, 9, 16, 22, 24, 34]), compute: 'mean10', decimals: 1, bands: [
      { min: 0, max: 0, label: 'Nessun rischio riferito', severity: 0 },
      { min: 0.1, max: 40, label: 'Rischio riferito — approfondire gli item', severity: 3 },
    ] },
  ],
  notes: 'Cutoff clinico totale ≈ 10 (media item × 10). Item a formulazione positiva (3, 4, 7, 12, 19, 21, 31, 32) a punteggio invertito. Fino a 3 item mancanti sul totale (1 per sottoscala P/F) come da manuale. Verificare testi e cutoff sulla versione italiana ufficiale (Palmieri et al., 2009) prima dell’uso clinico: usare "Importa da manuale (IA)" per sostituire i testi con quelli esatti.',
};
