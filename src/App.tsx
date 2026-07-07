import { ToastHost, href, useRoute } from './components';
import { Patients } from './pages/Patients';
import { PatientDetail } from './pages/PatientDetail';
import { Administer } from './pages/Administer';
import { Report } from './pages/Report';
import { Compare } from './pages/Compare';
import { Library } from './pages/Library';
import { TestDetail } from './pages/TestDetail';
import { AiImport } from './pages/AiImport';
import { Settings } from './pages/Settings';

export default function App() {
  const r = useRoute();
  const section = r[0] ?? '';

  let page = <Patients />;
  if (r[0] === 'p' && r[1]) {
    if (r[2] === 'nuova' && r[3]) page = <Administer patientId={r[1]} testId={r[3]} />;
    else if (r[2] === 'andamento' && r[3]) page = <Compare patientId={r[1]} testId={r[3]} />;
    else page = <PatientDetail id={r[1]} />;
  } else if (r[0] === 'somm' && r[1]) {
    page = r[2] === 'modifica' ? <Administer adminId={r[1]} /> : <Report adminId={r[1]} />;
  } else if (r[0] === 'libreria') {
    page = r[1] ? <TestDetail id={r[1]} /> : <Library />;
  } else if (r[0] === 'importa') {
    page = <AiImport />;
  } else if (r[0] === 'impostazioni') {
    page = <Settings />;
  }

  const links: [string, string, string][] = [
    ['', 'Pazienti', href()],
    ['libreria', 'Libreria test', href('libreria')],
    ['importa', 'Importa da manuale (IA)', href('importa')],
    ['impostazioni', 'Impostazioni e backup', href('impostazioni')],
  ];

  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="brand">ScaleCompiler<small>hub valutazioni</small></div>
        {links.map(([key, label, url]) => (
          <a key={url} className={`nav${section === key || (key === '' && (section === 'p' || section === 'somm')) ? ' active' : ''}`} href={url}>{label}</a>
        ))}
        <div className="foot">Dati salvati solo su questo dispositivo. Esegui backup regolari.</div>
      </nav>
      <main>{page}</main>
      <ToastHost />
    </div>
  );
}
