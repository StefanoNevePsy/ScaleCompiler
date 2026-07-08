// Modello dati: i test sono definizioni dichiarative (JSON), la UI è un motore generico.

export interface Option {
  value: number;
  label: string;
}

export type ItemType = 'likert' | 'single' | 'multi' | 'yesno' | 'number' | 'text';

export interface Item {
  id: string; // unico nel test
  text: string;
  type: ItemType;
  /** per likert/single/multi; se assente eredita da sezione o da defaultOptions del test */
  options?: Option[];
  /** item a punteggio invertito: v' = (min+max) - v */
  reverse?: boolean;
  optional?: boolean;
  help?: string;
  /** spiegazione estesa dell'item (es. ancore/definizioni dal manuale), mostrata a richiesta con il tasto info */
  info?: string;
}

export interface Section {
  id: string;
  title: string;
  note?: string;
  options?: Option[]; // default per gli item della sezione
  items: Item[];
}

export interface Band {
  min: number;
  max: number;
  label: string;
  /** 0=nessuna criticità … 3=grave (colore) */
  severity?: 0 | 1 | 2 | 3;
  note?: string;
}

export type Compute = 'sum' | 'mean' | 'mean10' | 'count_gte' | 'key' | 'pairs';

export interface Scale {
  id: string;
  name: string;
  /** id degli item inclusi; ['*'] = tutti gli item numerici del test (non usato per compute key/pairs) */
  items: string[];
  compute: Compute;
  /** soglia per count_gte (default 1) */
  threshold?: number;
  decimals?: number;
  bands?: Band[];
  /** n. massimo di risposte mancanti tollerate: il punteggio viene proratato (sum) o calcolato sui presenti (mean) */
  maxMissing?: number;
  // --- scale a chiave (es. MMPI-2): raw = conteggio risposte nella direzione chiave ---
  keyTrue?: string[]; // item che contano se risposta = 1 (Vero)
  keyFalse?: string[]; // item che contano se risposta = 0 (Falso)
  // --- scale a coppie (VRIN/TRIN): [item1, valore1, item2, valore2, punti] ---
  pairs?: [string, number, string, number, number][];
  base?: number; // punteggio di partenza (es. TRIN = 9)
  // --- conversione in punti T (es. MMPI-2) ---
  kFraction?: number; // correzione K: raw' = round(raw + kFraction × raw(K)); richiede una scala con id "k"
  tscores?: { m?: (number | null)[]; f?: (number | null)[] }; // indice = punteggio grezzo (corretto), valore = T
  /** la scala si applica solo a un genere (es. Mf maschile/femminile) */
  gender?: 'M' | 'F';
}

export type TestStatus = 'verificato' | 'da_verificare' | 'bozza';

export interface TestDefinition {
  id: string;
  acronym: string;
  name: string;
  version?: string;
  author?: string;
  source?: string;
  description?: string;
  population?: string;
  timeframe?: string; // es. "ultima settimana"
  respondent?: string; // paziente | clinico | genitore | insegnante | ...
  status: TestStatus;
  /** pensato per somministrazioni ripetute (monitoraggio) */
  repeatable?: boolean;
  /** categorie tematiche (es. "Depressione e umore"); modificabili dall'utente senza toccare la definizione */
  categories?: string[];
  defaultOptions?: Option[];
  sections: Section[];
  scales: Scale[];
  notes?: string;
  /** guida estesa (somministrazione, scoring, interpretazione dal manuale), mostrata con il tasto Info */
  info?: string;
  /** visualizzazioni grafiche nel report */
  viz?: {
    /** stelle radiali stile CANS/TCOM: bisogni per dominio (strati % per livello) + forze per item (invertita) */
    stars?: boolean;
    /** id della sezione dei punti di forza (per la stella delle forze invertita) */
    starsStrengths?: string;
    /** id delle scale da tracciare nel profilo a punti T (stile MMPI) */
    profile?: string[];
    /** barre bipolari: scaleId → [etichetta polo basso, etichetta polo alto, min, max] */
    poles?: Record<string, [string, string, number, number]>;
  };
}

export type AnswerValue = number | number[] | string | null;
export type Answers = Record<string, AnswerValue>;

export interface Patient {
  id: string;
  code: string; // codice anonimo o sigla
  firstName?: string;
  lastName?: string;
  /** necessario per i test con norme per genere (es. punti T MMPI-2) */
  gender?: 'M' | 'F';
  birthDate?: string; // ISO yyyy-mm-dd
  notes?: string;
  createdAt: string;
  archived?: boolean;
}

export interface Administration {
  id: string;
  patientId: string;
  testId: string;
  date: string; // ISO
  respondent?: string;
  notes?: string;
  answers: Answers;
  completed: boolean;
  /** compilazione sospesa: da riprendere in un secondo momento */
  draft?: boolean;
}

export interface ScoreResult {
  scaleId: string;
  name: string;
  raw: number | null; // null = non calcolabile (troppi mancanti)
  missing: number;
  band?: Band;
  /** punteggio grezzo corretto con K (solo scale con kFraction) */
  kAdj?: number;
  /** punto T (solo scale con tabelle tscores); null = tabella o genere mancante */
  t?: number | null;
}
