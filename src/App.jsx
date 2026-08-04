import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './context/AuthContext';
import { lazy, Suspense } from 'react';
import Dashboard from './pages/Dashboard';
import ColeccionesExplorer from './pages/ColeccionesExplorer';
import ReferenciaDetalle from './pages/ReferenciaDetalle';
import StateMachineShell from './state-machine/routes';
import NotFoundPage from './pages/NotFoundPage';

const FichaTecnicaForm = lazy(() => import('./pages/FichaTecnicaForm'));
const TallerKanban = lazy(() => import('./pages/TallerKanban'));
const ConsumosView = lazy(() => import('./pages/ConsumosView'));
const TrazadorView = lazy(() => import('./pages/TrazadorView'));
const ComparativoTrazos = lazy(() => import('./pages/ComparativoTrazos'));
const FichaFinalView = lazy(() => import('./pages/FichaFinalView'));
const ReferentesView = lazy(() => import('./pages/ReferentesView'));
const ImportarCSV = lazy(() => import('./pages/ImportarCSV'));
const ConfiguracionPersonas = lazy(() => import('./pages/ConfiguracionPersonas'));
const GestionColecciones = lazy(() => import('./pages/GestionColecciones'));
const CorteKanban = lazy(() => import('./pages/CorteKanban'));
const ImportarCorteCSV = lazy(() => import('./pages/ImportarCorteCSV'));
const InformesCorte = lazy(() => import('./pages/InformesCorte'));
const AdminCodigos = lazy(() => import('./pages/AdminCodigos'));

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content">
          <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Dashboard />} />
            {/* Colecciones - 3 niveles con temporadas */}
            <Route path="/colecciones" element={<ColeccionesExplorer />} />
            <Route path="/colecciones/:seasonCode" element={<ColeccionesExplorer />} />
            <Route path="/colecciones/:seasonCode/:coleccionId/:anio" element={<ColeccionesExplorer />} />
            <Route path="/colecciones/:seasonCode/:coleccionId/:anio/:refId" element={<ReferenciaDetalle />} />
            <Route path="/referentes" element={<ReferentesView />} />
            {/* <Route path="/importar" element={<ImportarCSV />} /> */}
            <Route path="/v2/sm/*" element={<StateMachineShell />} />

            {/* Protegidas */}
            <Route path="/ficha-nueva" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CREADOR_FICHA]}>
                <FichaTecnicaForm />
              </ProtectedRoute>
            } />
            <Route path="/taller" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.LIDER_MODISTAS]}>
                <TallerKanban />
              </ProtectedRoute>
            } />
            <Route path="/taller/corte" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CORTADOR, ROLES.LIDER_CORTADOR]}>
                <CorteKanban />
              </ProtectedRoute>
            } />
            <Route path="/produccion/consumos" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TRAZADOR]}>
                <ConsumosView />
              </ProtectedRoute>
            } />
            <Route path="/trazador" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TRAZADOR]}>
                <TrazadorView />
              </ProtectedRoute>
            } />
            <Route path="/trazador/comparativo/:refId" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TRAZADOR]}>
                <ComparativoTrazos />
              </ProtectedRoute>
            } />
            <Route path="/produccion/ficha-final" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ESPECIFICADORA]}>
                <FichaFinalView />
              </ProtectedRoute>
            } />
            <Route path="/configuracion" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <ConfiguracionPersonas />
              </ProtectedRoute>
            } />
            <Route path="/admin/colecciones" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <GestionColecciones />
              </ProtectedRoute>
            } />
            <Route path="/admin/codigos" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminCodigos />
              </ProtectedRoute>
            } />
            <Route path="/importar/corte" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CORTADOR, ROLES.LIDER_CORTADOR]}>
                <ImportarCorteCSV />
              </ProtectedRoute>
            } />
            <Route path="/informes/corte" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CORTADOR, ROLES.LIDER_CORTADOR]}>
                <InformesCorte />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;
