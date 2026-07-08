import type { Option, TestDefinition } from '../types';

// Altri strumenti free-to-use: personalità (PID-5-BF), sostanze (AUDIT, DAST-10),
// sonno (ISI), età evolutiva (PSC-35), ossessivo-compulsivo (OCI-R),
// alimentazione (SCOFF), rischio suicidario (ASQ), funzionamento (WHODAS 2.0).

const YN: Option[] = [{ value: 1, label: 'Sì' }, { value: 0, label: 'No' }];
const li = (prefix: string, texts: string[], start = 1) =>
  texts.map((text, i) => ({ id: `${prefix}${i + start}`, text: `${i + start}. ${text}`, type: 'likert' as const }));

export const pid5bf: TestDefinition = {
  id: 'pid-5-bf',
  acronym: 'PID-5-BF',
  name: 'Personality Inventory for DSM-5 — Brief Form (adulti)',
  author: 'Krueger, Derringer, Markon, Watson & Skodol — APA',
  source: 'APA — riproducibile per uso clinico e di ricerca senza autorizzazione',
  description: 'Screening dei cinque domini di tratto patologico del modello alternativo DSM-5: affettività negativa, distacco, antagonismo, disinibizione, psicoticismo.',
  population: 'Adulti (18+; esiste anche la forma 11-17)',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Personalità'],
  viz: { poles: {
    neg: ['Assente', 'Marcata', 0, 15],
    dist: ['Assente', 'Marcato', 0, 15],
    ant: ['Assente', 'Marcato', 0, 15],
    dis: ['Assente', 'Marcata', 0, 15],
    psi: ['Assente', 'Marcato', 0, 15],
  } },
  defaultOptions: [
    { value: 0, label: 'Sempre o spesso falso' }, { value: 1, label: 'Talvolta o abbastanza falso' },
    { value: 2, label: 'Talvolta o abbastanza vero' }, { value: 3, label: 'Sempre o spesso vero' },
  ],
  sections: [{
    id: 'main', title: 'PID-5-BF',
    note: 'Indica quanto ciascuna affermazione ti descrive in generale.',
    items: li('q', [
      'La gente mi descriverebbe come una persona spericolata',
      'Mi sembra di agire completamente d’impulso',
      'Anche se so che non dovrei, non riesco a smettere di prendere decisioni avventate',
      'Spesso sento che niente di ciò che faccio ha davvero importanza',
      'Gli altri mi considerano irresponsabile',
      'Non sono bravo/a a fare piani per il futuro',
      'I miei pensieri spesso non hanno senso per gli altri',
      'Mi preoccupo di quasi tutto',
      'Mi emoziono facilmente, spesso per motivi da poco',
      'Temo più di ogni altra cosa di restare solo/a nella vita',
      'Mi irrigidisco su un solo modo di fare le cose, anche quando è chiaro che non funziona',
      'Ho visto cose che in realtà non c’erano',
      'Sto alla larga dalle relazioni sentimentali',
      'Non mi interessa farmi degli amici',
      'Mi irrito facilmente per ogni genere di cosa',
      'Non mi piace entrare troppo in confidenza con le persone',
      'Non è un problema per me ferire i sentimenti degli altri',
      'Raramente mi entusiasmo per qualcosa',
      'Ho un forte bisogno di attenzione',
      'Mi capita spesso di avere a che fare con persone meno importanti di me',
      'Ho spesso pensieri che per me hanno senso ma che gli altri trovano strani',
      'Uso le persone per ottenere ciò che voglio',
      'Spesso mi "estraneo" e poi all’improvviso mi riprendo e mi accorgo che è passato molto tempo',
      'Le cose intorno a me spesso sembrano irreali, oppure più reali del solito',
      'Per me è facile approfittare degli altri',
    ]),
  }],
  scales: [
    { id: 'tot', name: 'Totale (0-75)', items: ['*'], compute: 'sum' },
    { id: 'neg', name: 'Affettività negativa (0-15)', items: ['q8','q9','q10','q11','q15'], compute: 'sum' },
    { id: 'dist', name: 'Distacco (0-15)', items: ['q4','q13','q14','q16','q18'], compute: 'sum' },
    { id: 'ant', name: 'Antagonismo (0-15)', items: ['q17','q19','q20','q22','q25'], compute: 'sum' },
    { id: 'dis', name: 'Disinibizione (0-15)', items: ['q1','q2','q3','q5','q6'], compute: 'sum' },
    { id: 'psi', name: 'Psicoticismo (0-15)', items: ['q7','q12','q21','q23','q24'], compute: 'sum' },
  ],
  notes: 'Non esistono cutoff ufficiali: si interpretano i domini più elevati (anche come media per dominio = somma/5). Assegnazione item→dominio secondo la chiave APA, da verificare sulla versione italiana (Fossati et al.).',
};

