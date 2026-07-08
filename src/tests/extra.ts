import type { Option, TestDefinition } from '../types';

// Seconda tornata di strumenti free-to-use.

const YN: Option[] = [{ value: 1, label: 'Sì' }, { value: 0, label: 'No' }];
const li = (prefix: string, texts: string[], reverse: number[] = []) =>
  texts.map((text, i) => ({
    id: `${prefix}${i + 1}`, text: `${i + 1}. ${text}`, type: 'likert' as const,
    reverse: reverse.includes(i + 1) || undefined,
  }));

export const phq4: TestDefinition = {
  id: 'phq-4',
  acronym: 'PHQ-4',
  name: 'Patient Health Questionnaire — 4 (ansia + depressione ultrabreve)',
  author: 'Kroenke, Spitzer, Williams & Löwe (2009)',
  source: 'Pubblico dominio',
  description: 'Screening ultrabreve combinato: PHQ-2 (depressione) + GAD-2 (ansia).',
  population: 'Adulti e adolescenti',
  timeframe: 'Ultime 2 settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Screening generale', 'Depressione e umore', 'Ansia e stress'],
  defaultOptions: [
    { value: 0, label: 'Mai' }, { value: 1, label: 'Alcuni giorni' },
    { value: 2, label: 'Più della metà dei giorni' }, { value: 3, label: 'Quasi ogni giorno' },
  ],
  sections: [{
    id: 'main', title: 'PHQ-4',
    note: 'Nelle ultime 2 settimane, con quale frequenza ti hanno dato fastidio i seguenti problemi?',
    items: li('q', [
      'Sentirsi nervoso/a, ansioso/a o molto teso/a',
      'Non riuscire a smettere di preoccuparsi o a tenere sotto controllo le preoccupazioni',
      'Scarso interesse o piacere nel fare le cose',
      'Sentirsi giù, depresso/a o senza speranza',
    ]),
  }],
  scales: [
    { id: 'tot', name: 'Totale (0-12)', items: ['*'], compute: 'sum', bands: [
      { min: 0, max: 2, label: 'Nella norma', severity: 0 }, { min: 3, max: 5, label: 'Lieve', severity: 1 },
      { min: 6, max: 8, label: 'Moderato', severity: 2 }, { min: 9, max: 12, label: 'Grave', severity: 3 },
    ] },
    { id: 'ansia', name: 'GAD-2 — Ansia (0-6)', items: ['q1', 'q2'], compute: 'sum', bands: [
      { min: 0, max: 2, label: 'Negativo', severity: 0 }, { min: 3, max: 6, label: '≥3 — approfondire (GAD-7)', severity: 1 },
    ] },
    { id: 'depressione', name: 'PHQ-2 — Depressione (0-6)', items: ['q3', 'q4'], compute: 'sum', bands: [
      { min: 0, max: 2, label: 'Negativo', severity: 0 }, { min: 3, max: 6, label: '≥3 — approfondire (PHQ-9)', severity: 1 },
    ] },
  ],
};

