// Import di test tramite IA: prompt maestro + client per Google Gemini e build.nvidia.com (API OpenAI-compatibile).
// Il prompt è autosufficiente: può anche essere copiato e incollato in un qualsiasi chatbot insieme al manuale.

export const MASTER_PROMPT = `Sei un esperto di psicometria e di digitalizzazione di strumenti di valutazione psicologica. Il tuo compito è ricostruire la definizione digitale COMPLETA e FEDELE di un test/questionario a partire dal materiale che ti fornisco (manuale, protocollo di somministrazione, foglio di scoring, articolo di validazione).

Devi produrre UN SOLO oggetto JSON, senza alcun testo prima o dopo, senza commenti e senza blocchi di codice markdown, conforme ESATTAMENTE a questo schema TypeScript:

interface TestDefinition {
  id: string;          // identificativo breve: solo minuscole, numeri e trattini (es. "phq-9")
  acronym: string;     // sigla ufficiale (es. "PHQ-9")
  name: string;        // nome completo dello strumento
  version?: string;    // versione/forma (es. "self-report 8-18 anni")
  author?: string;     // autori originali (+ adattamento italiano se noto)
  source?: string;     // riferimento bibliografico del manuale/validazione usati
  description?: string;// 1-3 frasi: cosa misura, a cosa serve
  population?: string; // popolazione target (es. "adulti 18+", "bambini 8-18 anni")
  timeframe?: string;  // finestra temporale della consegna (es. "ultime 2 settimane")
  respondent?: string; // chi compila: "paziente" | "clinico" | "genitore" | "insegnante" | altro
  status: "da_verificare"; // usa SEMPRE "da_verificare": la verifica umana avviene dopo
  repeatable?: boolean;    // true se pensato per somministrazioni ripetute nel tempo
  defaultOptions?: Option[]; // scala di risposta condivisa da tutti gli item (se esiste)
  sections: Section[];
  scales: Scale[];
  notes?: string;      // istruzioni di somministrazione/scoring che il clinico deve conoscere
}
interface Option { value: number; label: string } // value = punteggio numerico REALE usato nello scoring
interface Section {
  id: string; title: string;
  note?: string;       // consegna/istruzioni della sezione, testuale dal manuale
  options?: Option[];  // scala di risposta di default per gli item della sezione
  items: Item[];
}
interface Item {
  id: string;          // breve e stabile, unico in tutto il test (es. "q1", "mand-l1-1")
  text: string;        // testo ESATTO dell'item come nel materiale fornito (stessa lingua)
  type: "likert" | "single" | "multi" | "yesno" | "number" | "text";
  options?: Option[];  // solo se diverse da quelle di sezione/test
  reverse?: boolean;   // true se l'item è a punteggio invertito: v' = (min+max) - v
  optional?: boolean;  // true se l'item può legittimamente restare senza risposta
  help?: string;       // eventuali istruzioni specifiche dell'item
}
interface Scale {
  id: string; name: string;   // sottoscala o punteggio totale
  items: string[];            // id degli item inclusi; ["*"] = tutti gli item numerici
  compute: "sum" | "mean" | "mean10" | "count_gte";
  // sum = somma; mean = media; mean10 = media x 10 (es. CORE-OM); count_gte = conteggio item con punteggio >= threshold
  threshold?: number;         // per count_gte
  decimals?: number;          // decimali da mostrare
  maxMissing?: number;        // n. massimo di risposte mancanti tollerate (sum viene proratata, mean calcolata sui presenti)
  bands?: Band[];             // fasce interpretative/cutoff dal manuale
}
interface Band { min: number; max: number; label: string; severity?: 0|1|2|3; note?: string }
// severity: 0 = nessuna criticità/range normale, 1 = lieve/attenzione, 2 = moderato, 3 = grave/azione immediata

SEMANTICA DELLO SCORING (rispettala con precisione):
- Il punteggio di ogni item è il campo "value" dell'opzione scelta. Se lo scoring reale del test parte da 1 e non da 0, i value DEVONO partire da 1.
- "reverse: true" applica v' = (min + max) - v sui value delle opzioni disponibili per quell'item. Usalo SOLO se il manuale prevede item invertiti; verifica item per item.
- "type: multi" (checkbox multiple): il punteggio dell'item è la SOMMA dei value selezionati.
- Le fasce (bands) devono coprire l'intero range possibile del punteggio, senza buchi né sovrapposizioni, con i cutoff ESATTI del manuale.
- Se il manuale prevede norme diverse per genere/età con cutoff diversi, crea scale separate (es. "totale-m", "totale-f") oppure riporta le differenze nel campo "note" della band e in "notes".

REGOLE VINCOLANTI:
1. FEDELTÀ ASSOLUTA: trascrivi il testo degli item ESATTAMENTE come nel materiale fornito. NON inventare, NON parafrasare, NON tradurre se non richiesto esplicitamente. Se un item non è leggibile nel materiale, usa il testo "[ITEM NON PRESENTE NEL MATERIALE - verificare sul manuale]" e segnalalo in "notes".
2. NIENTE CONOSCENZA A MEMORIA per item e cutoff: usa SOLO il materiale fornito. La tua conoscenza generale serve solo per capire la struttura, non per riempire buchi.
3. COMPLETEZZA: includi TUTTI gli item, TUTTE le sottoscale e TUTTI i cutoff presenti nel materiale. Conta gli item alla fine e verifica che il totale corrisponda a quello dichiarato dal manuale.
4. Etichette delle opzioni: usa le ancore verbali esatte della scala di risposta (es. "0 = Mai", "1 = Qualche volta"...).
5. Se il test ha più forme (per età, per compilante), genera SOLO la forma richiesta o, se non specificato, quella principale, dichiarandolo in "notes".
6. In "notes" riporta: regole di somministrazione essenziali, gestione dei mancanti prevista dal manuale, criteri di interruzione, e ogni ambiguità incontrata.
7. Output: SOLO il JSON. Nessun testo prima o dopo. JSON valido e parsabile (attenzione a virgole e virgolette).

CHECKLIST FINALE (verificala prima di rispondere):
[ ] numero di item = numero dichiarato dal manuale
[ ] ogni scala referenzia solo id di item esistenti
[ ] item invertiti marcati esattamente come da manuale
[ ] bands con cutoff esatti, senza buchi
[ ] JSON valido, nessun testo extra

Esempio minimo di output valido (solo per il formato, non per il contenuto):
{"id":"esempio-2","acronym":"ES-2","name":"Scala Esempio","status":"da_verificare","repeatable":true,"respondent":"paziente","timeframe":"ultime 2 settimane","defaultOptions":[{"value":0,"label":"Mai"},{"value":1,"label":"Spesso"}],"sections":[{"id":"s1","title":"Item","items":[{"id":"q1","text":"Mi sento triste","type":"likert"},{"id":"q2","text":"Mi sento sereno","type":"likert","reverse":true}]}],"scales":[{"id":"tot","name":"Totale","items":["*"],"compute":"sum","bands":[{"min":0,"max":1,"label":"Non clinico","severity":0},{"min":2,"max":2,"label":"Clinico","severity":2}]}]}

Ora analizza il materiale seguente e produci il JSON:`;

