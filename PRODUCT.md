# Product

## Register

product — app UI clinica: il design serve il compito, non è il prodotto.

## Product

**ScaleCompiler** — hub locale per la somministrazione, lo scoring e il monitoraggio di scale e questionari psicologici in un centro di psicologia evidence-based.

## Users

Psicologi e operatori di un centro clinico (utenza mista: età evolutiva, disabilità, adulti). Contesto: studio o tablet in seduta, spesso con il paziente presente. Job-to-be-done: inserire una compilazione nel minor tempo possibile, ottenere punteggi e fasce interpretative immediati, confrontare somministrazioni ripetute nel tempo, esportare dati per elaborazioni esterne.

Due modalità d'uso distinte:
- **Clinico** (default): densità alta, tastiera, griglie compatte.
- **Paziente** (tablet porto in mano): un item alla volta, testo grande, bottoni grandi.

## Brand personality

Calmo, affidabile, preciso. Un ferro del mestiere che scompare nel compito — come una buona cartella clinica, non come un'app consumer.

## Anti-references

- Dashboard "wellness" consumer (gradienti, illustrazioni giocose, gamification).
- Gestionali sanitari anni 2000 (grigi piatti, form infiniti senza gerarchia).
- Decorazione che rallenta l'inserimento dati.

## Accessibility

- Contrasto AA ovunque (testo ≥4.5:1); modalità paziente con testo grande.
- Compilazione completa da tastiera (1–9 per le opzioni Likert, frecce/Tab).
- `prefers-reduced-motion` rispettato; nessuna animazione decorativa.
- Dati sensibili: tutto locale (IndexedDB), nessun invio a server salvo l'import IA esplicito.

## Strategic design principles

1. Velocità di inserimento sopra ogni cosa: mai un dropdown dove basta un bottone.
2. Il punteggio e la fascia interpretativa sono l'output primario: sempre visibili, sempre stampabili.
3. I test sono dati (JSON), non codice: la UI è un motore generico.
4. Colore = stato/severità clinica, mai decorazione.
