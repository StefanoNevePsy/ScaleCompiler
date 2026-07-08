import type { TestDefinition } from '../types';

// AIR Self-Determination Scale (Wolman, Campeau, DuBois, Mithaug & Stolarski, 1994) — forma Studente.
// Struttura standard: Capacità (Cose che faccio + Come mi sento) e Opportunità (a scuola + a casa).
// Testi degli item parafrasati in italiano: DA VERIFICARE/SOSTITUIRE con la versione italiana in uso nel centro.

const O = [
  { value: 1, label: 'Mai' },
  { value: 2, label: 'Quasi mai' },
  { value: 3, label: 'Qualche volta' },
  { value: 4, label: 'Quasi sempre' },
  { value: 5, label: 'Sempre' },
];

const mk = (prefix: string, texts: string[]) =>
  texts.map((text, i) => ({ id: `${prefix}${i + 1}`, text: `${i + 1}. ${text}`, type: 'likert' as const }));

export const air: TestDefinition = {
  id: 'air-autodeterminazione',
  acronym: 'AIR',
  name: 'AIR Self-Determination Scale — Autodeterminazione (forma Studente)',
  author: 'Wolman, Campeau, DuBois, Mithaug & Stolarski (1994)',
  source: 'AIR/Teachers College — strumento di uso libero',
  description: 'Valuta il livello di autodeterminazione come combinazione di Capacità (conoscenze, abilità e percezioni) e Opportunità (a scuola e a casa) di agire in modo autodeterminato.',
  population: 'Studenti/ragazzi (esistono anche forme Educatore e Genitore)',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Disabilità e funzionamento'],
  defaultOptions: O,
  sections: [
    {
      id: 'faccio', title: 'Capacità — Cose che faccio',
      note: 'Quanto spesso fai queste cose?',
      items: mk('cf', [
        'So di cosa ho bisogno, cosa mi piace e cosa so fare bene',
        'Mi pongo obiettivi per ottenere ciò che voglio o di cui ho bisogno; penso a cosa so fare bene mentre lo faccio',
        'Individuo diversi modi per raggiungere i miei obiettivi',
        'Faccio piani per raggiungere i miei obiettivi',
        'Inizio a lavorare sui miei piani per raggiungere gli obiettivi appena possibile',
        'Confronto i miei risultati con i miei obiettivi per capire se sto ottenendo ciò che voglio',
      ]),
    },
    {
      id: 'sento', title: 'Capacità — Come mi sento',
      note: 'Come ti senti rispetto a queste affermazioni?',
      items: mk('cs', [
        'Mi sento bene rispetto a ciò che mi piace, che voglio e che devo fare',
        'Credo di poter scegliere i miei obiettivi e di poter ottenere ciò che voglio',
        'Mi piace decidere come raggiungere i miei obiettivi',
        'Mi piace fare piani per raggiungere i miei obiettivi',
        'Mi piace iniziare a realizzare i miei piani',
        'Mi piace verificare i miei progressi e cambiare i piani se serve',
      ]),
    },
    {
      id: 'scuola', title: 'Opportunità — Cosa succede a scuola',
      note: 'Quanto spesso succedono queste cose a scuola?',
      items: mk('os', [
        'A scuola ho l’opportunità di esplorare ciò di cui ho bisogno, che mi piace e che so fare bene',
        'A scuola ho l’opportunità di scegliere obiettivi che rispondono ai miei bisogni e interessi',
        'A scuola ho l’opportunità di decidere come raggiungere i miei obiettivi',
        'A scuola ho l’opportunità di fare piani per raggiungere i miei obiettivi',
        'A scuola ho l’opportunità di mettere in pratica i miei piani',
        'A scuola ho l’opportunità di valutare i risultati delle mie azioni e cambiare piani',
      ]),
    },
    {
      id: 'casa', title: 'Opportunità — Cosa succede a casa',
      note: 'Quanto spesso succedono queste cose a casa?',
      items: mk('oc', [
        'A casa ho l’opportunità di esplorare ciò di cui ho bisogno, che mi piace e che so fare bene',
        'A casa ho l’opportunità di scegliere obiettivi che rispondono ai miei bisogni e interessi',
        'A casa ho l’opportunità di decidere come raggiungere i miei obiettivi',
        'A casa ho l’opportunità di fare piani per raggiungere i miei obiettivi',
        'A casa ho l’opportunità di mettere in pratica i miei piani',
        'A casa ho l’opportunità di valutare i risultati delle mie azioni e cambiare piani',
      ]),
    },
  ],
  scales: [
    { id: 'capacita', name: 'Capacità (12–60)', items: ['cf1','cf2','cf3','cf4','cf5','cf6','cs1','cs2','cs3','cs4','cs5','cs6'], compute: 'sum' },
    { id: 'opportunita', name: 'Opportunità (12–60)', items: ['os1','os2','os3','os4','os5','os6','oc1','oc2','oc3','oc4','oc5','oc6'], compute: 'sum' },
    { id: 'tot', name: 'Livello di autodeterminazione (24–120)', items: ['*'], compute: 'sum' },
  ],
  notes: 'Il manuale AIR esprime il livello di autodeterminazione anche in percentuale: (totale − 24) / 96 × 100. Non esistono cutoff clinici: il profilo si interpreta confrontando Capacità e Opportunità. Testi da verificare/sostituire con la traduzione italiana in uso; per le forme Educatore/Genitore usare "Importa da manuale (IA)".',
};