export interface AiConfig {
  provider: 'gemini' | 'nvidia';
  apiKey: string;
  model: string;
}

export const DEFAULT_MODELS = { gemini: 'gemini-2.5-pro', nvidia: 'meta/llama-3.1-405b-instruct' };

export interface AiInput {
  text: string; // testo del manuale/test incollato
  pdf?: { base64: string; mimeType: string }; // solo Gemini
  extraInstructions?: string; // es. "genera solo la forma genitori"
}

export async function generateDefinition(cfg: AiConfig, input: AiInput): Promise<string> {
  const userText = (input.extraInstructions ? `ISTRUZIONI AGGIUNTIVE: ${input.extraInstructions}\n\n` : '') + input.text;
  if (cfg.provider === 'gemini') {
    const parts: any[] = [{ text: MASTER_PROMPT + '\n\n' + userText }];
    if (input.pdf) parts.push({ inlineData: { mimeType: input.pdf.mimeType, data: input.pdf.base64 } });
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('');
    if (!text) throw new Error('Risposta vuota da Gemini: ' + JSON.stringify(data).slice(0, 300));
    return text;
  }
  // build.nvidia.com — endpoint OpenAI-compatibile. Nota: se il browser blocca la richiesta per CORS,
  // usare il pulsante "Copia prompt" e incollare il risultato manualmente.
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.1,
      max_tokens: 32768,
      messages: [
        { role: 'system', content: MASTER_PROMPT },
        { role: 'user', content: userText },
      ],
    }),
  });
  if (!res.ok) throw new Error(`NVIDIA ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Risposta vuota da NVIDIA.');
  return text;
}

/** Estrae il primo oggetto JSON da una risposta (tollera fence markdown e testo intorno). */
export function extractJson(text: string): any {
  const cleaned = text.replace(/```(?:json)?/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('Nessun oggetto JSON trovato nella risposta.');
  return JSON.parse(cleaned.slice(start, end + 1));
}
