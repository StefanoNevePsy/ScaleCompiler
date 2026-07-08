import type { Option, TestDefinition } from '../types';

// Depressione e umore — strumenti di pubblico dominio o free-to-use.
// Traduzioni italiane best-effort: stato "da_verificare" finché non confrontate con le versioni ufficiali.

const PHQ_O: Option[] = [
  { value: 0, label: 'Mai' },
  { value: 1, label: 'Alcuni giorni' },
  { value: 2, label: 'Più della metà dei giorni' },
  { value: 3, label: 'Quasi ogni giorno' },
];

const li = (prefix: string, texts: string[], opts?: { reverse?: number[] }) =>
  texts.map((text, i) => ({
    id: `${prefix}${i + 1}`, text: `${i + 1}. ${text}`, type: 'likert' as const,
    reverse: opts?.reverse?.includes(i + 1) || undefined,
  }));

export const phq9: TestDefinition = {
  id: 'phq-9',
  acronym: 'PHQ-9',
  name: 'Patient Health Questionnaire — 9',
  author: 'Kroenke, Spitzer & Williams (2001)',
  source: 'Pubblico dominio (Pfizer: nessuna autorizzazione necessaria)',
  description: 'Screening e misura di gravità della depressione basata sui 9 criteri DSM.',
  population: 'Adulti e adolescenti (12+)',
  timeframe: 'Ultime 2 settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Depressione e umore', 'Screening generale'],
  defaultOptions: PHQ_O,
  sections: [
    {
      id: 'main', title: 'PHQ-9',
      note: 'Nelle ultime 2 settimane, con quale frequenza ti hanno dato fastidio i seguenti problemi?',
      items: [
        ...li('q', [
          'Scarso interesse o piacere nel fare le cose',
          'Sentirsi giù, depresso/a o senza speranza',
          'Difficoltà ad addormentarsi o a dormire senza interruzioni, oppure dormire troppo',
          'Sentirsi stanco/a o avere poca energia',
          'Scarso appetito o mangiare troppo',
          'Avere una cattiva opinione di sé, sentirsi un/una fallito/a o aver deluso se stesso/a o la propria famiglia',
          'Difficoltà a concentrarsi, ad esempio nel leggere il giornale o guardare la televisione',
          'Muoversi o parlare così lentamente che gli altri possono essersene accorti; oppure, al contrario, essere così irrequieto/a da muoversi molto più del solito',
          'Pensare che sarebbe meglio essere morto/a o farsi del male in qualche modo',
        ]),
        {
          id: 'q10', type: 'single', optional: true,
          text: '10. Se hai indicato uno o più problemi, quanto questi hanno reso difficile lavorare, occuparti della casa o andare d’accordo con gli altri?',
          options: [
            { value: 0, label: 'Per nulla difficile' }, { value: 1, label: 'Un po’ difficile' },
            { value: 2, label: 'Molto difficile' }, { value: 3, label: 'Estremamente difficile' },
          ],
        },
      ],
    },
  ],
  scales: [
    { id: 'tot', name: 'Totale (0-27)', items: ['q1','q2','q3','q4','q5','q6','q7','q8','q9'], compute: 'sum', bands: [
      { min: 0, max: 4, label: 'Minima o assente', severity: 0 },
      { min: 5, max: 9, label: 'Lieve', severity: 1 },
      { min: 10, max: 14, label: 'Moderata', severity: 2 },
      { min: 15, max: 19, label: 'Moderatamente grave', severity: 2 },
      { min: 20, max: 27, label: 'Grave', severity: 3 },
    ] },
    { id: 'item9', name: 'Item 9 — ideazione (flag)', items: ['q9'], compute: 'sum', bands: [
      { min: 0, max: 0, label: 'Assente', severity: 0 },
      { min: 1, max: 3, label: 'Presente — approfondire il rischio', severity: 3 },
    ] },
  ],
  info: `SCORING: somma item 1-9 (0-27). Fasce: 0-4 minima, 5-9 lieve, 10-14 moderata, 15-19 moderatamente grave, 20-27 grave.
USO CLINICO: ≥10 = screening positivo (sensibilità e specificità ≈88% per depressione maggiore). Algoritmo diagnostico alternativo: item 1 o 2 ≥2 più ≥5 item ≥2 (l'item 9 conta anche a 1).
MONITORAGGIO: riduzione ≥5 punti = risposta clinicamente rilevante; <5 = remissione.
SICUREZZA: item 9 >0 richiede sempre approfondimento del rischio suicidario nel colloquio.`,
  notes: 'Cutoff screening ≥10. L’item 10 (compromissione funzionale) non entra nel totale. Item 9 positivo ⇒ valutazione del rischio suicidario.',
};

