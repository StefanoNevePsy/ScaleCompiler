import type { TestDefinition } from '../types';

// Benessere, stress percepito e screening del distress — strumenti free-to-use.

const li = (prefix: string, texts: string[], reverse: number[] = []) =>
  texts.map((text, i) => ({
    id: `${prefix}${i + 1}`, text: `${i + 1}. ${text}`, type: 'likert' as const,
    reverse: reverse.includes(i + 1) || undefined,
  }));

export const who5: TestDefinition = {
  id: 'who-5',
  acronym: 'WHO-5',
  name: 'WHO-5 Well-Being Index',
  author: 'Organizzazione Mondiale della Sanità (1998)',
  source: 'OMS — uso libero',
  description: 'Indice breve di benessere soggettivo; usato anche come screening indiretto della depressione.',
  population: 'Adulti e adolescenti (9+)',
  timeframe: 'Ultime 2 settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Benessere e qualità di vita', 'Screening generale'],
  defaultOptions: [
    { value: 5, label: 'Tutto il tempo' }, { value: 4, label: 'La maggior parte del tempo' },
    { value: 3, label: 'Più della metà del tempo' }, { value: 2, label: 'Meno della metà del tempo' },
    { value: 1, label: 'Ogni tanto' }, { value: 0, label: 'Mai' },
  ],
  sections: [{
    id: 'main', title: 'WHO-5',
    note: 'Indica per ciascuna affermazione come ti sei sentito/a nelle ultime 2 settimane.',
    items: li('q', [
      'Mi sono sentito/a allegro/a e di buon umore',
      'Mi sono sentito/a calmo/a e rilassato/a',
      'Mi sono sentito/a attivo/a e pieno/a di energia',
      'Mi sono svegliato/a sentendomi fresco/a e riposato/a',
      'La mia vita quotidiana è stata piena di cose che mi interessano',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Punteggio grezzo (0-25)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 12, label: 'Basso benessere (≤50%) — approfondire', severity: 2 },
    { min: 13, max: 25, label: 'Benessere adeguato', severity: 0 },
  ] }],
  notes: 'Punteggio percentuale = grezzo × 4 (0-100). ≤50 = basso benessere; ≤28 suggerisce possibile depressione (approfondire con PHQ-9 o colloquio).',
};

export const k10: TestDefinition = {
  id: 'k10',
  acronym: 'K10',
  name: 'Kessler Psychological Distress Scale',
  author: 'Kessler et al. (2002)',
  source: 'Uso libero',
  description: 'Distress psicologico aspecifico (ansia/depressione) nelle ultime 4 settimane.',
  population: 'Adulti',
  timeframe: 'Ultime 4 settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Screening generale', 'Ansia e stress'],
  defaultOptions: [
    { value: 1, label: 'Mai' }, { value: 2, label: 'Raramente' }, { value: 3, label: 'A volte' },
    { value: 4, label: 'Spesso' }, { value: 5, label: 'Sempre' },
  ],
  sections: [{
    id: 'main', title: 'K10',
    note: 'Nelle ultime 4 settimane, con quale frequenza ti è capitato di…',
    items: li('q', [
      'Sentirti stanco/a senza un buon motivo',
      'Sentirti nervoso/a',
      'Sentirti così nervoso/a che niente riusciva a calmarti',
      'Sentirti senza speranza',
      'Sentirti irrequieto/a o agitato/a',
      'Sentirti così irrequieto/a da non riuscire a stare fermo/a',
      'Sentirti depresso/a',
      'Sentire che ogni cosa era uno sforzo',
      'Sentirti così triste che niente riusciva a tirarti su',
      'Sentirti inutile',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (10-50)', items: ['*'], compute: 'sum', bands: [
    { min: 10, max: 19, label: 'Benessere / distress assente', severity: 0 },
    { min: 20, max: 24, label: 'Distress lieve', severity: 1 },
    { min: 25, max: 29, label: 'Distress moderato', severity: 2 },
    { min: 30, max: 50, label: 'Distress grave', severity: 3 },
  ] }],
};