export const core10: TestDefinition = {
  id: 'core-10',
  acronym: 'CORE-10',
  name: 'Clinical Outcomes in Routine Evaluation — 10',
  author: 'Barkham et al. (2013) — CORE System Trust',
  source: 'CORE System Trust — libero (riproduzione senza modifiche)',
  description: 'Versione breve del CORE-OM per screening e monitoraggio seduta per seduta.',
  population: 'Adulti',
  timeframe: 'Ultima settimana',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Esito e monitoraggio', 'Screening generale'],
  defaultOptions: [
    { value: 0, label: 'Per niente' }, { value: 1, label: 'Solo occasionalmente' }, { value: 2, label: 'Ogni tanto' },
    { value: 3, label: 'Spesso' }, { value: 4, label: 'Molto spesso o sempre' },
  ],
  sections: [{
    id: 'main', title: 'CORE-10',
    note: 'Nell’ultima settimana…',
    items: li('q', [
      'Mi sono sentito/a teso/a, ansioso/a o nervoso/a',
      'Ho sentito di avere qualcuno a cui rivolgermi nel momento del bisogno',
      'Mi sono sentito/a in grado di affrontare le difficoltà',
      'Parlare con le persone mi è sembrato troppo faticoso',
      'Ho provato panico o terrore',
      'Ho fatto piani per mettere fine alla mia vita',
      'Ho avuto difficoltà ad addormentarmi o a mantenere il sonno',
      'Mi sono sentito/a senza speranza, disperato/a',
      'Mi sono sentito/a infelice',
      'Immagini o ricordi indesiderati mi hanno turbato/a',
    ], [2, 3]),
  }],
  scales: [{ id: 'tot', name: 'Punteggio clinico (media × 10)', items: ['*'], compute: 'mean10', maxMissing: 1, decimals: 1, bands: [
    { min: 0, max: 4.9, label: 'Range sano', severity: 0 },
    { min: 5, max: 10.9, label: 'Livello basso', severity: 0 },
    { min: 11, max: 14.9, label: 'Lieve (cutoff clinico 11)', severity: 1 },
    { min: 15, max: 19.9, label: 'Moderato', severity: 2 },
    { min: 20, max: 24.9, label: 'Moderato-grave', severity: 2 },
    { min: 25, max: 40, label: 'Grave', severity: 3 },
  ] }],
  notes: 'Item 2 e 3 invertiti. Item 6 (rischio) positivo ⇒ approfondire. Cutoff clinico 11.',
};

const W9: Option[] = Array.from({ length: 9 }, (_, i) => ({
  value: i, label: i === 0 ? '0 — Per niente' : i === 8 ? '8 — Gravissimamente' : String(i),
}));

export const wsas: TestDefinition = {
  id: 'wsas',
  acronym: 'WSAS',
  name: 'Work and Social Adjustment Scale',
  author: 'Mundt, Marks, Shear & Greist (2002)',
  source: 'Riproduzione libera per uso clinico non commerciale (citare la fonte)',
  description: 'Compromissione funzionale attribuita al problema: lavoro, casa, socialità, svago, relazioni.',
  population: 'Adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Disabilità e funzionamento', 'Esito e monitoraggio'],
  defaultOptions: W9,
  sections: [{
    id: 'main', title: 'WSAS',
    note: 'Quanto il tuo problema compromette ciascuna area? (0 = per niente, 8 = gravissimamente)',
    items: li('q', [
      'La mia capacità di lavorare (o studiare)',
      'La gestione della casa (pulizie, spesa, bollette, cura dei figli…)',
      'Le mie attività sociali di svago (con altre persone)',
      'Le mie attività private di svago (da solo/a)',
      'La mia capacità di creare e mantenere relazioni strette',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-40)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 9, label: 'Compromissione subclinica', severity: 0 },
    { min: 10, max: 20, label: 'Compromissione significativa', severity: 1 },
    { min: 21, max: 40, label: 'Compromissione grave', severity: 2 },
  ] }],
};

const A7: Option[] = [
  { value: 1, label: '1 — Fortemente in disaccordo' }, { value: 2, label: '2' }, { value: 3, label: '3' },
  { value: 4, label: '4 — Neutro' }, { value: 5, label: '5' }, { value: 6, label: '6' }, { value: 7, label: '7 — Fortemente d’accordo' },
];

