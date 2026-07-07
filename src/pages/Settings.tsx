import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, download, exportBackup, getAllTests, importBackup } from '../db';
import { readFileText, toast } from '../components';
import { exportScoresCsv } from '../csv';

export function Settings() {
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const nPatients = useLiveQuery(() => db.patients.count(), []) ?? 0;
  const nAdmins = useLiveQuery(() => db.administrations.count(), []) ?? 0;
  const nTests = useLiveQuery(() => db.tests.count(), []) ?? 0;

  const backup = async () => {
    download(`scalecompiler_backup_${new Date().toISOString().slice(0, 10)}.json`, await exportBackup());
    toast('Backup esportato.');
  };

  const restore = async (f: File) => {
    try {
      if (mode === 'replace' && !confirm('Il ripristino SOSTITUIRÀ tutti i dati presenti (pazienti, somministrazioni, test personalizzati). Continuare?')) return;
      toast(await importBackup(await readFileText(f), mode));
    } catch (e: any) {
      toast('Errore di importazione: ' + e.message);
    }
  };

  const exportAll = async () => {
    const [patients, admins, tests] = await Promise.all([db.patients.toArray(), db.administrations.toArray(), getAllTests()]);
    exportScoresCsv(admins, new Map(patients.map(p => [p.id, p])), new Map(tests.map(t => [t.id, t])),
      `punteggi_tutti_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <>
      <h1>Impostazioni e backup</h1>
      <p className="sub muted">Archivio attuale: {nPatients} pazienti · {nAdmins} somministrazioni · {nTests} test personalizzati</p>

      <h2>Backup completo</h2>
      <p className="small muted" style={{ maxWidth: '72ch' }}>
        Tutti i dati vivono solo nel browser di questo computer: esporta regolarmente un backup e conservalo in un percorso sicuro (i dati di pazienti sono dati sanitari). Il backup serve anche a spostare l’archivio su un altro computer.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn-primary" onClick={backup}>Esporta backup (JSON)</button>
        <select style={{ width: 'auto' }} value={mode} onChange={e => setMode(e.target.value as any)}>
          <option value="merge">Importa unendo ai dati presenti</option>
          <option value="replace">Importa sostituendo tutto</option>
        </select>
        <label className="btn btn-secondary" style={{ marginBottom: 0 }}>
          Importa backup…
          <input type="file" accept=".json" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) restore(f); e.target.value = ''; }} />
        </label>
      </div>

      <h2>Export dati per analisi</h2>
      <p className="small muted" style={{ maxWidth: '72ch' }}>
        CSV con separatore «;» e decimali con virgola: si apre direttamente in Excel (anche LibreOffice, SPSS, R, jamovi). Una riga per scala per somministrazione. Export per singolo paziente e per singolo test sono nelle rispettive pagine.
      </p>
      <button className="btn-secondary" onClick={exportAll} disabled={nAdmins === 0}>Esporta CSV di tutti i punteggi</button>

      <h2>Privacy</h2>
      <ul className="small muted" style={{ maxWidth: '72ch' }}>
        <li>Nessun dato viene inviato a server: l’archivio è in IndexedDB, locale a questo browser/profilo.</li>
        <li>Unica eccezione: la funzione «Importa da manuale (IA)» invia al provider scelto il testo del materiale del test che incolli (mai dati di pazienti).</li>
        <li>Per lavorare pseudonimizzato usa solo i codici paziente; conserva la corrispondenza codice→persona fuori dall’app.</li>
        <li>Attenzione: la pulizia dei «dati di navigazione» del browser può cancellare l’archivio — fai backup regolari.</li>
      </ul>
    </>
  );
}
