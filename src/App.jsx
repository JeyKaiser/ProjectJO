import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FichaTecnicaForm from './pages/FichaTecnicaForm';
import TallerKanban from './pages/TallerKanban';
import ConsumosView from './pages/ConsumosView';
import FichaFinalView from './pages/FichaFinalView';
import ColeccionesExplorer from './pages/ColeccionesExplorer';
import ReferenciaDetalle from './pages/ReferenciaDetalle';
import Dashboard from './pages/Dashboard';
import ReferentesView from './pages/ReferentesView';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content">
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
            <Route path="/configuracion" element={<div className="text-center mt-10"><h2>Configuración (En desarrollo)</h2></div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
