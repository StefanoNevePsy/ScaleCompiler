import type { Option, TestDefinition } from '../types';

// Neurodivergenze — screening free-to-use (autismo, ADHD).

export const aq10: TestDefinition = {
  id: 'aq-10',
  acronym: 'AQ-10',
  name: 'Autism-Spectrum Quotient — 10 (adulti)',
  author: 'Allison, Auyeung & Baron-Cohen (2012) — Autism Research Centre, Cambridge',
  source: 'ARC — uso clinico/di ricerca libero; raccomandato dalle linee guida NICE',
  description: 'Screening rapido dei tratti autistici nell’adulto; punteggio ≥6 suggerisce l’invio a valutazione diagnostica specialistica.',
  population: 'Adulti (16+); esistono versioni bambino e adolescente',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: false,
  categories: ['Neurodivergenze', 'Screening generale'],
  sections: [{
    id: 'main', title: 'AQ-10',
    note: 'Indica quanto sei d’accordo con ciascuna affermazione.',
    items: ([
      ['Spesso noto piccoli suoni che gli altri non notano', true],
      ['Di solito mi concentro più sull’insieme che sui piccoli dettagli', false],
      ['Trovo facile fare più cose contemporaneamente', false],
      ['Se vengo interrotto/a, riesco a tornare molto rapidamente a ciò che stavo facendo', false],
      ['Trovo facile "leggere tra le righe" quando qualcuno mi parla', false],
      ['So capire se chi mi ascolta si sta annoiando', false],
      ['Quando leggo una storia trovo difficile capire le intenzioni dei personaggi', true],
      ['Mi piace raccogliere informazioni su categorie di cose (es. tipi di auto, di uccelli, di treni, di piante)', true],
      ['Trovo facile capire cosa qualcuno pensa o prova semplicemente guardandolo in viso', false],
      ['Trovo difficile capire le intenzioni delle persone', true],
    ] as [string, boolean][]).map(([text, agreeScores], i) => ({
      id: `q${i + 1}`, text: `${i + 1}. ${text}`, type: 'single' as const,
      options: [
        { value: agreeScores ? 1 : 0, label: 'Decisamente d’accordo' },
        { value: agreeScores ? 1 : 0, label: 'Abbastanza d’accordo' },
        { value: agreeScores ? 0 : 1, label: 'Abbastanza in disaccordo' },
        { value: agreeScores ? 0 : 1, label: 'Decisamente in disaccordo' },
      ],
    })),
  }],
  scales: [{ id: 'tot', name: 'Totale (0-10)', items: ['*'], compute: 'sum', bands: [
    { min: 0, max: 5, label: 'Sotto il cutoff', severity: 0 },
    { min: 6, max: 10, label: '≥6 — inviare a valutazione specialistica', severity: 2 },
  ] }],
  info: `SCORING: 1 punto per risposta nella direzione chiave — in accordo (decisamente o abbastanza) per gli item 1, 7, 8, 10; in disaccordo per 2, 3, 4, 5, 6, 9. Totale 0-10.
INTERPRETAZIONE: ≥6 = screening positivo secondo NICE → considerare invio a valutazione diagnostica specialistica per autismo.
LIMITI: lo screening non sostituisce la valutazione (ADOS/ADI-R, osservazione clinica); nei quadri con buon compenso (specie donne adulte) sono possibili falsi negativi.`,
  notes: 'Ogni item vale 1 punto nella direzione indicata dalla chiave (accordo per 1, 7, 8, 10; disaccordo per gli altri). ATTENZIONE: due opzioni condividono lo stesso punteggio, quindi il CSV item riporta il punteggio, non l’opzione esatta. Verificare chiave e testi sulla versione ufficiale ARC.',
};

// ASRS: parte A con punteggio binarizzato secondo le "caselle ombreggiate" ufficiali.
const FREQ = ['Mai', 'Raramente', 'A volte', 'Spesso', 'Molto spesso'];
const shaded = (from: number): Option[] => FREQ.map((label, i) => ({ value: i >= from ? 1 : 0, label }));
const RAW: Option[] = FREQ.map((label, i) => ({ value: i, label }));