export const audit: TestDefinition = {
  id: 'audit',
  acronym: 'AUDIT',
  name: 'Alcohol Use Disorders Identification Test',
  author: 'Saunders, Babor et al. — OMS',
  source: 'OMS — uso libero',
  description: 'Screening del consumo problematico di alcol: consumo a rischio, dipendenza e danni correlati.',
  population: 'Adulti',
  timeframe: 'Ultimi 12 mesi',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Sostanze e dipendenze', 'Screening generale'],
  sections: [{
    id: 'main', title: 'AUDIT',
    items: [
      { id: 'q1', text: '1. Con quale frequenza consumi bevande alcoliche?', type: 'single' as const, options: [
        { value: 0, label: 'Mai' }, { value: 1, label: 'Una volta al mese o meno' }, { value: 2, label: '2-4 volte al mese' },
        { value: 3, label: '2-3 volte a settimana' }, { value: 4, label: '4 o più volte a settimana' }] },
      { id: 'q2', text: '2. Quante unità alcoliche consumi in un giorno tipico in cui bevi?', type: 'single' as const, options: [
        { value: 0, label: '1-2' }, { value: 1, label: '3-4' }, { value: 2, label: '5-6' }, { value: 3, label: '7-9' }, { value: 4, label: '10 o più' }] },
      ...[
        '3. Con quale frequenza consumi 6 o più unità in un’unica occasione?',
        '4. Nell’ultimo anno, con quale frequenza non sei riuscito/a a smettere di bere una volta iniziato?',
        '5. Nell’ultimo anno, con quale frequenza non sei riuscito/a a fare ciò che ci si aspettava da te a causa del bere?',
        '6. Nell’ultimo anno, con quale frequenza hai avuto bisogno di bere di prima mattina per rimetterti in sesto dopo una bevuta pesante?',
        '7. Nell’ultimo anno, con quale frequenza hai provato senso di colpa o rimorso dopo aver bevuto?',
        '8. Nell’ultimo anno, con quale frequenza non sei riuscito/a a ricordare cosa era successo la sera precedente a causa del bere?',
      ].map((text, i) => ({ id: `q${i + 3}`, text, type: 'single' as const, options: [
        { value: 0, label: 'Mai' }, { value: 1, label: 'Meno di una volta al mese' }, { value: 2, label: 'Una volta al mese' },
        { value: 3, label: 'Una volta a settimana' }, { value: 4, label: 'Ogni giorno o quasi' }] })),
      ...[
        '9. Tu o qualcun altro vi siete fatti male a causa del tuo bere?',
        '10. Un parente, un amico, un medico o un altro operatore sanitario si è preoccupato del tuo bere o ti ha suggerito di ridurlo?',
      ].map((text, i) => ({ id: `q${i + 9}`, text, type: 'single' as const, options: [
        { value: 0, label: 'No' }, { value: 2, label: 'Sì, ma non nell’ultimo anno' }, { value: 4, label: 'Sì, nell’ultimo anno' }] })),
    ],
  }],
  scales: [{ id: 'tot', name: 'Totale (0-40)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 7, label: 'Basso rischio', severity: 0 },
    { min: 8, max: 15, label: 'Consumo a rischio — consiglio breve', severity: 1 },
    { min: 16, max: 19, label: 'Consumo dannoso — counseling e monitoraggio', severity: 2 },
    { min: 20, max: 40, label: 'Possibile dipendenza — invio specialistico', severity: 3 },
  ] }],
  info: `SCORING: item 1-8 su 0-4; item 9-10 su 0/2/4. Totale 0-40.
INTERPRETAZIONE (OMS): 0-7 basso rischio; 8-15 consumo a rischio → consiglio breve; 16-19 consumo dannoso → counseling e monitoraggio; ≥20 possibile dipendenza → invio specialistico. Soglia ≥7 suggerita per donne e over 65.
SOTTODOMINI UTILI IN COLLOQUIO: item 1-3 consumo (AUDIT-C), 4-6 dipendenza, 7-10 conseguenze.`,
  notes: 'Cutoff standard ≥8 (alcune linee guida: ≥7 per donne e over 65).',
};

