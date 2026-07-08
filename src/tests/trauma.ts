import type { TestDefinition } from '../types';

// Trauma e stress post-traumatico — strumenti di pubblico dominio (National Center for PTSD).

const li = (prefix: string, texts: string[]) =>
  texts.map((text, i) => ({ id: `${prefix}${i + 1}`, text: `${i + 1}. ${text}`, type: 'likert' as const }));

export const pcl5: TestDefinition = {
  id: 'pcl-5',
  acronym: 'PCL-5',
  name: 'PTSD Checklist for DSM-5',
  author: 'Weathers et al. (2013) — National Center for PTSD',
  source: 'Pubblico dominio (US National Center for PTSD)',
  description: 'Sintomi di PTSD secondo i 20 criteri DSM-5; screening, diagnosi provvisoria e monitoraggio.',
  population: 'Adulti',
  timeframe: 'Ultimo mese',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Trauma e stress post-traumatico'],
  defaultOptions: [
    { value: 0, label: 'Per niente' }, { value: 1, label: 'Un po’' }, { value: 2, label: 'Moderatamente' },
    { value: 3, label: 'Molto' }, { value: 4, label: 'Moltissimo' },
  ],
  sections: [{
    id: 'main', title: 'PCL-5',
    note: 'In riferimento all’esperienza stressante, quanto ti hanno dato fastidio nell’ultimo mese i seguenti problemi?',
    items: li('q', [
      'Ricordi ricorrenti, indesiderati e disturbanti dell’esperienza stressante',
      'Sogni ricorrenti e disturbanti dell’esperienza stressante',
      'Sentire o agire improvvisamente come se l’esperienza stressante stesse accadendo di nuovo',
      'Sentirti molto turbato/a quando qualcosa ti ricorda l’esperienza stressante',
      'Avere forti reazioni fisiche quando qualcosa ti ricorda l’esperienza stressante (cuore che batte forte, difficoltà a respirare, sudorazione)',
      'Evitare ricordi, pensieri o sentimenti legati all’esperienza stressante',
      'Evitare ciò che ricorda dall’esterno l’esperienza stressante (persone, luoghi, conversazioni, attività, oggetti, situazioni)',
      'Difficoltà a ricordare parti importanti dell’esperienza stressante',
      'Avere convinzioni negative forti su te stesso/a, sugli altri o sul mondo',
      'Incolpare te stesso/a o qualcun altro per l’esperienza stressante o per ciò che ne è seguito',
      'Avere forti sentimenti negativi come paura, orrore, rabbia, colpa o vergogna',
      'Perdita di interesse per attività che prima ti piacevano',
      'Sentirti distante o tagliato/a fuori dalle altre persone',
      'Difficoltà a provare sentimenti positivi (per esempio non riuscire a provare felicità o affetto per le persone vicine)',
      'Comportamento irritabile, scoppi di rabbia o comportamenti aggressivi',
      'Assumere troppi rischi o fare cose che potrebbero farti del male',
      'Essere "in allerta", vigile o in guardia',
      'Sentirti nervoso/a o spaventarti facilmente',
      'Avere difficoltà di concentrazione',
      'Avere difficoltà ad addormentarti o a mantenere il sonno',
    ]),
  }],
  scales: [
    { id: 'tot', name: 'Totale (0-80)', items: ['*'], compute: 'sum', bands: [
      { min: 0, max: 30, label: 'Sotto il cutoff', severity: 0 },
      { min: 31, max: 80, label: 'Sopra il cutoff (31-33) — probabile PTSD', severity: 2 },
    ] },
    { id: 'b', name: 'Criterio B — Intrusioni (0-20)', items: ['q1','q2','q3','q4','q5'], compute: 'sum' },
    { id: 'c', name: 'Criterio C — Evitamento (0-8)', items: ['q6','q7'], compute: 'sum' },
    { id: 'd', name: 'Criterio D — Alterazioni cognitive/umore (0-28)', items: ['q8','q9','q10','q11','q12','q13','q14'], compute: 'sum' },
    { id: 'e', name: 'Criterio E — Arousal e reattività (0-24)', items: ['q15','q16','q17','q18','q19','q20'], compute: 'sum' },
  ],
  info: `SOMMINISTRAZIONE: riferita all'evento stressante peggiore (verificare il Criterio A, idealmente con LEC-5); ultime 4 settimane.
SCORING: somma 0-80; cluster DSM-5: B intrusioni (1-5), C evitamento (6-7), D cognizioni/umore (8-14), E arousal (15-20).
INTERPRETAZIONE: cutoff 31-33 per probabile PTSD; diagnosi provvisoria se ≥1 item B, ≥1 C, ≥2 D, ≥2 E con punteggio ≥2 ("Moderatamente").
MONITORAGGIO: variazione ≥10 punti = cambiamento clinicamente significativo; 5-10 = affidabile.`,
  notes: 'Somministrare in riferimento all’evento peggiore (idealmente con Criterio A verificato, es. LEC-5). Diagnosi provvisoria per criteri DSM-5: almeno 1 item B, 1 C, 2 D, 2 E con punteggio ≥2. Cutoff totale 31-33.',
};

export const pcptsd5: TestDefinition = {
  id: 'pc-ptsd-5',
  acronym: 'PC-PTSD-5',
  name: 'Primary Care PTSD Screen for DSM-5',
  author: 'Prins et al. (2016) — National Center for PTSD',
  source: 'Pubblico dominio',
  description: 'Screening ultrabreve del PTSD per contesti di primo livello.',
  population: 'Adulti',
  timeframe: 'Ultimo mese',
  respondent: 'paziente',
  status: 'da_verificare',
  repeatable: true,
  categories: ['Trauma e stress post-traumatico', 'Screening generale'],
  defaultOptions: [{ value: 1, label: 'Sì' }, { value: 0, label: 'No' }],
  sections: [
    {
      id: 'expo', title: 'Esposizione',
      items: [{
        id: 'q0', type: 'yesno',
        text: 'Nella tua vita hai mai vissuto un evento così spaventoso, orribile o sconvolgente che ancora oggi… (se NO, lo screening termina qui)',
      }],
    },
    {
      id: 'main', title: 'Nell’ultimo mese…',
      items: li('q', [
        'Hai avuto incubi sull’evento o ci hai pensato senza volerlo?',
        'Hai cercato con impegno di non pensare all’evento o hai evitato situazioni che te lo ricordavano?',
        'Sei stato/a costantemente in guardia, vigile o facilmente spaventabile?',
        'Ti sei sentito/a insensibile o distaccato/a da persone, attività o dall’ambiente circostante?',
        'Ti sei sentito/a in colpa o non hai smesso di incolpare te stesso/a o altri per l’evento o per i problemi che ha causato?',
      ]).map(i => ({ ...i, type: 'yesno' as const })),
    },
  ],
  scales: [{ id: 'tot', name: 'Totale (0-5)', items: ['q1','q2','q3','q4','q5'], compute: 'sum', bands: [
    { min: 0, max: 2, label: 'Screening negativo', severity: 0 },
    { min: 3, max: 5, label: 'Screening positivo — approfondire (es. PCL-5)', severity: 2 },
  ] }],
  notes: 'Se l’esposizione (prima domanda) è negativa, il punteggio è 0 e gli item successivi si omettono. Cutoff ottimale 3 (4 per massimizzare l’efficienza diagnostica).',
};