export const mspss: TestDefinition = {
  id: 'mspss',
  acronym: 'MSPSS',
  name: 'Multidimensional Scale of Perceived Social Support',
  author: 'Zimet et al. (1988)',
  source: 'Uso libero con citazione',
  description: 'Supporto sociale percepito da famiglia, amici e persona significativa.',
  population: 'Adolescenti e adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Attaccamento e relazioni', 'Benessere e qualità di vita'],
  defaultOptions: A7,
  sections: [{
    id: 'main', title: 'MSPSS',
    items: li('q', [
      'C’è una persona speciale che mi è vicina quando ho bisogno',
      'C’è una persona speciale con cui posso condividere gioie e dolori',
      'La mia famiglia cerca davvero di aiutarmi',
      'Ricevo dalla mia famiglia l’aiuto e il sostegno emotivo di cui ho bisogno',
      'Ho una persona speciale che è una vera fonte di conforto per me',
      'I miei amici cercano davvero di aiutarmi',
      'Posso contare sui miei amici quando le cose vanno male',
      'Posso parlare dei miei problemi con la mia famiglia',
      'Ho amici con cui posso condividere gioie e dolori',
      'C’è una persona speciale nella mia vita a cui importa dei miei sentimenti',
      'La mia famiglia è disponibile ad aiutarmi a prendere decisioni',
      'Posso parlare dei miei problemi con i miei amici',
    ]),
  }],
  scales: [
    { id: 'tot', name: 'Totale (media 1-7)', items: ['*'], compute: 'mean', decimals: 2, bands: [
      { min: 1, max: 2.9, label: 'Supporto percepito basso', severity: 2 },
      { min: 3, max: 5, label: 'Supporto percepito moderato', severity: 1 },
      { min: 5.01, max: 7, label: 'Supporto percepito alto', severity: 0 },
    ] },
    { id: 'fam', name: 'Famiglia (media)', items: ['q3','q4','q8','q11'], compute: 'mean', decimals: 2 },
    { id: 'ami', name: 'Amici (media)', items: ['q6','q7','q9','q12'], compute: 'mean', decimals: 2 },
    { id: 'spec', name: 'Persona significativa (media)', items: ['q1','q2','q5','q10'], compute: 'mean', decimals: 2 },
  ],
};