export const swls: TestDefinition = {
  id: 'swls',
  acronym: 'SWLS',
  name: 'Satisfaction With Life Scale',
  author: 'Diener, Emmons, Larsen & Griffin (1985)',
  source: 'Uso libero con citazione',
  description: 'Soddisfazione globale per la propria vita (componente cognitiva del benessere soggettivo).',
  population: 'Adulti e adolescenti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Benessere e qualità di vita'],
  defaultOptions: [
    { value: 1, label: 'Fortemente in disaccordo' }, { value: 2, label: 'In disaccordo' },
    { value: 3, label: 'Leggermente in disaccordo' }, { value: 4, label: 'Né d’accordo né in disaccordo' },
    { value: 5, label: 'Leggermente d’accordo' }, { value: 6, label: 'D’accordo' }, { value: 7, label: 'Fortemente d’accordo' },
  ],
  sections: [{
    id: 'main', title: 'SWLS',
    items: li('q', [
      'Per molti aspetti la mia vita si avvicina al mio ideale',
      'Le condizioni della mia vita sono eccellenti',
      'Sono soddisfatto/a della mia vita',
      'Finora ho ottenuto le cose importanti che voglio dalla vita',
      'Se potessi rivivere la mia vita, non cambierei quasi nulla',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (5-35)', items: ['*'], compute: 'sum', bands: [
    { min: 5, max: 9, label: 'Estremamente insoddisfatto/a', severity: 3 },
    { min: 10, max: 14, label: 'Insoddisfatto/a', severity: 2 },
    { min: 15, max: 19, label: 'Leggermente insoddisfatto/a', severity: 1 },
    { min: 20, max: 20, label: 'Neutro', severity: 1 },
    { min: 21, max: 25, label: 'Leggermente soddisfatto/a', severity: 0 },
    { min: 26, max: 30, label: 'Soddisfatto/a', severity: 0 },
    { min: 31, max: 35, label: 'Estremamente soddisfatto/a', severity: 0 },
  ] }],
};

export const rosenberg: TestDefinition = {
  id: 'rses',
  acronym: 'RSES',
  name: 'Rosenberg Self-Esteem Scale',
  author: 'Rosenberg (1965)',
  source: 'Uso libero (con citazione; eredi Rosenberg)',
  description: 'Autostima globale.',
  population: 'Adolescenti e adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Benessere e qualità di vita', 'Personalità'],
  defaultOptions: [
    { value: 3, label: 'Fortemente d’accordo' }, { value: 2, label: 'D’accordo' },
    { value: 1, label: 'In disaccordo' }, { value: 0, label: 'Fortemente in disaccordo' },
  ],
  sections: [{
    id: 'main', title: 'RSES',
    items: li('q', [
      'Nel complesso sono soddisfatto/a di me stesso/a',
      'A volte penso di non valere niente',
      'Penso di avere un certo numero di buone qualità',
      'Sono capace di fare le cose bene come la maggior parte delle altre persone',
      'Sento di non avere molto di cui essere fiero/a',
      'A volte mi sento davvero inutile',
      'Sento di essere una persona di valore, almeno quanto gli altri',
      'Vorrei avere più rispetto per me stesso/a',
      'Tutto sommato tendo a considerarmi un/una fallito/a',
      'Ho un atteggiamento positivo verso me stesso/a',
    ], [2, 5, 6, 8, 9]),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-30)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 14, label: 'Autostima bassa', severity: 2 },
    { min: 15, max: 25, label: 'Range normale', severity: 0 },
    { min: 26, max: 30, label: 'Autostima elevata', severity: 0 },
  ] }],
  notes: 'Item 2, 5, 6, 8, 9 a punteggio invertito.',
};

export const pss10: TestDefinition = {
  id: 'pss-10',
  acronym: 'PSS-10',
  name: 'Perceived Stress Scale — 10',
  author: 'Cohen, Kamarck & Mermelstein (1983)',
  source: 'Uso libero per scopi educativi/di ricerca e attività senza fini di lucro',
  description: 'Stress percepito nell’ultimo mese: quanto le situazioni di vita vengono valutate come imprevedibili, incontrollabili e sovraccaricanti.',
  population: 'Adulti',
  timeframe: 'Ultimo mese',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Ansia e stress'],
  defaultOptions: [
    { value: 0, label: 'Mai' }, { value: 1, label: 'Quasi mai' }, { value: 2, label: 'A volte' },
    { value: 3, label: 'Abbastanza spesso' }, { value: 4, label: 'Molto spesso' },
  ],
  sections: [{
    id: 'main', title: 'PSS-10',
    note: 'Nell’ultimo mese, con quale frequenza…',
    items: li('q', [
      'Ti sei sentito/a turbato/a per qualcosa accaduto in modo inaspettato?',
      'Hai sentito di non riuscire a controllare le cose importanti della tua vita?',
      'Ti sei sentito/a nervoso/a o stressato/a?',
      'Ti sei sentito/a fiducioso/a nella tua capacità di gestire i tuoi problemi personali?',
      'Hai sentito che le cose stavano andando come volevi?',
      'Hai sentito di non riuscire a far fronte a tutte le cose che dovevi fare?',
      'Sei riuscito/a a controllare le irritazioni della tua vita?',
      'Hai sentito di avere tutto sotto controllo?',
      'Ti sei arrabbiato/a per cose fuori dal tuo controllo?',
      'Hai sentito che le difficoltà si stavano accumulando così tanto da non poterle superare?',
    ], [4, 5, 7, 8]),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-40)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 13, label: 'Stress percepito basso', severity: 0 },
    { min: 14, max: 26, label: 'Stress percepito moderato', severity: 1 },
    { min: 27, max: 40, label: 'Stress percepito alto', severity: 2 },
  ] }],
  notes: 'Item 4, 5, 7, 8 a punteggio invertito.',
};
