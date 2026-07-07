# Design

## Theme

Registro product, strategia colore **Restrained**: bg bianco puro, un solo colore di brand (verde clinico, seed hue 160) per azioni primarie e selezione; severità clinica su scala semantica dedicata. Mood: "ambulatorio luminoso di mattina — camice pulito, verde salvia, carta millimetrata".

## Color (OKLCH)

- `--bg`: oklch(1 0 0) — bianco puro
- `--surface`: oklch(0.972 0.006 160) — pannelli/sidebar, secondo neutro
- `--border`: oklch(0.90 0.008 160)
- `--ink`: oklch(0.22 0.015 160) — testo
- `--ink-2`: oklch(0.45 0.02 160) — testo secondario (≥4.5:1 su bianco)
- `--primary`: oklch(0.50 0.115 160) — azioni, testo bianco sopra
- `--primary-soft`: oklch(0.95 0.03 160) — selezione/righe attive
- Severità: `--sev0` verde oklch(0.55 0.12 150) · `--sev1` giallo oklch(0.72 0.13 90) · `--sev2` arancio oklch(0.62 0.14 55) · `--sev3` rosso oklch(0.52 0.16 25)

## Typography

Una sola famiglia: system-ui stack. Scala fissa rem, ratio ~1.2: 0.8125 / 0.875 / 1 / 1.2 / 1.44 / 1.73. Dati e tabelle dense a 0.875rem. Prose max 72ch.

## Layout

App shell: sidebar sinistra (nav, su --surface) + contenuto. Densità alta nelle tabelle; niente card annidate. Griglie Likert come button-group orizzontali.

## Components

Bottoni (primario pieno, secondario outline), input testo, likert button-group (stato selected = primary-soft + bordo primary), tabella dati, badge di stato test (verificato/da_verificare/bozza), badge fascia severità, empty state con istruzioni. Stati completi: hover, focus (anello 2px primary), disabled, error.

## Motion

150–200ms ease-out, solo cambi di stato (selezione item, comparsa punteggio). Reduced-motion: nessuna transizione.

## Print

Report per stampa: bianco/nero + severità, header con paziente/test/data, niente nav.