export const ucla3: TestDefinition = {
  id: 'ucla-3',
  acronym: 'UCLA-3',
  name: 'UCLA Loneliness Scale — 3 item',
  author: 'Hughes, Waite, Hawkley & Cacioppo (2004)',
  source: 'Uso libero',
  description: 'Screening ultrabreve della solitudine percepita.',
  population: 'Adulti (usata soprattutto con anziani)',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Attaccamento e relazioni', 'Screening generale'],
  defaultOptions: [
    { value: 1, label: 'Quasi mai' }, { value: 2, label: 'A volte' }, { value: 3, label: 'Spesso' },
  ],
  sections: [{
    id: 'main', title: 'UCLA-3',
    note: 'Con quale frequenza ti capita di…',
    items: li('q', [
      'Sentire che ti manca la compagnia?',
      'Sentirti escluso/a, lasciato/a fuori?',
      'Sentirti isolato/a dagli altri?',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (3-9)', items: ['*'], compute: 'sum', bands: [
    { min: 3, max: 5, label: 'Non solo/a', severity: 0 },
    { min: 6, max: 9, label: 'Solitudine percepita (≥6)', severity: 1 },
  ] }],
};

export const miniIpip: TestDefinition = {
  id: 'mini-ipip',
  acronym: 'Mini-IPIP',
  name: 'Mini-IPIP — Big Five (20 item)',
  author: 'Donnellan, Oswald, Baird & Lucas (2006) — item IPIP',
  source: 'IPIP — pubblico dominio',
  description: 'Misura breve dei cinque grandi fattori di personalità (non patologici).',
  population: 'Adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: false,
  categories: ['Personalità'],
  defaultOptions: [
    { value: 1, label: 'Molto in disaccordo' }, { value: 2, label: 'In disaccordo' }, { value: 3, label: 'Neutro' },
    { value: 4, label: 'D’accordo' }, { value: 5, label: 'Molto d’accordo' },
  ],
  sections: [{
    id: 'main', title: 'Mini-IPIP',
    note: 'Indica quanto ciascuna affermazione ti descrive.',
    items: li('q', [
      'Sono l’anima della festa',
      'Partecipo alle emozioni degli altri',
      'Faccio subito le faccende e i compiti',
      'Ho frequenti sbalzi d’umore',
      'Ho un’immaginazione vivida',
      'Parlo poco',
      'Non mi interessano i problemi degli altri',
      'Dimentico spesso di rimettere le cose al loro posto',
      'Sono rilassato/a la maggior parte del tempo',
      'Non mi interessano le idee astratte',
      'Parlo con molte persone diverse alle feste',
      'Sento le emozioni degli altri',
      'Mi piace l’ordine',
      'Mi agito facilmente',
      'Ho difficoltà a capire le idee astratte',
      'Tendo a restare in disparte',
      'Non sono veramente interessato/a agli altri',
      'Combino pasticci con le cose',
      'Raramente mi sento giù di morale',
      'Non ho una buona immaginazione',
    ], [6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20]),
  }],
  scales: [
    { id: 'e', name: 'Estroversione (4-20)', items: ['q1','q6','q11','q16'], compute: 'sum' },
    { id: 'a', name: 'Amicalità (4-20)', items: ['q2','q7','q12','q17'], compute: 'sum' },
    { id: 'c', name: 'Coscienziosità (4-20)', items: ['q3','q8','q13','q18'], compute: 'sum' },
    { id: 'n', name: 'Nevroticismo (4-20)', items: ['q4','q9','q14','q19'], compute: 'sum' },
    { id: 'i', name: 'Apertura/Immaginazione (4-20)', items: ['q5','q10','q15','q20'], compute: 'sum' },
  ],
  notes: 'Item invertiti: 6-10, 15-20 (tranne il 14). Punteggi descrittivi, senza cutoff clinici. Nota: per il Nevroticismo gli item 9 e 19 sono invertiti (rilassato, raramente giù).',
};

const P5: Option[] = [
  { value: 1, label: 'Per niente o molto poco' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Moderatamente' },
  { value: 4, label: 'Molto' }, { value: 5, label: 'Moltissimo' },
];

export const panas: TestDefinition = {
  id: 'panas',
  acronym: 'PANAS',
  name: 'Positive and Negative Affect Schedule',
  author: 'Watson, Clark & Tellegen (1988)',
  source: 'Uso libero per ricerca/clinica con citazione',
  description: 'Affettività positiva e negativa di stato o di tratto (adattare la consegna: "adesso", "ultima settimana" o "in generale").',
  population: 'Adulti',
  timeframe: 'Ultima settimana (modificabile)',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Benessere e qualità di vita', 'Depressione e umore'],
  defaultOptions: P5,
  sections: [{
    id: 'main', title: 'PANAS',
    note: 'Indica in che misura hai provato ciascuna emozione o sensazione.',
    items: li('q', [
      'Interessato/a', 'Angosciato/a', 'Eccitato/a, pieno/a di energia', 'Turbato/a', 'Forte',
      'Colpevole', 'Spaventato/a', 'Ostile', 'Entusiasta', 'Orgoglioso/a',
      'Irritabile', 'Vigile, attento/a', 'Pieno/a di vergogna', 'Ispirato/a', 'Nervoso/a',
      'Determinato/a', 'Concentrato/a', 'Agitato/a', 'Attivo/a', 'Impaurito/a',
    ]),
  }],
  scales: [
    { id: 'pa', name: 'Affetto positivo (10-50)', items: ['q1','q3','q5','q9','q10','q12','q14','q16','q17','q19'], compute: 'sum' },
    { id: 'na', name: 'Affetto negativo (10-50)', items: ['q2','q4','q6','q7','q8','q11','q13','q15','q18','q20'], compute: 'sum' },
  ],
};

export const flourishing: TestDefinition = {
  id: 'flourishing',
  acronym: 'FS',
  name: 'Flourishing Scale',
  author: 'Diener et al. (2010)',
  source: 'Uso libero con citazione',
  description: 'Benessere eudaimonico: relazioni, scopo, autostima, competenza, ottimismo.',
  population: 'Adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Benessere e qualità di vita'],
  defaultOptions: A7,
  sections: [{
    id: 'main', title: 'Flourishing Scale',
    items: li('q', [
      'Conduco una vita piena di scopo e significato',
      'Le mie relazioni sociali mi danno sostegno e gratificazione',
      'Sono impegnato/a e interessato/a nelle mie attività quotidiane',
      'Contribuisco attivamente alla felicità e al benessere degli altri',
      'Sono competente e capace nelle attività che sono importanti per me',
      'Sono una brava persona e vivo una vita buona',
      'Sono ottimista riguardo al mio futuro',
      'Le persone mi rispettano',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (8-56)', items: ['*'], compute: 'sum' }],
};

export const crafft: TestDefinition = {
  id: 'crafft',
  acronym: 'CRAFFT',
  name: 'CRAFFT — Screening sostanze adolescenti (parte B)',
  author: 'Knight et al. — CeASAR, Boston Children’s Hospital',
  source: 'Uso clinico libero (registrazione consigliata su crafft.org)',
  description: 'Screening di uso problematico di alcol e sostanze negli adolescenti.',
  population: 'Adolescenti 12-21 anni',
  timeframe: 'Ultimi 12 mesi',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Sostanze e dipendenze', 'Età evolutiva'],
  defaultOptions: YN,
  sections: [{
    id: 'main', title: 'CRAFFT — Parte B',
    items: [
      'Sei mai salito/a su un’auto (Car) guidata da qualcuno (te compreso/a) che aveva bevuto o fatto uso di sostanze?',
      'Usi mai alcol o sostanze per rilassarti (Relax), sentirti meglio con te stesso/a o inserirti nel gruppo?',
      'Usi mai alcol o sostanze mentre sei da solo/a (Alone)?',
      'Ti capita di dimenticare (Forget) cose fatte mentre usavi alcol o sostanze?',
      'Famiglia (Family) o amici ti hanno mai detto che dovresti ridurre il consumo?',
      'Ti sei mai messo/a nei guai (Trouble) mentre usavi alcol o sostanze?',
    ].map((text, i) => ({ id: `q${i + 1}`, text: `${i + 1}. ${text}`, type: 'yesno' as const, options: YN })),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-6)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 1, label: 'Basso rischio — counseling breve', severity: 0 },
    { min: 2, max: 6, label: '≥2 — alto rischio: valutazione approfondita', severity: 2 },
  ] }],
  notes: 'La parte A (frequenza d’uso negli ultimi 12 mesi) guida la somministrazione; qui è implementata la parte B (6 item CRAFFT).',
};

export const smfq: TestDefinition = {
  id: 'smfq',
  acronym: 'SMFQ',
  name: 'Short Mood and Feelings Questionnaire (bambino/adolescente)',
  author: 'Angold et al. (1995)',
  source: 'Uso libero per clinica e ricerca (Duke University)',
  description: 'Screening breve della depressione in età evolutiva (esiste anche la versione genitori).',
  population: 'Bambini e adolescenti 6-17 anni',
  timeframe: 'Ultime 2 settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Depressione e umore', 'Età evolutiva'],
  defaultOptions: [
    { value: 0, label: 'Non vero' }, { value: 1, label: 'A volte vero' }, { value: 2, label: 'Vero' },
  ],
  sections: [{
    id: 'main', title: 'SMFQ',
    note: 'Pensa a come ti sei sentito/a o hai agito nelle ultime due settimane.',
    items: li('q', [
      'Mi sono sentito/a infelice o triste',
      'Non mi sono divertito/a per niente',
      'Mi sono sentito/a così stanco/a che me ne stavo seduto/a senza fare nulla',
      'Ero molto irrequieto/a',
      'Ho sentito di non valere più niente',
      'Ho pianto molto',
      'Ho trovato difficile pensare o concentrarmi',
      'Mi sono odiato/a',
      'Ho pensato di essere un/una cattivo/a ragazzo/a',
      'Mi sono sentito/a solo/a',
      'Ho pensato che nessuno mi volesse davvero bene',
      'Ho pensato di non essere bravo/a come gli altri',
      'Ho sentito di fare tutto sbagliato',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-26)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 7, label: 'Sotto soglia', severity: 0 },
    { min: 8, max: 26, label: '≥8 — possibile depressione: approfondire', severity: 2 },
  ] }],
};