export const gad7: TestDefinition = {
  id: 'gad-7',
  acronym: 'GAD-7',
  name: 'Generalized Anxiety Disorder — 7',
  author: 'Spitzer, Kroenke, Williams & Löwe (2006)',
  source: 'Pubblico dominio (Pfizer: nessuna autorizzazione necessaria)',
  description: 'Screening e misura di gravità dell’ansia (generalizzata, con buona sensibilità anche per panico e ansia sociale).',
  population: 'Adulti e adolescenti',
  timeframe: 'Ultime 2 settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Ansia e stress', 'Screening generale'],
  defaultOptions: PHQ_O,
  sections: [{
    id: 'main', title: 'GAD-7',
    note: 'Nelle ultime 2 settimane, con quale frequenza ti hanno dato fastidio i seguenti problemi?',
    items: li('q', [
      'Sentirsi nervoso/a, ansioso/a o molto teso/a',
      'Non riuscire a smettere di preoccuparsi o a tenere sotto controllo le preoccupazioni',
      'Preoccuparsi troppo per varie cose',
      'Avere difficoltà a rilassarsi',
      'Essere così irrequieto/a da far fatica a stare fermo/a',
      'Infastidirsi o irritarsi facilmente',
      'Avere paura che possa succedere qualcosa di terribile',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-21)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 4, label: 'Minima o assente', severity: 0 },
    { min: 5, max: 9, label: 'Lieve', severity: 1 },
    { min: 10, max: 14, label: 'Moderata', severity: 2 },
    { min: 15, max: 21, label: 'Grave', severity: 3 },
  ] }],
  notes: 'Cutoff screening ≥10.',
};

export const phq15: TestDefinition = {
  id: 'phq-15',
  acronym: 'PHQ-15',
  name: 'Patient Health Questionnaire — 15 (sintomi somatici)',
  author: 'Kroenke, Spitzer & Williams (2002)',
  source: 'Pubblico dominio',
  description: 'Gravità dei sintomi somatici e screening dei disturbi da sintomi somatici.',
  population: 'Adulti',
  timeframe: 'Ultime 4 settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Screening generale'],
  defaultOptions: [
    { value: 0, label: 'Nessun fastidio' }, { value: 1, label: 'Un po’ di fastidio' }, { value: 2, label: 'Molto fastidio' },
  ],
  sections: [{
    id: 'main', title: 'PHQ-15',
    note: 'Nelle ultime 4 settimane, quanto ti hanno dato fastidio i seguenti problemi?',
    items: li('q', [
      'Mal di stomaco', 'Mal di schiena', 'Dolore a braccia, gambe o articolazioni',
      'Dolori mestruali o altri problemi legati al ciclo (solo donne)', 'Mal di testa', 'Dolore al petto',
      'Vertigini o capogiri', 'Episodi di svenimento', 'Sentire il cuore battere forte o accelerato',
      'Respiro corto', 'Dolore o problemi durante i rapporti sessuali', 'Stitichezza, intestino irritabile o diarrea',
      'Nausea, gas intestinali o cattiva digestione', 'Sentirsi stanco/a o avere poca energia', 'Problemi di sonno',
    ]).map(i => (i.id === 'q4' ? { ...i, optional: true } : i)),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-30)', items: ['*'], compute: 'sum', maxMissing: 1, bands: [
    { min: 0, max: 4, label: 'Minima', severity: 0 },
    { min: 5, max: 9, label: 'Lieve', severity: 1 },
    { min: 10, max: 14, label: 'Media', severity: 2 },
    { min: 15, max: 30, label: 'Alta', severity: 3 },
  ] }],
  notes: 'L’item 4 si applica solo alle donne (negli uomini il totale si calcola su 14 item, proratato automaticamente).',
};