export const asrs: TestDefinition = {
  id: 'asrs-v1-1',
  acronym: 'ASRS v1.1',
  name: 'Adult ADHD Self-Report Scale',
  author: 'Kessler et al. (2005) — OMS / Harvard',
  source: 'OMS — uso libero',
  description: 'Screening dell’ADHD nell’adulto secondo i criteri DSM: Parte A (screener a 6 item) e Parte B (12 item di approfondimento).',
  population: 'Adulti (18+)',
  timeframe: 'Ultimi 6 mesi',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: false,
  categories: ['Neurodivergenze', 'Screening generale'],
  sections: [
    {
      id: 'a', title: 'Parte A — Screener',
      note: 'Con quale frequenza, negli ultimi 6 mesi…',
      items: ([
        ['Hai difficoltà a completare i dettagli finali di un progetto, una volta superate le parti più impegnative?', 2],
        ['Hai difficoltà a mettere in ordine le cose quando devi svolgere un compito che richiede organizzazione?', 2],
        ['Hai problemi a ricordare appuntamenti o impegni?', 2],
        ['Quando hai un compito che richiede molta riflessione, eviti o rimandi l’inizio?', 3],
        ['Muovi nervosamente mani o piedi quando devi stare seduto/a a lungo?', 3],
        ['Ti senti eccessivamente attivo/a e spinto/a a fare cose, come se fossi azionato/a da un motore?', 3],
      ] as [string, number][]).map(([text, from], i) => ({
        id: `a${i + 1}`, text: `${i + 1}. ${text}`, type: 'single' as const, options: shaded(from),
      })),
    },
    {
      id: 'b', title: 'Parte B — Approfondimento',
      note: 'Con quale frequenza, negli ultimi 6 mesi…',
      options: RAW,
      items: [
        'Fai errori di distrazione quando lavori a un progetto noioso o difficile?',
        'Hai difficoltà a mantenere l’attenzione in un lavoro noioso o ripetitivo?',
        'Hai difficoltà a concentrarti su ciò che le persone ti dicono, anche quando ti parlano direttamente?',
        'Metti fuori posto o hai difficoltà a trovare le cose, a casa o al lavoro?',
        'Sei distratto/a da attività o rumori intorno a te?',
        'Lasci il tuo posto durante riunioni o situazioni in cui dovresti restare seduto/a?',
        'Ti senti irrequieto/a o agitato/a?',
        'Hai difficoltà a rilassarti e distenderti quando hai del tempo per te?',
        'Ti ritrovi a parlare troppo in situazioni sociali?',
        'Finisci le frasi delle persone con cui parli prima che possano finirle loro?',
        'Hai difficoltà ad aspettare il tuo turno quando è richiesto?',
        'Interrompi gli altri quando sono occupati?',
      ].map((text, i) => ({ id: `b${i + 7}`, text: `${i + 7}. ${text}`, type: 'likert' as const })),
    },
  ],
  scales: [
    { id: 'parte-a', name: 'Parte A — risposte significative (0-6)', items: ['a1','a2','a3','a4','a5','a6'], compute: 'sum', bands: [
      { min: 0, max: 3, label: 'Screening negativo', severity: 0 },
      { min: 4, max: 6, label: '≥4 — sintomi altamente compatibili con ADHD: approfondire', severity: 2 },
    ] },
    { id: 'parte-b', name: 'Parte B — gravità complessiva (0-48, informale)', items: ['b7','b8','b9','b10','b11','b12','b13','b14','b15','b16','b17','b18'], compute: 'sum' },
  ],
  info: `SCORING PARTE A (screener): 6 item con soglie "a caselle ombreggiate" — item 1-3 contano da «A volte», item 4-6 da «Spesso». ≥4 risposte significative = screening positivo, altamente compatibile con ADHD dell'adulto: procedere con valutazione clinica completa (anamnesi evolutiva, compromissione in più contesti, esclusione di altre cause).
PARTE B: approfondimento qualitativo dei 12 sintomi rimanenti; utile in colloquio, non ha cutoff.
NOTA: lo screening positivo NON è diagnosi; l'ADHD adulto richiede esordio nell'infanzia e compromissione attuale.`,
  notes: 'La Parte A usa lo scoring ufficiale a "caselle ombreggiate": item 1-3 contano da «A volte» in su, item 4-6 da «Spesso» in su. La Parte B è riportata come frequenza grezza (0-4) e serve da approfondimento qualitativo.',
};

const SNAP_O: Option[] = [
  { value: 0, label: 'Per niente' }, { value: 1, label: 'Solo un po’' },
  { value: 2, label: 'Abbastanza' }, { value: 3, label: 'Moltissimo' },
];

