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

export type Compute = 'sum' | 'mean' | 'mean10' | 'count_gte';

export interface Scale {
  id: string;
  name: string;
  /** id degli item inclusi; ['*'] = tutti gli item numerici del test */
  items: string[];
  compute: Compute;
  /** soglia per count_gte (default 1) */
  threshold?: number;
  decimals?: number;
  bands?: Band[];
  /** n. massimo di risposte mancanti tollerate: il punteggio viene proratato (sum) o calcolato sui presenti (mean) */
  maxMissing?: number;
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
}

export type AnswerValue = number | number[] | string | null;
export type Answers = Record<string, AnswerValue>;

export interface Patient {
  id: string;
  code: string; // codice anonimo o sigla
  firstName?: string;
  lastName?: string;
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
}
