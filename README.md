# ScaleCompiler — Hub valutazioni psicologiche

Web app **interamente locale** per somministrare, calcolare e monitorare nel tempo scale e questionari di valutazione in un centro di psicologia. Nessun server: i dati (pazienti, somministrazioni, test personalizzati) vivono in IndexedDB nel browser.

## Avvio

```bash
npm install
npm run dev        # sviluppo → http://localhost:5173
npm run build      # produzione → cartella dist/
npm run preview    # serve la build
```

La cartella `dist/` può essere servita da qualsiasi web server statico, anche in intranet, oppure aperta tramite `npm run preview` sul singolo computer.

## Funzionalità

- **Dashboard pazienti** con codici (anche anonimi), ricerca, archiviazione.
- **Compilazione veloce**: griglia per il clinico (tasti `0-9` rispondono, frecce navigano, avanzamento automatico) e **modalità guidata** a schermo intero per il paziente (tablet).
- **Scoring immediato** con sottoscale, item invertiti, gestione dei mancanti (prorating) e fasce interpretative/cutoff.
- **Andamento nel tempo** per test ripetuti: grafico con fasce di severità sullo sfondo + tabella per data.
- **Export**: CSV apribile in Excel (separatore `;`, decimali con virgola) per punteggi e per singoli item; **backup/ripristino** completo in JSON; **stampa/PDF** dei report via stampa del browser.
- **Libreria test estensibile**: ogni test è una definizione JSON (item, opzioni, scale, cutoff) modificabile nell'app, esportabile e condivisibile tra colleghi.
- **Importa da manuale (IA)**: incolla il materiale di un test (o allega il PDF del manuale) e l'app ricostruisce la definizione tramite Google Gemini o build.nvidia.com, la valida e la salva come «da verificare». In alternativa, il prompt completo è copiabile e utilizzabile in qualsiasi chatbot.

## Come si definisce un test

Vedi `src/types.ts` (`TestDefinition`) e gli esempi in `src/tests/`. In sintesi: `sections[].items[]` con tipo di risposta (`likert`, `single`, `multi`, `yesno`, `number`, `text`), `scales[]` con metodo di calcolo (`sum`, `mean`, `mean10`, `count_gte`), item invertiti (`reverse`), fasce di cutoff (`bands`). I test integrati sono in `src/tests/`; quelli creati/modificati nell'app sono salvati nel database locale e prevalgono sugli integrati con lo stesso `id`.

### Stati delle definizioni

- `verificato` — controllata sul manuale, pronta all'uso clinico.
- `da_verificare` — struttura completa, ma testi/scoring da confrontare con il manuale prima dell'uso clinico. **Tutti i test integrati nascono in questo stato.**
- `bozza` — contenitore da completare (non somministrabile).

## Note su licenze e privacy

- Inserire nell'app (e inviare all'IA) solo materiali di test per cui si dispone di licenza d'uso; mai dati di pazienti nella funzione IA.
- I dati restano nel profilo del browser del computer in uso: eseguire backup regolari (Impostazioni → Esporta backup) e conservarli in modo conforme al GDPR.