export const dast10: TestDefinition = {
  id: 'dast-10',
  acronym: 'DAST-10',
  name: 'Drug Abuse Screening Test — 10',
  author: 'Skinner (1982)',
  source: 'Uso clinico libero con citazione',
  description: 'Screening dell’uso problematico di sostanze (esclusi alcol e tabacco) negli ultimi 12 mesi.',
  population: 'Adulti e adolescenti',
  timeframe: 'Ultimi 12 mesi',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Sostanze e dipendenze', 'Screening generale'],
  defaultOptions: YN,
  sections: [{
    id: 'main', title: 'DAST-10',
    note: 'Le domande riguardano l’uso di droghe negli ultimi 12 mesi (esclusi alcol e tabacco).',
    items: [
      'Hai usato droghe diverse da quelle necessarie per motivi medici?',
      'Hai usato più di una droga alla volta?',
      'Riesci sempre a smettere di usare droghe quando vuoi?',
      'Hai avuto "blackout" o "flashback" a causa dell’uso di droghe?',
      'Ti sei mai sentito/a in colpa per il tuo uso di droghe?',
      'Il tuo/la tua partner (o i tuoi genitori) si sono lamentati del tuo coinvolgimento con le droghe?',
      'Hai trascurato la tua famiglia a causa dell’uso di droghe?',
      'Hai svolto attività illegali per procurarti droghe?',
      'Hai avuto sintomi di astinenza (malessere) quando hai smesso di assumere droghe?',
      'Hai avuto problemi medici a causa dell’uso di droghe (es. perdita di memoria, epatite, convulsioni, sanguinamenti)?',
    ].map((text, i) => ({
      id: `q${i + 1}`, text: `${i + 1}. ${text}`, type: 'single' as const,
      options: i === 2 ? [{ value: 0, label: 'Sì' }, { value: 1, label: 'No' }] : YN,
    })),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-10)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 0, label: 'Nessun problema riferito', severity: 0 },
    { min: 1, max: 2, label: 'Livello basso — monitorare', severity: 1 },
    { min: 3, max: 5, label: 'Livello moderato — approfondire', severity: 2 },
    { min: 6, max: 8, label: 'Livello sostanziale — valutazione intensiva', severity: 3 },
    { min: 9, max: 10, label: 'Livello grave — valutazione intensiva', severity: 3 },
  ] }],
  notes: 'Item 3 a punteggio invertito (il «No» vale 1 punto).',
};

