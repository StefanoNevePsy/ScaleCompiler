import type { Option, TestDefinition } from '../types';

// CANS — Child and Adolescent Needs and Strengths (Lyons, Praed Foundation).
// Strumento open (licenza gratuita previa formazione/certificazione). Gli item variano tra
// giurisdizioni/versioni: qui è riportato il set "comprehensive" standard — allineare al
// proprio manuale con l'editor o con "Importa da manuale (IA)".

const NEED: Option[] = [
  { value: 0, label: '0 — Nessuna evidenza di bisogno' },
  { value: 1, label: '1 — Osservare/monitorare' },
  { value: 2, label: '2 — Azione necessaria' },
  { value: 3, label: '3 — Azione immediata/intensiva' },
];
const STRENGTH: Option[] = [
  { value: 0, label: '0 — Forza centrale (utilizzabile nel piano)' },
  { value: 1, label: '1 — Forza utile' },
  { value: 2, label: '2 — Forza identificata da costruire' },
  { value: 3, label: '3 — Nessuna forza identificata' },
];

const mk = (prefix: string, names: string[]) =>
  names.map((n, i) => ({ id: `${prefix}${i + 1}`, text: n, type: 'likert' as const }));

const NOTES = 'Il CANS non produce un punteggio totale clinico: l’unità di lettura è il singolo item. Item ≥2 = bisogno "attuabile" da inserire nel piano; sulle Forze, 0–1 = forza utilizzabile nel piano. I conteggi per dominio servono al monitoraggio nel tempo. Richiede certificazione annuale (Praed Foundation/TCOM). Set di item da allineare alla versione/manuale in uso tramite "Importa da manuale (IA)".';

function scales(sections: { id: string; title: string; items: { id: string }[] }[], strengthsId: string) {
  return sections.map(s => ({
    id: `att-${s.id}`,
    name: s.id === strengthsId ? `${s.title} — n. forze assenti/da costruire (≥2)` : `${s.title} — n. bisogni attuabili (≥2)`,
    items: s.items.map(i => i.id),
    compute: 'count_gte' as const,
    threshold: 2,
  }));
}

// ---------- CANS 5-17+ ----------

const s517 = [
  { id: 'vita', title: 'Funzionamento di vita', options: NEED, items: mk('lf', [
    'Famiglia', 'Situazione abitativa', 'Funzionamento sociale', 'Ricreazione/tempo libero',
    'Sviluppo/funzionamento intellettivo', 'Comunicazione', 'Lavoro', 'Situazione legale',
    'Salute fisica/medica', 'Sviluppo sessuale', 'Sonno', 'Comportamento a scuola',
    'Rendimento scolastico', 'Frequenza scolastica',
  ]) },
  { id: 'forze', title: 'Punti di forza', options: STRENGTH, items: mk('st', [
    'Famiglia', 'Relazioni interpersonali', 'Ottimismo', 'Ambito educativo', 'Ambito vocazionale',
    'Talenti e interessi', 'Spiritualità/religiosità', 'Vita di comunità', 'Stabilità delle relazioni', 'Resilienza',
  ]) },
  { id: 'bisogni', title: 'Bisogni comportamentali/emotivi', options: NEED, items: mk('be', [
    'Psicosi', 'Impulsività/iperattività', 'Depressione', 'Ansia', 'Oppositività',
    'Disturbo della condotta', 'Adattamento al trauma', 'Controllo della rabbia', 'Uso di sostanze',
  ]) },
  { id: 'rischi', title: 'Comportamenti a rischio', options: NEED, items: mk('rb', [
    'Rischio suicidario', 'Autolesionismo non suicidario', 'Altri comportamenti autolesivi',
    'Pericolosità verso altri', 'Fuga/allontanamento', 'Aggressività sessuale', 'Condotte delinquenziali', 'Piromania',
  ]) },
  { id: 'caregiver', title: 'Bisogni del caregiver', options: NEED, items: mk('cg', [
    'Supervisione', 'Coinvolgimento nelle cure', 'Conoscenza dei bisogni del minore', 'Organizzazione',
    'Risorse sociali', 'Stabilità abitativa', 'Salute fisica', 'Salute mentale', 'Uso di sostanze',
    'Bisogni evolutivi', 'Sicurezza',
  ]) },
];

