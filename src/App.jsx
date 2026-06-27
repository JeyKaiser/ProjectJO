import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { lazy, Suspense } from 'react';
// ── EAGER: páginas más visitadas (carga instantánea, sin demora visual) ──
import Dashboard from './pages/Dashboard';
import AdminJey from './EjerciciosReact-JCR/AdminJey';
import ColeccionesExplorer from './pages/ColeccionesExplorer';
import ReferenciaDetalle from './pages/ReferenciaDetalle';
import StateMachineShell from './state-machine/routes';

// ── LAZY: páginas pesadas o poco frecuentes ──
const FichaTecnicaForm = lazy(() => import('./pages/FichaTecnicaForm'));
const TallerKanban = lazy(() => import('./pages/TallerKanban'));
const ConsumosView = lazy(() => import('./pages/ConsumosView'));
const FichaFinalView = lazy(() => import('./pages/FichaFinalView'));
const ReferentesView = lazy(() => import('./pages/ReferentesView'));
const ImportarCSV = lazy(() => import('./pages/ImportarCSV'));
const ConfiguracionPersonas = lazy(() => import('./pages/ConfiguracionPersonas'));

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content">
          <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ficha-nueva" element={<FichaTecnicaForm />} />
            <Route path="/colecciones" element={<ColeccionesExplorer />} />
            <Route path="/colecciones/:coleccionId" element={<ColeccionesExplorer />} />
            <Route path="/colecciones/:coleccionId/:anio" element={<ColeccionesExplorer />} />
            <Route path="/colecciones/:coleccionId/:anio/:refId" element={<ReferenciaDetalle />} />
            <Route path="/taller" element={<TallerKanban />} />
            <Route path="/produccion/consumos" element={<ConsumosView />} />
            <Route path="/produccion/ficha-final" element={<FichaFinalView />} />
            <Route path="/referentes" element={<ReferentesView />} />
            <Route path="/importar" element={<ImportarCSV />} />
            <Route path="/configuracion" element={<ConfiguracionPersonas />} />
            <Route path="/adminJey" element={<AdminJey />} />
            <Route path="/v2/sm/*" element={<StateMachineShell />} />
          </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;