export const isi: TestDefinition = {
  id: 'isi',
  acronym: 'ISI',
  name: 'Insomnia Severity Index',
  author: 'Morin (1993)',
  source: 'Gratuito per uso clinico individuale e ricerca non finanziata (licenza richiesta per usi commerciali)',
  description: 'Gravità percepita dell’insonnia nelle ultime 2 settimane.',
  population: 'Adulti',
  timeframe: 'Ultime 2 settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Sonno'],
  defaultOptions: [
    { value: 0, label: '0 — Per niente' }, { value: 1, label: '1 — Lieve' }, { value: 2, label: '2 — Moderato' },
    { value: 3, label: '3 — Grave' }, { value: 4, label: '4 — Molto grave' },
  ],
  sections: [{
    id: 'main', title: 'ISI',
    items: [
      { id: 'q1', text: '1. Gravità della difficoltà ad addormentarti', type: 'likert' as const },
      { id: 'q2', text: '2. Gravità della difficoltà a mantenere il sonno', type: 'likert' as const },
      { id: 'q3', text: '3. Gravità del problema di risveglio precoce', type: 'likert' as const },
      { id: 'q4', text: '4. Quanto sei soddisfatto/insoddisfatto del tuo attuale modo di dormire?', type: 'single' as const, options: [
        { value: 0, label: 'Molto soddisfatto/a' }, { value: 1, label: 'Soddisfatto/a' }, { value: 2, label: 'Né soddisfatto/a né insoddisfatto/a' },
        { value: 3, label: 'Insoddisfatto/a' }, { value: 4, label: 'Molto insoddisfatto/a' }] },
      { id: 'q5', text: '5. Quanto pensi che il tuo problema di sonno sia visibile agli altri in termini di peggioramento della qualità della tua vita?', type: 'likert' as const },
      { id: 'q6', text: '6. Quanto sei preoccupato/a per il tuo attuale problema di sonno?', type: 'likert' as const },
      { id: 'q7', text: '7. In che misura ritieni che il tuo problema di sonno interferisca con il funzionamento quotidiano (stanchezza, concentrazione, memoria, umore)?', type: 'likert' as const },
    ],
  }],
  scales: [{ id: 'tot', name: 'Totale (0-28)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 7, label: 'Insonnia clinicamente non significativa', severity: 0 },
    { min: 8, max: 14, label: 'Insonnia sottosoglia', severity: 1 },
    { min: 15, max: 21, label: 'Insonnia clinica moderata', severity: 2 },
    { min: 22, max: 28, label: 'Insonnia clinica grave', severity: 3 },
  ] }],
};

