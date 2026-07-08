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

// ---------- Categorie ----------
// Le categorie di un test vivono nella definizione (campo categories), ma l'utente può
// riassegnarle senza modificare la definizione: gli override stanno nella tabella settings.

export async function getCatOverrides(): Promise<Record<string, string[]>> {
  const v = await getSetting('catOverrides');
  return v ? JSON.parse(v) : {};
}
export async function setCatOverride(testId: string, cats: string[]) {
  const o = await getCatOverrides();
  o[testId] = cats;
  await setSetting('catOverrides', JSON.stringify(o));
}
export async function getCustomCategories(): Promise<string[]> {
  const v = await getSetting('customCategories');
  return v ? JSON.parse(v) : [];
}
export async function addCustomCategory(name: string) {
  const list = await getCustomCategories();
  if (!list.includes(name)) await setSetting('customCategories', JSON.stringify([...list, name]));
}
export function testCategories(def: TestDefinition, overrides: Record<string, string[]>): string[] {
  return overrides[def.id] ?? def.categories ?? [];
}

// ---------- Rimozione test dalla libreria ----------
// I test integrati vivono nel codice e non possono essere cancellati: vengono "nascosti"
// (id in un elenco in settings). I test personalizzati senza somministrazioni vengono
// eliminati davvero; se hanno somministrazioni vengono nascosti, così i report restano
// consultabili (getTest continua a risolvere la definizione).

export async function getHiddenTests(): Promise<string[]> {
  const v = await getSetting('hiddenTests');
  return v ? JSON.parse(v) : [];
}
async function setHiddenTests(ids: string[]) {
  await setSetting('hiddenTests', JSON.stringify(ids));
}
export async function unhideTest(id: string) {
  await setHiddenTests((await getHiddenTests()).filter(x => x !== id));
}

export interface DeleteResult { message: string; hardDeleted: boolean }

export async function deleteTest(id: string): Promise<DeleteResult> {
  const isBuiltin = builtinTests.some(t => t.id === id);
  const nAdmin = await db.administrations.where('testId').equals(id).count();
  if (!isBuiltin && nAdmin === 0) {
    await db.tests.delete(id);
    return { message: 'Test personalizzato eliminato definitivamente.', hardDeleted: true };
  }
  // integrato, oppure personalizzato con somministrazioni: nascondi (reversibile)
  const hidden = await getHiddenTests();
  if (!hidden.includes(id)) await setHiddenTests([...hidden, id]);
  const suffix = nAdmin > 0 ? ` Le ${nAdmin} somministrazioni restano consultabili.` : '';
  return { message: `Test rimosso dalla libreria; ripristinabile dai nascosti.${suffix}`, hardDeleted: false };
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
