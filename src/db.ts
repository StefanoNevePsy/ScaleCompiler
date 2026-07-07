import Dexie, { type Table } from 'dexie';
import type { Administration, Patient, TestDefinition } from './types';
import { builtinTests } from './tests';

class ScaleDB extends Dexie {
  patients!: Table<Patient, string>;
  administrations!: Table<Administration, string>;
  /** test personalizzati o modificati: sovrascrivono i built-in con lo stesso id */
  tests!: Table<TestDefinition, string>;
  settings!: Table<{ key: string; value: string }, string>;

  constructor() {
    super('scalecompiler');
    this.version(1).stores({
      patients: 'id, code, archived',
      administrations: 'id, patientId, testId, date',
      tests: 'id',
      settings: 'key',
    });
  }
}

export const db = new ScaleDB();

export const uid = () => crypto.randomUUID();

export async function getAllTests(): Promise<TestDefinition[]> {
  const custom = await db.tests.toArray();
  const map = new Map<string, TestDefinition>();
  for (const t of builtinTests) map.set(t.id, t);
  for (const t of custom) map.set(t.id, t);
  return [...map.values()].sort((a, b) => a.acronym.localeCompare(b.acronym));
}

export async function getTest(id: string): Promise<TestDefinition | undefined> {
  return (await db.tests.get(id)) ?? builtinTests.find(t => t.id === id);
}

export async function getSetting(key: string): Promise<string | undefined> {
  return (await db.settings.get(key))?.value;
}
export async function setSetting(key: string, value: string) {
  await db.settings.put({ key, value });
}

// ---------- Backup completo ----------

export async function exportBackup(): Promise<string> {
  const [patients, administrations, tests, settings] = await Promise.all([
    db.patients.toArray(), db.administrations.toArray(), db.tests.toArray(), db.settings.toArray(),
  ]);
  return JSON.stringify({ app: 'scalecompiler', schema: 1, exportedAt: new Date().toISOString(), patients, administrations, tests, settings }, null, 1);
}

export async function importBackup(json: string, mode: 'merge' | 'replace'): Promise<string> {
  const data = JSON.parse(json);
  if (data.app !== 'scalecompiler') throw new Error('File non riconosciuto: non è un backup di ScaleCompiler.');
  await db.transaction('rw', [db.patients, db.administrations, db.tests, db.settings], async () => {
    if (mode === 'replace') {
      await Promise.all([db.patients.clear(), db.administrations.clear(), db.tests.clear()]);
    }
    await db.patients.bulkPut(data.patients ?? []);
    await db.administrations.bulkPut(data.administrations ?? []);
    await db.tests.bulkPut(data.tests ?? []);
  });
  return `Importati: ${data.patients?.length ?? 0} pazienti, ${data.administrations?.length ?? 0} somministrazioni, ${data.tests?.length ?? 0} test personalizzati.`;
}

// ---------- Download helper ----------

export function download(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
