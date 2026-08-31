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
const ConfiguracionPersonas = lazy(() => import('./pages/ConfiguracionPersonas'));
const GestionColecciones = lazy(() => import('./pages/GestionColecciones'));
const CorteKanban = lazy(() => import('./pages/CorteKanban'));
const ImportarCorteCSV = lazy(() => import('./pages/ImportarCorteCSV'));
const InformesCorte = lazy(() => import('./pages/InformesCorte'));
const AdminCodigos = lazy(() => import('./pages/AdminCodigos'));
const AdminInsumos = lazy(() => import('./pages/AdminInsumos'));
const PanelCreativo = lazy(() => import('./pages/PanelCreativo'));

const ALL_ROLES = Object.values(ROLES);
const REFERENTES_ROLES = [ROLES.ADMIN, ROLES.CREADOR_FICHA];
const COLECCIONES_ROLES = [ROLES.ADMIN, ROLES.LIDER_MODISTAS];
const STATE_MACHINE_ROLES = [ROLES.ADMIN, ROLES.CREADOR_FICHA];

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content">
          <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
          <Routes>
            {/* Protegidas */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/referentes" element={
              <ProtectedRoute allowedRoles={REFERENTES_ROLES}>
                <ReferentesView />
              </ProtectedRoute>
            } />
            <Route path="/colecciones/*" element={
              <ProtectedRoute allowedRoles={COLECCIONES_ROLES}>
                <ColeccionesExplorer />
              </ProtectedRoute>
            } />
            <Route path="/colecciones/:seasonCode" element={
              <ProtectedRoute allowedRoles={COLECCIONES_ROLES}>
                <ColeccionesExplorer />
              </ProtectedRoute>
            } />
            <Route path="/colecciones/:seasonCode/:coleccionId/:anio" element={
              <ProtectedRoute allowedRoles={COLECCIONES_ROLES}>
                <ColeccionesExplorer />
              </ProtectedRoute>
            } />
            <Route path="/colecciones/:seasonCode/:coleccionId/:anio/:refId" element={
              <ProtectedRoute allowedRoles={COLECCIONES_ROLES}>
                <ReferenciaDetalle />
              </ProtectedRoute>
            } />
            <Route path="/v2/sm/*" element={
              <ProtectedRoute allowedRoles={STATE_MACHINE_ROLES}>
                <StateMachineShell />
              </ProtectedRoute>
            } />
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
            <Route path="/admin/insumos" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminInsumos />
              </ProtectedRoute>
            } />
            <Route path="/creativo" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CREATIVO]}>
                <PanelCreativo />
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