export const ari: TestDefinition = {
  id: 'ari',
  acronym: 'ARI',
  name: 'Affective Reactivity Index — irritabilità (bambino/adolescente)',
  author: 'Stringaris et al. (2012)',
  source: 'Uso libero',
  description: 'Irritabilità nell’ultimo semestre; versioni self-report e genitori con gli stessi item.',
  population: 'Bambini e adolescenti 6-17 anni',
  timeframe: 'Ultimi 6 mesi',
  respondent: 'paziente o genitore',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Età evolutiva'],
  defaultOptions: [
    { value: 0, label: 'Non vero' }, { value: 1, label: 'In parte vero' }, { value: 2, label: 'Decisamente vero' },
  ],
  sections: [{
    id: 'main', title: 'ARI',
    note: 'Negli ultimi 6 mesi…',
    items: [
      ...li('q', [
        'Si infastidisce facilmente (mi infastidisco facilmente)',
        'Spesso perde la calma',
        'Resta arrabbiato/a a lungo',
        'È arrabbiato/a per la maggior parte del tempo',
        'Si arrabbia spesso',
        'Perde la calma facilmente',
      ]),
      { id: 'q7', text: '7. Nel complesso, l’irritabilità gli/le causa problemi', type: 'likert' as const, optional: true },
    ],
  }],
  scales: [
    { id: 'tot', name: 'Totale irritabilità (item 1-6, 0-12)', items: ['q1','q2','q3','q4','q5','q6'], compute: 'sum' },
    { id: 'imp', name: 'Compromissione (item 7)', items: ['q7'], compute: 'sum' },
  ],
  notes: 'Il totale usa solo gli item 1-6; l’item 7 misura la compromissione. Adattare i pronomi alla versione (self o genitori).',
};