export const cesd: TestDefinition = {
  id: 'ces-d',
  acronym: 'CES-D',
  name: 'Center for Epidemiologic Studies — Depression Scale',
  author: 'Radloff (1977) — NIMH',
  source: 'Pubblico dominio',
  description: 'Sintomatologia depressiva nella settimana trascorsa; molto usata in ricerca ed epidemiologia.',
  population: 'Adulti e adolescenti',
  timeframe: 'Ultima settimana',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Depressione e umore'],
  defaultOptions: [
    { value: 0, label: 'Raramente o mai (meno di 1 giorno)' },
    { value: 1, label: 'Qualche volta (1-2 giorni)' },
    { value: 2, label: 'Abbastanza spesso (3-4 giorni)' },
    { value: 3, label: 'Quasi sempre (5-7 giorni)' },
  ],
  sections: [{
    id: 'main', title: 'CES-D',
    note: 'Indica con quale frequenza ti sei sentito/a o comportato/a così durante l’ultima settimana.',
    items: li('q', [
      'Mi hanno dato fastidio cose che di solito non mi infastidiscono',
      'Non avevo voglia di mangiare; avevo poco appetito',
      'Sentivo di non riuscire a scrollarmi di dosso la tristezza neanche con l’aiuto della famiglia o degli amici',
      'Sentivo di valere quanto gli altri',
      'Avevo difficoltà a concentrarmi su ciò che facevo',
      'Mi sentivo depresso/a',
      'Sentivo che ogni cosa mi costava fatica',
      'Mi sentivo fiducioso/a nel futuro',
      'Pensavo che la mia vita fosse stata un fallimento',
      'Mi sentivo impaurito/a',
      'Il mio sonno era agitato',
      'Ero felice',
      'Parlavo meno del solito',
      'Mi sentivo solo/a',
      'Le persone erano scortesi con me',
      'Mi godevo la vita',
      'Ho avuto crisi di pianto',
      'Mi sentivo triste',
      'Sentivo che non piacevo alla gente',
      'Non riuscivo a “ingranare”',
    ], { reverse: [4, 8, 12, 16] }),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-60)', items: ['*'], compute: 'sum', maxMissing: 4, bands: [
    { min: 0, max: 15, label: 'Sotto soglia', severity: 0 },
    { min: 16, max: 23, label: 'Sintomatologia lieve-moderata (≥ cutoff 16)', severity: 1 },
    { min: 24, max: 60, label: 'Sintomatologia rilevante', severity: 2 },
  ] }],
  notes: 'Item 4, 8, 12, 16 a punteggio invertito. Cutoff classico ≥16.',
};

const YN1 = [{ value: 1, label: 'Sì' }, { value: 0, label: 'No' }]; // sì = sintomo
const YN0 = [{ value: 0, label: 'Sì' }, { value: 1, label: 'No' }]; // no = sintomo (item positivi)

export const gds15: TestDefinition = {
  id: 'gds-15',
  acronym: 'GDS-15',
  name: 'Geriatric Depression Scale — forma breve',
  author: 'Sheikh & Yesavage (1986)',
  source: 'Pubblico dominio',
  description: 'Screening della depressione nell’anziano, formato sì/no.',
  population: 'Anziani (65+)',
  timeframe: 'Ultima settimana',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Depressione e umore'],
  sections: [{
    id: 'main', title: 'GDS-15',
    note: 'Rispondi sì o no pensando a come ti sei sentito/a nell’ultima settimana.',
    items: [
      ['È fondamentalmente soddisfatto/a della sua vita?', YN0],
      ['Ha abbandonato molte delle sue attività e dei suoi interessi?', YN1],
      ['Sente che la sua vita è vuota?', YN1],
      ['Si annoia spesso?', YN1],
      ['È di buon umore per la maggior parte del tempo?', YN0],
      ['Teme che le possa capitare qualcosa di brutto?', YN1],
      ['Si sente felice per la maggior parte del tempo?', YN0],
      ['Si sente spesso indifeso/a o abbandonato/a?', YN1],
      ['Preferisce stare a casa piuttosto che uscire e fare cose nuove?', YN1],
      ['Sente di avere più problemi di memoria della maggior parte delle persone?', YN1],
      ['Pensa che sia bello essere vivo/a adesso?', YN0],
      ['Si sente piuttosto inutile così com’è adesso?', YN1],
      ['Si sente pieno/a di energia?', YN0],
      ['Sente che la sua situazione sia senza speranza?', YN1],
      ['Pensa che la maggior parte delle persone stia meglio di lei?', YN1],
    ].map(([text, options], i) => ({
      id: `q${i + 1}`, text: `${i + 1}. ${text as string}`, type: 'single' as const, options: options as Option[],
    })),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-15)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 4, label: 'Nella norma', severity: 0 },
    { min: 5, max: 8, label: 'Depressione lieve', severity: 1 },
    { min: 9, max: 11, label: 'Depressione moderata', severity: 2 },
    { min: 12, max: 15, label: 'Depressione grave', severity: 3 },
  ] }],
  notes: 'Gli item a formulazione positiva (1, 5, 7, 11, 13) contano 1 punto se la risposta è «No».',
};