export const psc35: TestDefinition = {
  id: 'psc-35',
  acronym: 'PSC-35',
  name: 'Pediatric Symptom Checklist (genitori)',
  author: 'Jellinek & Murphy — Massachusetts General Hospital',
  source: 'Uso libero',
  description: 'Screening psicosociale generale del bambino/adolescente compilato dal genitore; sottoscale attenzione, internalizzante, esternalizzante.',
  population: 'Bambini e adolescenti 4-18 anni',
  respondent: 'genitore',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Età evolutiva', 'Screening generale'],
  defaultOptions: [
    { value: 0, label: 'Mai' }, { value: 1, label: 'A volte' }, { value: 2, label: 'Spesso' },
  ],
  sections: [{
    id: 'main', title: 'PSC-35',
    note: 'Indica con quale frequenza tuo/a figlio/a presenta ciascun comportamento.',
    items: li('q', [
      'Lamenta dolori e malesseri', 'Passa più tempo da solo/a', 'Si stanca facilmente, ha poca energia',
      'È irrequieto/a, incapace di stare fermo/a', 'Ha problemi con un insegnante', 'È meno interessato/a alla scuola',
      'Agisce come se fosse azionato/a da un motore', 'Sogna a occhi aperti troppo', 'Si distrae facilmente',
      'Ha paura di situazioni nuove', 'Si sente triste, infelice', 'È irritabile, arrabbiato/a',
      'Si sente senza speranza', 'Ha difficoltà a concentrarsi', 'È meno interessato/a agli amici',
      'Litiga con gli altri bambini', 'È assente da scuola', 'I voti scolastici stanno peggiorando',
      'Si svaluta, si critica', 'Va dal medico senza che venga trovato nulla', 'Ha problemi di sonno',
      'Si preoccupa molto', 'Vuole stare con te più di prima', 'Sente di essere cattivo/a',
      'Corre rischi inutili', 'Si fa male spesso', 'Sembra divertirsi meno',
      'Si comporta come se fosse più piccolo/a della sua età', 'Non rispetta le regole', 'Non mostra i suoi sentimenti',
      'Non capisce i sentimenti degli altri', 'Prende in giro gli altri', 'Dà la colpa agli altri per i suoi problemi',
      'Prende cose che non gli/le appartengono', 'Si rifiuta di condividere',
    ]),
  }],
  scales: [
    { id: 'tot', name: 'Totale (0-70)', items: ['*'], compute: 'sum', maxMissing: 3, bands: [
      { min: 0, max: 27, label: 'Sotto il cutoff (6-16 anni: 28)', severity: 0 },
      { min: 28, max: 70, label: 'Screening positivo — approfondire', severity: 2 },
    ] },
    { id: 'att', name: 'Attenzione (cutoff ≥7)', items: ['q4','q7','q8','q9','q14'], compute: 'sum' },
    { id: 'int', name: 'Internalizzante (cutoff ≥5)', items: ['q11','q13','q19','q22','q27'], compute: 'sum' },
    { id: 'est', name: 'Esternalizzante (cutoff ≥7)', items: ['q16','q29','q31','q32','q33','q34','q35'], compute: 'sum' },
  ],
  notes: 'Cutoff totale: 28 (6-16 anni), 24 (4-5 anni). Esiste anche la versione self-report (PSC-Y, 11+). Assegnazione item→sottoscale da verificare sulla chiave ufficiale MGH.',
};

export const ociR: TestDefinition = {
  id: 'oci-r',
  acronym: 'OCI-R',
  name: 'Obsessive-Compulsive Inventory — Revised',
  author: 'Foa et al. (2002)',
  source: 'Uso clinico/di ricerca libero con citazione',
  description: 'Sintomatologia ossessivo-compulsiva: lavaggio, controllo, ordine, ossessioni, accumulo, neutralizzazione.',
  population: 'Adulti e adolescenti',
  timeframe: 'Ultimo mese',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Ansia e stress'],
  defaultOptions: [
    { value: 0, label: 'Per niente' }, { value: 1, label: 'Un po’' }, { value: 2, label: 'Moderatamente' },
    { value: 3, label: 'Molto' }, { value: 4, label: 'Moltissimo' },
  ],
  sections: [{
    id: 'main', title: 'OCI-R',
    note: 'Quanto ti ha dato fastidio o disagio ciascuna esperienza nell’ultimo mese?',
    items: li('q', [
      'Conservo così tante cose che mi intralciano',
      'Controllo le cose più spesso del necessario',
      'Mi turba se gli oggetti non sono disposti nel modo giusto',
      'Mi sento obbligato/a a contare mentre faccio le cose',
      'Trovo difficile toccare un oggetto se so che è stato toccato da estranei o da certe persone',
      'Trovo difficile controllare i miei pensieri',
      'Colleziono cose di cui non ho bisogno',
      'Controllo ripetutamente porte, finestre, cassetti ecc.',
      'Mi turba se gli altri cambiano il modo in cui ho disposto le cose',
      'Sento di dover ripetere certi numeri',
      'A volte devo lavarmi o pulirmi semplicemente perché mi sento contaminato/a',
      'Mi turbano pensieri sgradevoli che mi vengono in mente contro la mia volontà',
      'Evito di buttare via le cose per paura di poterne avere bisogno in seguito',
      'Controllo ripetutamente rubinetti del gas e dell’acqua e interruttori della luce dopo averli chiusi/spenti',
      'Ho bisogno che le cose siano disposte secondo un certo ordine',
      'Sento che ci sono numeri buoni e numeri cattivi',
      'Mi lavo le mani più spesso e più a lungo del necessario',
      'Mi vengono spesso pensieri disgustosi e faccio fatica a liberarmene',
    ]),
  }],
  scales: [
    { id: 'tot', name: 'Totale (0-72)', items: ['*'], compute: 'sum', bands: [
      { min: 0, max: 20, label: 'Sotto il cutoff', severity: 0 },
      { min: 21, max: 72, label: '≥21 — probabile rilevanza clinica', severity: 2 },
    ] },
    { id: 'wash', name: 'Lavaggio', items: ['q5','q11','q17'], compute: 'sum' },
    { id: 'check', name: 'Controllo', items: ['q2','q8','q14'], compute: 'sum' },
    { id: 'ord', name: 'Ordine', items: ['q3','q9','q15'], compute: 'sum' },
    { id: 'obs', name: 'Ossessioni', items: ['q6','q12','q18'], compute: 'sum' },
    { id: 'hoard', name: 'Accumulo', items: ['q1','q7','q13'], compute: 'sum' },
    { id: 'neut', name: 'Neutralizzazione', items: ['q4','q10','q16'], compute: 'sum' },
  ],
};

