import { Navigate, Route, Routes } from 'react-router-dom';
import TopNav from './components/TopNav';
import BuilderPage from './pages/BuilderPage';
import HomePage from './pages/HomePage';
import PreviewPage from './pages/PreviewPage';
import ProofPage from './pages/ProofPage';
import { RB_STEPS } from './config/rbSteps';
import RbProofPage from './pages/rb/RbProofPage';
import RbStepPage from './pages/rb/RbStepPage';

export default function App() {
  return (
    <div className="app-shell">
      <TopNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/proof" element={<ProofPage />} />
        {RB_STEPS.map((step) => (
          <Route key={step.route} path={step.route} element={<RbStepPage step={step} />} />
        ))}
        <Route path="/rb/proof" element={<RbProofPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
