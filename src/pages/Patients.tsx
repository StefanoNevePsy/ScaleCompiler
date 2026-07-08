import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, uid } from '../db';
import { fmtDate, nav, toast } from '../components';
import { patientLabel } from '../csv';

export function Patients() {
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');

  const patients = useLiveQuery(() => db.patients.toArray(), []) ?? [];
  const admins = useLiveQuery(() => db.administrations.toArray(), []) ?? [];
  const byPatient = new Map<string, { n: number; last: string }>();
  for (const a of admins) {
    const cur = byPatient.get(a.patientId) ?? { n: 0, last: '' };
    byPatient.set(a.patientId, { n: cur.n + 1, last: a.date > cur.last ? a.date : cur.last });
  }

  const list = patients
    .filter(p => showArchived || !p.archived)
    .filter(p => {
      const s = `${p.code} ${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase();
      return s.includes(q.toLowerCase());
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  const add = async () => {
    if (!code.trim()) { toast('Il codice paziente è obbligatorio.'); return; }
    if (patients.some(p => p.code === code.trim())) { toast('Esiste già un paziente con questo codice.'); return; }
    const id = uid();
    await db.patients.add({
      id, code: code.trim(), firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined, birthDate: birthDate || undefined,
      gender: (gender || undefined) as 'M' | 'F' | undefined,
      createdAt: new Date().toISOString(),
    });
    setCode(''); setFirstName(''); setLastName(''); setBirthDate(''); setGender(''); setShowForm(false);
    nav('p', id);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Pazienti</h1>
          <div className="sub">{list.length} in elenco — seleziona un paziente per somministrare test e vedere l’andamento</div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}>+ Nuovo paziente</button>
      </div>

      {showForm && (
        <div className="panel soft">
          <div className="row">
            <label className="field">Codice / sigla (obbligatorio, può essere anonimo)
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="es. PZ-042" autoFocus />
            </label>
            <label className="field">Cognome (opzionale)
              <input value={lastName} onChange={e => setLastName(e.target.value)} />
            </label>
            <label className="field">Nome (opzionale)
              <input value={firstName} onChange={e => setFirstName(e.target.value)} />
            </label>
            <label className="field">Data di nascita
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            </label>
            <label className="field">Sesso (per norme di genere)
              <select value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">—</option><option value="M">M</option><option value="F">F</option>
              </select>
            </label>
            <div className="grow-0"><button className="btn-primary" onClick={add}>Crea</button></div>
          </div>
          <p className="small muted">Suggerimento privacy: per lavorare con dati pseudonimizzati usa solo il codice e tieni la corrispondenza codice→persona fuori dall’app.</p>
        </div>
      )}

      <div className="row" style={{ margin: '1rem 0' }}>
        <input placeholder="Cerca per codice o nome…" value={q} onChange={e => setQ(e.target.value)} />
        <label className="grow-0 small" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          mostra archiviati
        </label>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <strong>Nessun paziente</strong>
          {patients.length === 0 ? 'Crea il primo paziente con “+ Nuovo paziente”.' : 'Nessun risultato per questa ricerca.'}
        </div>
      ) : (
        <table className="data">
          <thead><tr><th>Codice</th><th>Nome</th><th>Nascita</th><th className="num">Somministrazioni</th><th>Ultima</th></tr></thead>
          <tbody>
            {list.map(p => {
              const s = byPatient.get(p.id);
              return (
                <tr key={p.id} className="click" onClick={() => nav('p', p.id)}>
                  <td><strong>{p.code}</strong>{p.archived ? <span className="badge bozza" style={{ marginLeft: 6 }}>archiviato</span> : null}</td>
                  <td>{[p.lastName, p.firstName].filter(Boolean).join(' ') || <span className="muted">—</span>}</td>
                  <td>{p.birthDate ? fmtDate(p.birthDate) : <span className="muted">—</span>}</td>
                  <td className="num">{s?.n ?? 0}</td>
                  <td>{s?.last ? fmtDate(s.last) : <span className="muted">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
