import type { Administration, Patient, TestDefinition } from './types';
import { computeScores, allItems } from './scoring';
import { download } from './db';

/** CSV compatibile con Excel italiano: separatore ';', BOM UTF-8, decimali con virgola. */
function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return '';
    let s = typeof v === 'number' ? String(v).replace('.', ',') : String(v);
    if (/[";\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  return '﻿' + rows.map(r => r.map(esc).join(';')).join('\r\n');
}

export function patientLabel(p: Patient): string {
  const name = [p.lastName, p.firstName].filter(Boolean).join(' ');
  return name ? `${p.code} — ${name}` : p.code;
}

/** Una riga per somministrazione: punteggi di tutte le scale (formato "wide", pronto per Excel/SPSS/R). */
export function exportScoresCsv(
  admins: Administration[], patients: Map<string, Patient>, tests: Map<string, TestDefinition>, filename: string,
) {
  const rows: (string | number | null)[][] = [];
  rows.push(['paziente_codice', 'paziente_nome', 'test', 'data', 'compilante', 'scala', 'punteggio', 'punteggio_K', 'punteggio_T', 'fascia', 'item_mancanti', 'note']);
  for (const a of [...admins].sort((x, y) => x.date.localeCompare(y.date))) {
    const p = patients.get(a.patientId);
    const t = tests.get(a.testId);
    if (!p || !t) continue;
    for (const s of computeScores(t, a.answers, { gender: p.gender })) {
      rows.push([p.code, [p.lastName, p.firstName].filter(Boolean).join(' '), t.acronym,
        a.date.slice(0, 10), a.respondent ?? '', s.name, s.raw, s.kAdj ?? null, s.t ?? null, s.band?.label ?? '', s.missing, a.notes ?? '']);
    }
  }
  download(filename, toCsv(rows), 'text/csv');
}

/** Export item per item (formato "long") per un singolo test: una colonna per item. */
export function exportItemsCsv(
  admins: Administration[], patients: Map<string, Patient>, test: TestDefinition, filename: string,
) {
  const items = allItems(test).map(e => e.item);
  const rows: (string | number | null)[][] = [];
  rows.push(['paziente_codice', 'data', ...items.map(i => i.id)]);
  for (const a of [...admins].sort((x, y) => x.date.localeCompare(y.date))) {
    const p = patients.get(a.patientId);
    if (!p || a.testId !== test.id) continue;
    rows.push([p.code, a.date.slice(0, 10), ...items.map(i => {
      const v = a.answers[i.id];
      if (v === null || v === undefined) return null;
      return Array.isArray(v) ? v.join('|') : (v as string | number);
    })]);
  }
  download(filename, toCsv(rows), 'text/csv');
}