export const scoff: TestDefinition = {
  id: 'scoff',
  acronym: 'SCOFF',
  name: 'SCOFF Questionnaire',
  author: 'Morgan, Reid & Lacey (1999)',
  source: 'Uso libero',
  description: 'Screening ultrabreve dei disturbi del comportamento alimentare.',
  population: 'Adolescenti e adulti',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Comportamento alimentare', 'Screening generale'],
  defaultOptions: YN,
  sections: [{
    id: 'main', title: 'SCOFF',
    items: [
      'Ti provochi il vomito perché ti senti spiacevolmente pieno/a?',
      'Ti preoccupa aver perso il controllo su quanto mangi?',
      'Hai perso di recente più di 6 kg in un periodo di 3 mesi?',
      'Ti consideri grasso/a anche se gli altri dicono che sei troppo magro/a?',
      'Diresti che il cibo domina la tua vita?',
    ].map((text, i) => ({ id: `q${i + 1}`, text: `${i + 1}. ${text}`, type: 'yesno' as const, options: YN })),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-5)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 1, label: 'Screening negativo', severity: 0 },
    { min: 2, max: 5, label: '≥2 — probabile DCA: approfondire', severity: 2 },
  ] }],
};

export const asq: TestDefinition = {
  id: 'asq',
  acronym: 'ASQ',
  name: 'Ask Suicide-Screening Questions',
  author: 'NIMH (Horowitz et al., 2012)',
  source: 'NIMH — pubblico dominio',
  description: 'Screening rapido del rischio suicidario (4 domande + 1 di acuzie).',
  population: 'Giovani e adulti (validato 10-24, usato anche in adulti)',
  timeframe: 'Ultime settimane',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Rischio suicidario', 'Screening generale'],
  defaultOptions: YN,
  sections: [
    {
      id: 'main', title: 'ASQ',
      items: [
        'Nelle ultime settimane, hai desiderato di essere morto/a?',
        'Nelle ultime settimane, hai pensato che tu o la tua famiglia stareste meglio se tu fossi morto/a?',
        'Nell’ultima settimana, hai avuto pensieri di ucciderti?',
        'Hai mai provato a ucciderti?',
      ].map((text, i) => ({ id: `q${i + 1}`, text: `${i + 1}. ${text}`, type: 'yesno' as const, options: YN })),
    },
    {
      id: 'acuity', title: 'Se ha risposto Sì a una qualsiasi delle precedenti',
      items: [{ id: 'q5', text: '5. Stai pensando di ucciderti adesso?', type: 'yesno' as const, options: YN, optional: true }],
    },
  ],
  scales: [
    { id: 'screen', name: 'Screening (item 1-4)', items: ['q1','q2','q3','q4'], compute: 'sum', bands: [
      { min: 0, max: 0, label: 'Negativo', severity: 0 },
      { min: 1, max: 4, label: 'POSITIVO — richiede valutazione breve del rischio', severity: 3 },
    ] },
    { id: 'acuto', name: 'Acuzie (item 5)', items: ['q5'], compute: 'sum', bands: [
      { min: 0, max: 0, label: 'Non acuto', severity: 0 },
      { min: 1, max: 1, label: 'ACUTO — valutazione di sicurezza immediata', severity: 3 },
    ] },
  ],
  info: `PROCEDURA ASQ (NIMH): somministrare gli item 1-4; se tutti "No" → screening negativo, stop. Se almeno un "Sì" → porre l'item 5 ("adesso?").
ITEM 5 SÌ = screening positivo ACUTO: il paziente non lascia il servizio senza valutazione completa di sicurezza immediata (mezzi, piano, supervisione).
ITEM 5 NO = positivo non acuto: valutazione breve del rischio (es. BSSA) per decidere il percorso.
Documentare sempre l'esito e il piano di sicurezza condiviso.`,
  notes: 'Qualsiasi «Sì» agli item 1-4 = screening positivo: somministrare l’item 5 e procedere secondo il percorso ASQ (valutazione breve del rischio; se item 5 positivo, presa in carico immediata e messa in sicurezza).',
};

