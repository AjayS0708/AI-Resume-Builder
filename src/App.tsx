import { Navigate, Route, Routes } from 'react-router-dom';
import { RB_STEPS } from './config/rbSteps';
import BuildStepPage from './pages/BuildStepPage';
import ProofPage from './pages/ProofPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/rb/01-problem" replace />} />
      {RB_STEPS.map((step) => (
        <Route key={step.route} path={step.route} element={<BuildStepPage step={step} />} />
      ))}
      <Route path="/rb/proof" element={<ProofPage />} />
      <Route path="*" element={<Navigate to="/rb/01-problem" replace />} />
    </Routes>
  );
}