export const cans517: TestDefinition = {
  id: 'cans-5-17',
  acronym: 'CANS 5-17+',
  name: 'Child and Adolescent Needs and Strengths — Comprehensive (5-17+)',
  author: 'J.S. Lyons — Praed Foundation / TCOM',
  source: 'Praed Foundation (open, richiede certificazione)',
  description: 'Strumento di communimetria per la pianificazione condivisa del trattamento e il monitoraggio degli esiti: bisogni e forze del minore e del caregiver valutati su livelli di azione (0–3).',
  population: 'Bambini e adolescenti 5-17+ anni',
  timeframe: 'Ultimi 30 giorni (salvo diversa indicazione del manuale)',
  respondent: 'clinico',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Età evolutiva', 'Esito e monitoraggio'],
  sections: s517,
  scales: scales(s517, 'forze'),
  notes: NOTES,
};

// ---------- CANS 0-5 (Early Childhood) ----------

const s05 = [
  { id: 'vita', title: 'Funzionamento di vita', options: NEED, items: mk('lf', [
    'Famiglia', 'Situazione abitativa', 'Sviluppo motorio', 'Funzionamento sensoriale',
    'Comunicazione', 'Sviluppo cognitivo', 'Salute fisica/medica', 'Sonno', 'Alimentazione',
    'Nido/scuola dell’infanzia', 'Funzionamento socio-emotivo', 'Gioco',
  ]) },
  { id: 'forze', title: 'Punti di forza', options: STRENGTH, items: mk('st', [
    'Famiglia', 'Relazioni interpersonali', 'Curiosità', 'Adattabilità', 'Persistenza', 'Vita di comunità',
  ]) },
  { id: 'bisogni', title: 'Bisogni comportamentali/emotivi', options: NEED, items: mk('be', [
    'Attaccamento', 'Adattamento al trauma', 'Regolazione (emotiva e degli impulsi)',
    'Comportamenti atipici', 'Ansia/paure', 'Umore depresso/ritiro', 'Oppositività/aggressività',
  ]) },
  { id: 'rischi', title: 'Fattori di rischio', options: NEED, items: mk('rb', [
    'Comportamenti pericolosi per sé', 'Nascita a rischio/prematurità', 'Esposizione prenatale a sostanze',
    'Maltrattamento/trascuratezza', 'Instabilità del caregiving',
  ]) },
  { id: 'caregiver', title: 'Bisogni del caregiver', options: NEED, items: mk('cg', [
    'Supervisione', 'Coinvolgimento nelle cure', 'Conoscenza dei bisogni del bambino', 'Organizzazione',
    'Risorse sociali', 'Stabilità abitativa', 'Salute fisica', 'Salute mentale', 'Uso di sostanze', 'Sicurezza',
  ]) },
];

export const cans05: TestDefinition = {
  id: 'cans-0-5',
  acronym: 'CANS 0-5',
  name: 'Child and Adolescent Needs and Strengths — Early Childhood (0-5)',
  author: 'J.S. Lyons — Praed Foundation / TCOM',
  source: 'Praed Foundation (open, richiede certificazione)',
  description: 'Versione prima infanzia del CANS: bisogni e forze del bambino 0-5 e del caregiver su livelli di azione (0–3), per pianificazione e monitoraggio.',
  population: 'Bambini 0-5 anni',
  timeframe: 'Ultimi 30 giorni (salvo diversa indicazione del manuale)',
  respondent: 'clinico',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Età evolutiva', 'Esito e monitoraggio'],
  sections: s05,
  scales: scales(s05, 'forze'),
  notes: NOTES,
};
