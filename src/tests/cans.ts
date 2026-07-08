import type { Option, TestDefinition } from '../types';

// CANS — Child and Adolescent Needs and Strengths (Lyons, Praed Foundation).
// Strumento open (licenza gratuita previa formazione/certificazione). Gli item variano tra
// giurisdizioni/versioni: qui il set "comprehensive" standard, con una spiegazione sintetica
// per item (tasto ⓘ). Le ancore integrali del manuale in uso si caricano con
// "Importa da manuale (IA) → Arricchisci test esistente".

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

/** "Nome|spiegazione" → item con info a tendina */
const mk = (prefix: string, entries: string[]) =>
  entries.map((e, i) => {
    const [text, info] = e.split('|');
    return { id: `${prefix}${i + 1}`, text, info, type: 'likert' as const };
  });

const INFO = `LOGICA DI VALUTAZIONE (livelli di azione, ultimi 30 giorni salvo diversa finestra):
• Bisogni — 0 = nessuna evidenza; 1 = storia pregressa, sospetto o esigenza di monitoraggio/prevenzione; 2 = il problema interferisce con il funzionamento: serve un'azione nel piano; 3 = problema pericoloso o invalidante: serve un'azione immediata/intensiva.
• Forze — 0 = forza centrale, utilizzabile come perno del piano; 1 = forza utile ma non centrale; 2 = forza identificata ma da costruire; 3 = nessuna forza ancora identificata.
REGOLE CHIAVE: si valuta il bisogno del bambino/famiglia, non la disponibilità dei servizi; l'item descrive il "che cosa" (il bisogno), non il "perché" (l'eziologia); in caso di informazioni discordanti prevale il livello di azione che meglio serve il piano; ogni item con punteggio 2-3 dovrebbe comparire nel piano di trattamento.
Il CANS è uno strumento di communimetria: il punteggio si assegna in équipe/condiviso con la famiglia e ha senso item per item, non come totale.`;

