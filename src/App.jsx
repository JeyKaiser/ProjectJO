import { Navigate, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { ROUTE_PERMISSIONS } from './lib/permissions';
import { lazy, Suspense, useEffect, useState } from 'react';
import AsyncState from './components/AsyncState';
import LoginPage from './pages/LoginPage';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ColeccionesExplorer = lazy(() => import('./pages/ColeccionesExplorer'));
const ReferenciaDetalle = lazy(() => import('./pages/ReferenciaDetalle'));
const StateMachineShell = lazy(() => import('./state-machine/routes'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
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
const GuiaCrearUsuario = lazy(() => import('./pages/GuiaCrearUsuario'));

function App() {
  const { authError, loading, session, signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key === 'Escape') setMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  if (loading) {
    return (
      <div className="auth-status-page">
        <div className="sidebar-logo-icon">JO</div>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (authError) {
    return (
      <div className="auth-status-page">
        <div className="auth-status-card">
          <div className="auth-brand-mark">JO</div>
          <h1>Acceso no habilitado</h1>
          <p>{authError.message}</p>
          <button className="btn btn-primary" type="button" onClick={() => signOut()}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <main className="main-content">
        <Header mobileOpen={mobileSidebarOpen} onMenuClick={() => setMobileSidebarOpen(true)} />
        <div className="content">
          <Suspense fallback={<AsyncState loading loadingMessage="Cargando pantalla..." />}>
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            {/* Protegidas */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.dashboard}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/referentes" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.referentes}>
                <ReferentesView />
              </ProtectedRoute>
            } />
            <Route path="/colecciones" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.colecciones}>
                <ColeccionesExplorer />
              </ProtectedRoute>
            } />
            <Route path="/colecciones/:seasonSlug" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.colecciones}>
                <ColeccionesExplorer />
              </ProtectedRoute>
            } />
            <Route path="/colecciones/:seasonSlug/:anio" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.colecciones}>
                <ColeccionesExplorer />
              </ProtectedRoute>
            } />
            <Route path="/colecciones/:seasonSlug/:anio/:referenceNumber" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.colecciones}>
                <ReferenciaDetalle />
              </ProtectedRoute>
            } />
            <Route path="/v2/sm/*" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.stateMachine}>
                <StateMachineShell />
              </ProtectedRoute>
            } />
            <Route path="/ficha-nueva" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.fichaNueva}>
                <FichaTecnicaForm />
              </ProtectedRoute>
            } />
            <Route path="/taller" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.taller}>
                <TallerKanban />
              </ProtectedRoute>
            } />
            <Route path="/taller/corte" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.tallerCorte}>
                <CorteKanban />
              </ProtectedRoute>
            } />
            <Route path="/produccion/consumos" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.consumos}>
                <ConsumosView />
              </ProtectedRoute>
            } />
            <Route path="/trazador" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.trazador}>
                <TrazadorView />
              </ProtectedRoute>
            } />
            <Route path="/trazador/comparativo/:refId" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.comparativoTrazos}>
                <ComparativoTrazos />
              </ProtectedRoute>
            } />
            <Route path="/produccion/ficha-final" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.fichaFinal}>
                <FichaFinalView />
              </ProtectedRoute>
            } />
            <Route path="/configuracion" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.configuracion}>
                <ConfiguracionPersonas />
              </ProtectedRoute>
            } />
            <Route path="/configuracion/guia-usuario" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.guiaUsuario}>
                <GuiaCrearUsuario />
              </ProtectedRoute>
            } />
            <Route path="/admin/colecciones" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.adminColecciones}>
                <GestionColecciones />
              </ProtectedRoute>
            } />
            <Route path="/admin/codigos" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.adminCodigos}>
                <AdminCodigos />
              </ProtectedRoute>
            } />
            <Route path="/admin/insumos" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.adminInsumos}>
                <AdminInsumos />
              </ProtectedRoute>
            } />
            <Route path="/creativo" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.creativo}>
                <PanelCreativo />
              </ProtectedRoute>
            } />
            <Route path="/importar/corte" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.importarCorte}>
                <ImportarCorteCSV />
              </ProtectedRoute>
            } />
            <Route path="/informes/corte" element={
              <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.informesCorte}>
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