const D11: Option[] = Array.from({ length: 11 }, (_, i) => ({
  value: i, label: i === 0 ? '0 (molto male)' : i === 10 ? '10 (molto bene)' : String(i),
}));

export const ors: TestDefinition = {
  id: 'ors',
  acronym: 'ORS',
  name: 'Outcome Rating Scale (feedback di esito)',
  author: 'Miller & Duncan (2000)',
  source: 'Licenza individuale gratuita per clinici (registrazione su scottdmiller.com)',
  description: 'Monitoraggio di esito seduta per seduta su 4 aree (FIT — feedback-informed treatment). In originale è una scala visuo-analogica: qui 0-10.',
  population: 'Adulti (esistono CORS/YCORS per bambini)',
  timeframe: 'Ultima settimana',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Esito e monitoraggio'],
  defaultOptions: D11,
  sections: [{
    id: 'main', title: 'ORS',
    note: 'Pensando all’ultima settimana, come sono andate le cose in ciascuna area?',
    items: li('q', [
      'Individualmente (benessere personale)',
      'Nelle relazioni strette (famiglia, relazioni intime)',
      'Socialmente (lavoro, scuola, amicizie)',
      'Complessivamente (senso generale di benessere)',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-40)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 24, label: 'Sotto il cutoff clinico (25)', severity: 2 },
    { min: 25, max: 40, label: 'Range funzionale', severity: 0 },
  ] }],
  notes: 'Nell’originale ogni area è una linea di 10 cm; qui è resa come scala 0-10. Variazione affidabile ≈ 5 punti.',
};

export const srs: TestDefinition = {
  id: 'srs-seduta',
  acronym: 'SRS',
  name: 'Session Rating Scale (alleanza di seduta)',
  author: 'Miller, Duncan & Johnson (2002)',
  source: 'Licenza individuale gratuita per clinici (registrazione su scottdmiller.com)',
  description: 'Feedback sull’alleanza al termine di ogni seduta (FIT). In originale visuo-analogica: qui 0-10.',
  population: 'Adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Esito e monitoraggio'],
  defaultOptions: D11,
  sections: [{
    id: 'main', title: 'SRS',
    note: 'Pensando alla seduta di oggi…',
    items: li('q', [
      'Relazione: mi sono sentito/a ascoltato/a, capito/a e rispettato/a',
      'Obiettivi e temi: abbiamo lavorato e parlato di ciò di cui volevo occuparmi',
      'Approccio o metodo: l’approccio del terapeuta va bene per me',
      'Complessivamente: la seduta di oggi è andata bene per me',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-40)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 35, label: 'Sotto 36 — esplorare il feedback con il paziente', severity: 1 },
    { min: 36, max: 40, label: 'Alleanza buona', severity: 0 },
  ] }],
};
