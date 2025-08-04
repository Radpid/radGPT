import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import PatientSearchPage from '../pages/PatientSearchPage';
import WorkspacePage from '../pages/WorkspacePage';
import { AnimatePresence } from 'framer-motion';

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<PatientSearchPage />} />
        <Route path="/workspace/:patientId" element={<WorkspacePage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
export default AppRouter;
