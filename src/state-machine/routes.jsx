import { Routes, Route, Navigate } from 'react-router-dom';
import SMLayout from './components/SMLayout';
import DashboardPage from './pages/DashboardPage';
import InboxPage from './pages/InboxPage';
import ReferencePage from './pages/ReferencePage';
import AlertsPage from './pages/AlertsPage';
import ProcessMapPage from './pages/ProcessMapPage';

export function StateMachineShell() {
  return (
    <Routes>
      <Route element={<SMLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="reference/:refId" element={<ReferencePage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="process-map" element={<ProcessMapPage />} />
      </Route>
    </Routes>
  );
}

export default StateMachineShell;
