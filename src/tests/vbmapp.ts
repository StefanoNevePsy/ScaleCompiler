import type { Item, Option, Section, TestDefinition } from '../types';

// VB-MAPP — Verbal Behavior Milestones Assessment and Placement Program (M.L. Sundberg).
// Griglia di scoring digitale da usare INSIEME al protocollo ufficiale (di cui il centro è licenziatario):
// gli item riportano solo il codice del traguardo (es. "Mand 1-M3"); i criteri completi sono sul protocollo.

const MILESTONE: Option[] = [
  { value: 0, label: '0' },
  { value: 0.5, label: '½' },
  { value: 1, label: '1' },
];
const BARRIER: Option[] = [
  { value: 0, label: '0 — Nessun problema' },
  { value: 1, label: '1 — Lieve/occasionale' },
  { value: 2, label: '2 — Moderato' },
  { value: 3, label: '3 — Persistente' },
  { value: 4, label: '4 — Grave/pervasivo' },
];
const TRANS: Option[] = [1, 2, 3, 4, 5].map(v => ({ value: v, label: String(v) }));

const L1 = ['Mand', 'Tact', 'Ascoltatore (LR)', 'Percezione visiva/MTS', 'Gioco indipendente', 'Comportamento sociale', 'Imitazione motoria', 'Ecoico', 'Comportamento vocale spontaneo'];
const L2 = ['Mand', 'Tact', 'Ascoltatore (LR)', 'Percezione visiva/MTS', 'Gioco indipendente', 'Comportamento sociale', 'Imitazione motoria', 'Ecoico', 'LRFFC', 'Intraverbale', 'Routine di classe/gruppo', 'Struttura linguistica'];
const L3 = ['Mand', 'Tact', 'Ascoltatore (LR)', 'Percezione visiva/MTS', 'Gioco indipendente', 'Comportamento sociale', 'Lettura', 'Scrittura', 'LRFFC', 'Intraverbale', 'Routine di classe/gruppo', 'Struttura linguistica', 'Matematica'];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

function levelSection(level: 1 | 2 | 3, domains: string[]): Section {
  const items: Item[] = domains.flatMap(d =>
    [1, 2, 3, 4, 5].map(n => ({
      id: `l${level}-${slug(d)}-${n}`,
      text: `${d} ${level}-M${n}`,
      type: 'likert' as const,
      help: 'Criteri completi sul protocollo VB-MAPP',
    })),
  );
  return {
    id: `l${level}`,
    title: `Milestones — Livello ${level} (${level === 1 ? '0-18' : level === 2 ? '18-30' : '30-48'} mesi)`,
    note: 'Punteggio per traguardo: 0, ½ o 1 secondo i criteri del protocollo.',
    options: MILESTONE,
    items,
  };
}

const BARRIERS = [
  'Comportamenti problema', 'Controllo istruzionale (fuga/evitamento)', 'Mand assente o debole',
  'Tact assente o debole', 'Imitazione motoria assente o debole', 'Ecoico assente o debole',
  'Matching-to-sample (VP-MTS) assente o debole', 'Ripertorio di ascoltatore assente o debole',
  'Intraverbale assente o debole', 'Abilità sociali assenti o deboli', 'Dipendenza dai prompt',
  'Scrolling (rotazione di risposte)', 'Scanning visivo compromesso',
  'Discriminazioni condizionali compromesse', 'Mancata generalizzazione',
  'Operazioni motivative deboli o atipiche', 'La richiesta di risposta indebolisce la MO',
  'Dipendenza dal rinforzo', 'Autostimolazione', 'Problemi di articolazione',
  'Comportamento ossessivo-compulsivo', 'Iperattività', 'Mancato contatto oculare', 'Difese sensoriali',
];