const EPDS_ITEMS: { text: string; opts: string[]; rev?: boolean }[] = [
  { text: 'Sono riuscita a ridere e a vedere il lato divertente delle cose', opts: ['Come sempre', 'Adesso non proprio come sempre', 'Adesso decisamente meno del solito', 'Per niente'] },
  { text: 'Ho guardato con gioia alle cose future', opts: ['Come ho sempre fatto', 'Un po’ meno del solito', 'Decisamente meno del solito', 'Quasi per niente'] },
  { text: 'Mi sono incolpata senza motivo quando le cose andavano male', opts: ['No, mai', 'Non molto spesso', 'Sì, qualche volta', 'Sì, la maggior parte delle volte'], rev: true },
  { text: 'Sono stata ansiosa o preoccupata senza un valido motivo', opts: ['No, per niente', 'Quasi mai', 'Sì, qualche volta', 'Sì, molto spesso'], rev: true },
  { text: 'Ho avuto paura o mi sono sentita nel panico senza un valido motivo', opts: ['No, per niente', 'No, non molto', 'Sì, qualche volta', 'Sì, moltissimo'], rev: true },
  { text: 'Mi sono sentita sommersa dalle cose', opts: ['No, ho affrontato le cose bene come sempre', 'No, la maggior parte delle volte ho affrontato le cose bene', 'Sì, qualche volta non sono riuscita ad affrontare le cose come al solito', 'Sì, la maggior parte delle volte non sono riuscita ad affrontare le cose'], rev: true },
  { text: 'Sono stata così infelice da avere difficoltà a dormire', opts: ['No, per niente', 'Non molto spesso', 'Sì, qualche volta', 'Sì, la maggior parte delle volte'], rev: true },
  { text: 'Mi sono sentita triste o infelice', opts: ['No, per niente', 'Non molto spesso', 'Sì, abbastanza spesso', 'Sì, la maggior parte delle volte'], rev: true },
  { text: 'Sono stata così infelice da piangere', opts: ['No, mai', 'Solo occasionalmente', 'Sì, abbastanza spesso', 'Sì, la maggior parte delle volte'], rev: true },
  { text: 'Ho pensato di farmi del male', opts: ['Mai', 'Quasi mai', 'Qualche volta', 'Sì, abbastanza spesso'], rev: true },
];

export const epds: TestDefinition = {
  id: 'epds',
  acronym: 'EPDS',
  name: 'Edinburgh Postnatal Depression Scale',
  author: 'Cox, Holden & Sagovsky (1987)',
  source: 'Uso libero con citazione della fonte (Br J Psychiatry, 150, 782-786)',
  description: 'Screening della depressione perinatale (gravidanza e post-partum).',
  population: 'Donne in gravidanza e nel post-partum',
  timeframe: 'Ultimi 7 giorni',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Depressione e umore', 'Perinatale'],
  sections: [{
    id: 'main', title: 'EPDS',
    note: 'Indica la risposta che più si avvicina a come ti sei sentita negli ultimi 7 giorni, non solo a come ti senti oggi.',
    items: EPDS_ITEMS.map((it, i) => ({
      id: `q${i + 1}`, text: `${i + 1}. ${it.text}`, type: 'single' as const,
      options: it.opts.map((label, j) => ({ value: j, label })),
    })),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-30)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 9, label: 'Sotto soglia', severity: 0 },
    { min: 10, max: 12, label: 'Possibile depressione — monitorare/rivalutare', severity: 1 },
    { min: 13, max: 30, label: 'Probabile depressione — approfondimento clinico', severity: 2 },
  ] }],
  info: `SOMMINISTRAZIONE: self-report, riferito agli ultimi 7 giorni; utilizzabile in gravidanza e nel post-partum (tipicamente 6-8 settimane). Non è uno strumento diagnostico: lo screening positivo va seguito da colloquio clinico.
SCORING: somma 0-30; ogni item 0-3 nell'ordine mostrato.
INTERPRETAZIONE: ≥10 possibile depressione (usato in molti programmi di screening), ≥13 probabile depressione; una variazione >4 punti tra somministrazioni è rilevante. Item 10 >0 = valutare subito il rischio autolesivo.`,
  notes: 'ATTENZIONE ALLO SCORING: nella versione originale gli item 3 e 5-10 sono a punteggio invertito (3-2-1-0); qui le opzioni sono già ordinate dal punteggio 0 al 3, MA VANNO VERIFICATE parola per parola sulla versione italiana validata prima dell’uso. Item 10 > 0 ⇒ valutare il rischio autolesivo. Cutoff comuni: ≥10 (screening), ≥13 (probabile depressione).',
};