export const whodas12: TestDefinition = {
  id: 'whodas-12',
  acronym: 'WHODAS 2.0',
  name: 'WHO Disability Assessment Schedule 2.0 — 12 item',
  author: 'Organizzazione Mondiale della Sanità',
  source: 'OMS — uso libero',
  description: 'Funzionamento e disabilità (allineato all’ICF) in 6 domini: cognizione, mobilità, cura di sé, relazioni, attività quotidiane, partecipazione. Adottato anche dal DSM-5.',
  population: 'Adulti (18+)',
  timeframe: 'Ultimi 30 giorni',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Disabilità e funzionamento'],
  defaultOptions: [
    { value: 0, label: 'Nessuna difficoltà' }, { value: 1, label: 'Lieve' }, { value: 2, label: 'Moderata' },
    { value: 3, label: 'Grave' }, { value: 4, label: 'Estrema / non riesco' },
  ],
  sections: [{
    id: 'main', title: 'WHODAS 2.0 (12 item)',
    note: 'Negli ultimi 30 giorni, quanta difficoltà hai avuto nel…',
    items: li('q', [
      'Stare in piedi per lunghi periodi (es. 30 minuti)?',
      'Occuparti delle tue responsabilità domestiche?',
      'Imparare un compito nuovo (es. arrivare in un posto nuovo)?',
      'Partecipare ad attività di comunità (feste, attività religiose o di altro tipo) come chiunque altro?',
      'Quanto sei stato/a emotivamente toccato/a dalle tue condizioni di salute?',
      'Concentrarti nel fare qualcosa per dieci minuti?',
      'Camminare per una lunga distanza (es. un chilometro)?',
      'Lavarti tutto il corpo?',
      'Vestirti?',
      'Avere a che fare con persone che non conosci?',
      'Mantenere un’amicizia?',
      'Svolgere il tuo lavoro quotidiano o studiare?',
    ]),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-48)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 9, label: 'Difficoltà assente/minima', severity: 0 },
    { min: 10, max: 19, label: 'Difficoltà lieve-moderata', severity: 1 },
    { min: 20, max: 48, label: 'Difficoltà rilevante', severity: 2 },
  ] }],
  notes: 'Scoring semplice (somma). L’OMS prevede anche uno scoring complesso (IRT) e norme percentili; le fasce qui indicate sono descrittive. Punteggio percentuale = somma/48 × 100.',
};