const TRANSITIONS = [
  'Punteggio complessivo Milestones', 'Punteggio complessivo Barriere', 'Barriera: comportamenti problema',
  'Routine di classe e abilità di gruppo', 'Comportamento sociale e gioco sociale', 'Indipendenza accademica',
  'Generalizzazione', 'Varietà di rinforzatori', 'Velocità di acquisizione', 'Ritenzione',
  'Apprendimento in ambiente naturale', 'Transfer senza training', 'Adattabilità al cambiamento',
  'Spontaneità', 'Gioco indipendente', 'Autonomie personali', 'Uso del bagno', 'Alimentazione',
];

export const vbmapp: TestDefinition = {
  id: 'vb-mapp',
  acronym: 'VB-MAPP',
  name: 'Verbal Behavior Milestones Assessment and Placement Program',
  author: 'Mark L. Sundberg',
  source: 'AVB Press — richiede il protocollo ufficiale (licenza del centro)',
  description: 'Valutazione del comportamento verbale e delle abilità correlate basata su ABA/Skinner: 170 traguardi su 3 livelli evolutivi, 24 barriere all’apprendimento e 18 aree di valutazione della transizione.',
  population: 'Bambini con autismo o altri disturbi del neurosviluppo (riferimento evolutivo 0-48 mesi)',
  respondent: 'clinico',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Neurodivergenze', 'Età evolutiva'],
  sections: [
    levelSection(1, L1),
    levelSection(2, L2),
    levelSection(3, L3),
    {
      id: 'barriere', title: 'Valutazione delle barriere',
      note: 'Punteggio 0-4 per ciascuna barriera secondo i criteri del protocollo.',
      options: BARRIER,
      items: BARRIERS.map((t, i) => ({ id: `bar-${i + 1}`, text: `${i + 1}. ${t}`, type: 'likert' as const })),
    },
    {
      id: 'transizione', title: 'Valutazione della transizione',
      note: 'Punteggio 1-5 per area secondo i criteri del protocollo.',
      options: TRANS,
      items: TRANSITIONS.map((t, i) => ({ id: `tr-${i + 1}`, text: `${i + 1}. ${t}`, type: 'likert' as const })),
    },
  ],
  scales: [
    { id: 'l1', name: 'Milestones Livello 1 (0-45)', items: L1.map((d, _i) => `l1-${slug(d)}-`).flatMap(p => [1,2,3,4,5].map(n => p + n)), compute: 'sum', decimals: 1 },
    { id: 'l2', name: 'Milestones Livello 2 (0-60)', items: L2.map(d => `l2-${slug(d)}-`).flatMap(p => [1,2,3,4,5].map(n => p + n)), compute: 'sum', decimals: 1 },
    { id: 'l3', name: 'Milestones Livello 3 (0-65)', items: L3.map(d => `l3-${slug(d)}-`).flatMap(p => [1,2,3,4,5].map(n => p + n)), compute: 'sum', decimals: 1 },
    { id: 'milestones-tot', name: 'Milestones — Totale (0-170)', items: [...L1.map(d => `l1-${slug(d)}-`), ...L2.map(d => `l2-${slug(d)}-`), ...L3.map(d => `l3-${slug(d)}-`)].flatMap(p => [1,2,3,4,5].map(n => p + n)), compute: 'sum', decimals: 1 },
    { id: 'barriere-tot', name: 'Barriere — Totale (0-96)', items: BARRIERS.map((_, i) => `bar-${i + 1}`), compute: 'sum' },
    { id: 'transizione-tot', name: 'Transizione — Totale (18-90)', items: TRANSITIONS.map((_, i) => `tr-${i + 1}`), compute: 'sum' },
  ],
  notes: 'Griglia di scoring: compilare seguendo i criteri del protocollo ufficiale VB-MAPP (Milestones/Barriers/Transition). Le somministrazioni ripetute (colonne colorate del protocollo cartaceo) corrispondono qui a somministrazioni successive, confrontabili nella vista Andamento. Per aggiungere i testi integrali dei traguardi dal proprio protocollo usare l’editor o "Importa da manuale (IA)". Sezioni EESA (ecoico) e analisi per dominio: fare riferimento al protocollo.',
};