const NOTES = 'Item ≥2 = bisogno "attuabile" da inserire nel piano; sulle Forze 0–1 = risorsa utilizzabile. I conteggi per dominio servono al monitoraggio. Richiede certificazione annuale (Praed Foundation/TCOM). Ancore integrali e set di item della versione in uso: caricarli con "Arricchisci test esistente".';

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
    'Famiglia|Qualità delle relazioni del minore con famiglia e caregiver: comunicazione, conflitto, senso di appartenenza.',
    'Situazione abitativa|Stabilità e adeguatezza dell’abitazione e del funzionamento del minore nel contesto di vita attuale.',
    'Funzionamento sociale|Relazioni con i pari: capacità di stringere e mantenere amicizie, competenze sociali di base.',
    'Ricreazione/tempo libero|Accesso e partecipazione ad attività di svago adeguate all’età.',
    'Sviluppo/funzionamento intellettivo|Presenza di ritardi evolutivi o disabilità intellettiva e loro impatto sull’autonomia.',
    'Comunicazione|Linguaggio ricettivo ed espressivo, eventuale necessità di supporti comunicativi.',
    'Lavoro|(Adolescenti) capacità e opportunità di svolgere un’attività lavorativa adeguata all’età.',
    'Situazione legale|Coinvolgimento con il sistema giudiziario: procedimenti, misure, messa alla prova.',
    'Salute fisica/medica|Condizioni mediche acute o croniche e loro gestione (aderenza, follow-up).',
    'Sviluppo sessuale|Conoscenze e comportamenti sessuali in rapporto all’età; eventuali condotte a rischio.',
    'Sonno|Quantità e qualità del sonno, routine, impatto sul funzionamento diurno.',
    'Comportamento a scuola|Condotta in classe: rispetto delle regole, relazioni con insegnanti e compagni.',
    'Rendimento scolastico|Apprendimenti rispetto al potenziale: voti, ritardi negli apprendimenti, bisogno di supporti.',
    'Frequenza scolastica|Presenza a scuola: ritardi, assenze, evasione o rifiuto scolastico.',
  ]) },
  { id: 'forze', title: 'Punti di forza', options: STRENGTH, items: mk('st', [
    'Famiglia|Presenza di legami familiari che possono sostenere il piano (inclusa famiglia allargata).',
    'Relazioni interpersonali|Capacità di costruire relazioni positive con adulti e pari; presenza di legami significativi.',
    'Ottimismo|Visione positiva di sé e del proprio futuro, senso di speranza.',
    'Ambito educativo|Rapporto positivo con la scuola: coinvolgimento, sostegni attivi, piani educativi funzionanti.',
    'Ambito vocazionale|Interessi e competenze orientati a un mestiere o percorso professionale.',
    'Talenti e interessi|Abilità o passioni (sport, arte, musica…) che danno piacere e riconoscimento.',
    'Spiritualità/religiosità|Fede, comunità religiosa o vita spirituale come fonte di sostegno.',
    'Vita di comunità|Inclusione attiva nella comunità: gruppi, associazioni, vicinato.',
    'Stabilità delle relazioni|Presenza di adulti di riferimento stabili nel tempo e nei contesti.',
    'Resilienza|Capacità di riconoscere le proprie risorse e usarle per gestire le difficoltà.',
  ]) },
  { id: 'bisogni', title: 'Bisogni comportamentali/emotivi', options: NEED, items: mk('be', [
    'Psicosi|Sintomi del pensiero: allucinazioni, deliri, disorganizzazione ideativa.',
    'Impulsività/iperattività|Difficoltà di controllo motorio e degli impulsi, agire senza riflettere.',
    'Depressione|Umore depresso, perdita di interesse, ritiro, segni vegetativi.',
    'Ansia|Preoccupazioni eccessive, paure, ansia da separazione, sintomi somatici d’ansia.',
    'Oppositività|Sfida verso l’autorità adulta: rifiuto delle regole, provocazione, ostilità.',
    'Disturbo della condotta|Violazioni gravi di regole e diritti altrui: aggressioni, furti, crudeltà.',
    'Adattamento al trauma|Sintomi post-traumatici legati a esperienze avverse: intrusioni, evitamento, iperattivazione.',
    'Controllo della rabbia|Gestione della frustrazione e della collera; scoppi di rabbia sproporzionati.',
    'Uso di sostanze|Uso di alcol o droghe e impatto sul funzionamento (vedi eventuale modulo dedicato).',
  ]) },
  { id: 'rischi', title: 'Comportamenti a rischio', options: NEED, items: mk('rb', [
    'Rischio suicidario|Ideazione, pianificazione o tentativi; valutare recency e letalità.',
    'Autolesionismo non suicidario|Condotte autolesive senza intento suicidario (tagli, bruciature…).',
    'Altri comportamenti autolesivi|Condotte pericolose per sé diverse dall’autolesionismo intenzionale (imprudenza grave…).',
    'Pericolosità verso altri|Aggressioni o minacce ad altre persone; uso di armi.',
    'Fuga/allontanamento|Fughe da casa o dalle strutture; assenze notturne non autorizzate.',
    'Aggressività sessuale|Comportamenti sessuali coercitivi o inappropriati verso altri.',
    'Condotte delinquenziali|Reati e attività illegali (furti, danneggiamenti, spaccio…).',
    'Piromania|Appiccare fuochi: frequenza, intenzionalità, pericolosità.',
  ]) },
  { id: 'caregiver', title: 'Bisogni del caregiver', options: NEED, items: mk('cg', [
    'Supervisione|Capacità del caregiver di monitorare e disciplinare in modo adeguato all’età.',
    'Coinvolgimento nelle cure|Partecipazione attiva del caregiver al piano di trattamento.',
    'Conoscenza dei bisogni del minore|Comprensione delle esigenze, dei punti di forza e delle difficoltà del minore.',
    'Organizzazione|Capacità di gestire la logistica famigliare (appuntamenti, farmaci, scuola).',
    'Risorse sociali|Rete di supporto del caregiver: famiglia, amici, comunità.',
    'Stabilità abitativa|Stabilità della sistemazione del nucleo; rischio di sfratto o trasferimenti.',
    'Salute fisica|Condizioni mediche del caregiver che interferiscono con l’accudimento.',
    'Salute mentale|Difficoltà psicologiche/psichiatriche del caregiver che impattano sull’accudimento.',
    'Uso di sostanze|Uso di alcol/droghe del caregiver e impatto sulle capacità genitoriali.',
    'Bisogni evolutivi|Disabilità o limiti cognitivi del caregiver rilevanti per l’accudimento.',
    'Sicurezza|Capacità del caregiver di proteggere il minore da abusi, trascuratezza, esposizione a violenza.',
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
  viz: { stars: true, starsStrengths: 'forze' },
  info: INFO,
  notes: NOTES,
};

// ---------- CANS 0-5 (Early Childhood) ----------

const s05 = [
  { id: 'vita', title: 'Funzionamento di vita', options: NEED, items: mk('lf', [
    'Famiglia|Qualità delle relazioni del bambino con caregiver e nucleo familiare.',
    'Situazione abitativa|Stabilità e adeguatezza dell’ambiente di vita per un bambino piccolo.',
    'Sviluppo motorio|Tappe motorie grossolane e fini rispetto all’età.',
    'Funzionamento sensoriale|Vista, udito e processazione sensoriale (iper/ipo-reattività).',
    'Comunicazione|Linguaggio ricettivo ed espressivo e comunicazione preverbale rispetto all’età.',
    'Sviluppo cognitivo|Tappe cognitive e apprendimento rispetto all’età; eventuale ritardo globale.',
    'Salute fisica/medica|Condizioni mediche, prematurità, malattie croniche e loro gestione.',
    'Sonno|Addormentamento, risvegli, routine del sonno adeguate all’età.',
    'Alimentazione|Suzione/svezzamento, selettività, crescita ponderale, difficoltà del pasto.',
    'Nido/scuola dell’infanzia|Adattamento e funzionamento nel contesto educativo frequentato.',
    'Funzionamento socio-emotivo|Regolazione affettiva ed engagement sociale con adulti e pari.',
    'Gioco|Qualità e livello evolutivo del gioco (esplorativo, simbolico, condiviso).',
  ]) },
  { id: 'forze', title: 'Punti di forza', options: STRENGTH, items: mk('st', [
    'Famiglia|Legami familiari che possono sostenere lo sviluppo e il piano di intervento.',
    'Relazioni interpersonali|Capacità del bambino di entrare in relazione con adulti e pari.',
    'Curiosità|Interesse ed esplorazione attiva dell’ambiente.',
    'Adattabilità|Flessibilità di fronte a cambiamenti e transizioni.',
    'Persistenza|Costanza nel portare avanti attività adeguate all’età.',
    'Vita di comunità|Inclusione della famiglia e del bambino nella comunità.',
  ]) },
  { id: 'bisogni', title: 'Bisogni comportamentali/emotivi', options: NEED, items: mk('be', [
    'Attaccamento|Qualità del legame di attaccamento con i caregiver primari; segnali di disorganizzazione.',
    'Adattamento al trauma|Reazioni a esperienze avverse precoci: iperattivazione, evitamento, gioco post-traumatico.',
    'Regolazione (emotiva e degli impulsi)|Capacità di modulare stati emotivi e comportamento con l’aiuto dell’adulto.',
    'Comportamenti atipici|Stereotipie, interessi ristretti, atipie relazionali o sensoriali.',
    'Ansia/paure|Paure eccessive per l’età, ansia da separazione, inibizione marcata.',
    'Umore depresso/ritiro|Tristezza persistente, ridotto interesse, ritiro dall’interazione.',
    'Oppositività/aggressività|Condotte oppositive o aggressive oltre la norma evolutiva.',
  ]) },
  { id: 'rischi', title: 'Fattori di rischio', options: NEED, items: mk('rb', [
    'Comportamenti pericolosi per sé|Condotte che espongono il bambino a pericolo fisico.',
    'Nascita a rischio/prematurità|Complicanze perinatali rilevanti per lo sviluppo.',
    'Esposizione prenatale a sostanze|Esposizione in gravidanza ad alcol, droghe o farmaci teratogeni.',
    'Maltrattamento/trascuratezza|Storia o sospetto di abuso fisico/emotivo, trascuratezza, violenza assistita.',
    'Instabilità del caregiving|Cambi ripetuti di caregiver o collocamenti; discontinuità delle cure.',
  ]) },
  { id: 'caregiver', title: 'Bisogni del caregiver', options: NEED, items: mk('cg', [
    'Supervisione|Capacità di garantire vigilanza adeguata a un bambino piccolo.',
    'Coinvolgimento nelle cure|Partecipazione attiva del caregiver agli interventi.',
    'Conoscenza dei bisogni del bambino|Comprensione dello sviluppo e delle esigenze specifiche del bambino.',
    'Organizzazione|Gestione della logistica di cura (visite, terapie, servizi educativi).',
    'Risorse sociali|Rete di supporto disponibile al caregiver.',
    'Stabilità abitativa|Stabilità della sistemazione del nucleo familiare.',
    'Salute fisica|Salute del caregiver in rapporto alle esigenze di accudimento.',
    'Salute mentale|Depressione (anche perinatale) o altre difficoltà psichiche del caregiver.',
    'Uso di sostanze|Uso di sostanze del caregiver e impatto sull’accudimento.',
    'Sicurezza|Capacità di proteggere il bambino da rischi ambientali e relazionali.',
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
  viz: { stars: true, starsStrengths: 'forze' },
  info: INFO,
  notes: NOTES,
};
