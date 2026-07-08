import type { TestDefinition } from '../types';

// Definizioni in stato "bozza": contenitori pronti da completare con i materiali del centro
// (editor JSON o "Importa da manuale (IA)"). Non somministrabili finché in bozza.

const stub = (
  d: Pick<TestDefinition, 'id' | 'acronym' | 'name' | 'description' | 'population' | 'respondent' | 'author'> & Partial<TestDefinition>,
): TestDefinition => ({
  status: 'bozza',
  repeatable: true,
  sections: [{
    id: 'placeholder', title: 'Definizione da completare',
    items: [{ id: 'todo', text: 'Questa definizione è una bozza: caricare item e scoring dal manuale tramite "Importa da manuale (IA)" nella Libreria test.', type: 'text', optional: true }],
  }],
  scales: [],
  notes: 'Bozza: completare con item, opzioni di risposta, scale e cutoff dal manuale in possesso del centro.',
  ...d,
});

export const qbs = stub({
  id: 'qbs-8-18',
  acronym: 'QBS 8-18',
  name: 'QBS 8-18 — Questionari per la valutazione del benessere scolastico',
  author: 'Tobia & Marzocchi (Erickson)',
  description: 'Valutazione del benessere scolastico (versioni studente, genitori e insegnanti). Item protetti da copyright editoriale: inserirli dal manuale in possesso del centro.',
  population: 'Studenti 8-18 anni',
  respondent: 'paziente',
  categories: ['Scuola', 'Età evolutiva'],
});

export const crm = stub({
  id: 'crm',
  acronym: 'CRM',
  name: 'CRM (da completare: verificare lo strumento in uso nel centro)',
  description: 'Contenitore per lo strumento indicato come "CRM". Specificare denominazione completa, versione e manuale, poi completare con l’import IA.',
  respondent: 'clinico',
});

export const icfAdat = stub({
  id: 'icf-adat',
  acronym: 'ICF-ADAT',
  name: 'ICF-ADAT — Valutazione su base ICF',
  categories: ['Disabilità e funzionamento'],
  description: 'Strumento di valutazione del funzionamento su base ICF (attività/partecipazione, fattori ambientali). Completare con qualificatori, domini e item dalla versione in uso nel centro.',
  respondent: 'clinico',
});

export const wdms = stub({
  id: 'work-design-monitoring',
  acronym: 'WDMS',
  name: 'Work Design and Monitoring Sheet — Scheda di progettazione e monitoraggio del lavoro',
  categories: ['Pianificazione e lavoro'],
  description: 'Scheda di progettazione e monitoraggio degli obiettivi di lavoro. Completare con i campi della scheda in uso nel centro (obiettivi, criteri, monitoraggio).',
  respondent: 'clinico',
});