export const snap4: TestDefinition = {
  id: 'snap-iv-26',
  acronym: 'SNAP-IV',
  name: 'SNAP-IV 26 — Scala per ADHD e oppositività (genitori/insegnanti)',
  author: 'Swanson, Nolan & Pelham (versione MTA a 26 item)',
  source: 'Pubblico dominio',
  description: 'Valutazione dei sintomi ADHD (disattenzione, iperattività/impulsività) e oppositivo-provocatori nel bambino, compilata da genitori o insegnanti.',
  population: 'Bambini e adolescenti 6-18 anni',
  timeframe: 'Ultimo mese',
  respondent: 'genitore o insegnante',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Neurodivergenze', 'Età evolutiva'],
  defaultOptions: SNAP_O,
  sections: [
    {
      id: 'inatt', title: 'Disattenzione (1-9)',
      items: [
        'Non presta attenzione ai dettagli o fa errori di distrazione',
        'Ha difficoltà a mantenere l’attenzione su compiti o giochi',
        'Sembra non ascoltare quando gli/le si parla direttamente',
        'Non segue le istruzioni e non porta a termine compiti o doveri',
        'Ha difficoltà a organizzare compiti e attività',
        'Evita o è riluttante a impegnarsi in compiti che richiedono sforzo mentale prolungato',
        'Perde gli oggetti necessari per compiti o attività',
        'Si distrae facilmente per stimoli esterni',
        'È sbadato/a nelle attività quotidiane',
      ].map((t, i) => ({ id: `q${i + 1}`, text: `${i + 1}. ${t}`, type: 'likert' as const })),
    },
    {
      id: 'iper', title: 'Iperattività/Impulsività (10-18)',
      items: [
        'Muove con irrequietezza mani o piedi o si dimena sulla sedia',
        'Si alza dal posto quando dovrebbe restare seduto/a',
        'Corre o si arrampica in situazioni in cui non è appropriato',
        'Ha difficoltà a giocare o a dedicarsi ad attività di svago in modo tranquillo',
        'È "sotto pressione" o agisce come se fosse azionato/a da un motore',
        'Parla eccessivamente',
        '"Spara" le risposte prima che le domande siano completate',
        'Ha difficoltà ad attendere il proprio turno',
        'Interrompe gli altri o si intromette',
      ].map((t, i) => ({ id: `q${i + 10}`, text: `${i + 10}. ${t}`, type: 'likert' as const })),
    },
    {
      id: 'odd', title: 'Oppositività (19-26)',
      items: [
        'Va in collera',
        'Litiga con gli adulti',
        'Sfida attivamente o rifiuta di rispettare le richieste o le regole degli adulti',
        'Irrita deliberatamente le persone',
        'Accusa gli altri dei propri errori o comportamenti',
        'È suscettibile o facilmente irritato/a dagli altri',
        'È arrabbiato/a e rancoroso/a',
        'È dispettoso/a o vendicativo/a',
      ].map((t, i) => ({ id: `q${i + 19}`, text: `${i + 19}. ${t}`, type: 'likert' as const })),
    },
  ],
  scales: [
    { id: 'inatt', name: 'Disattenzione (media 0-3)', items: ['q1','q2','q3','q4','q5','q6','q7','q8','q9'], compute: 'mean', decimals: 2, bands: [
      { min: 0, max: 1.77, label: 'Sotto il cutoff (genitori 1.78)', severity: 0 },
      { min: 1.78, max: 2.55, label: 'Sopra cutoff genitori (1.78)', severity: 2 },
      { min: 2.56, max: 3, label: 'Sopra cutoff insegnanti (2.56)', severity: 2 },
    ] },
    { id: 'iper', name: 'Iperattività/Impulsività (media 0-3)', items: ['q10','q11','q12','q13','q14','q15','q16','q17','q18'], compute: 'mean', decimals: 2, bands: [
      { min: 0, max: 1.43, label: 'Sotto il cutoff (genitori 1.44)', severity: 0 },
      { min: 1.44, max: 1.77, label: 'Sopra cutoff genitori (1.44)', severity: 2 },
      { min: 1.78, max: 3, label: 'Sopra cutoff insegnanti (1.78)', severity: 2 },
    ] },
    { id: 'odd', name: 'Oppositività (media 0-3)', items: ['q19','q20','q21','q22','q23','q24','q25','q26'], compute: 'mean', decimals: 2, bands: [
      { min: 0, max: 1.87, label: 'Sotto il cutoff (genitori 1.88)', severity: 0 },
      { min: 1.88, max: 3, label: 'Sopra il cutoff', severity: 2 },
    ] },
  ],
  info: `COMPILAZIONE: genitore o insegnante, riferita all'ultimo mese; indicare il compilante nel campo "Compilato da" (i cutoff differiscono).
SCORING: media per sottoscala (somma/9, oppure /8 per l'oppositività).
CUTOFF MTA (media): Disattenzione — genitori 1.78, insegnanti 2.56; Iperattività/Impulsività — genitori 1.44, insegnanti 1.78; Oppositività — genitori 1.88, insegnanti 2.05 (valori indicativi, verificare sulla fonte in uso).
USO: utile per screening e monitoraggio della risposta al trattamento (ripetibile); la diagnosi richiede valutazione multi-informatore e multi-contesto.`,
  notes: 'Punteggio per sottoscala = media degli item. I cutoff MTA (genitori/insegnanti) qui riportati sono indicativi e DA VERIFICARE sulla fonte in uso; scegliere la fascia pertinente in base al compilante (campo "Compilato da").',
};
