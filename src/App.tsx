import { Navigate, Route, Routes } from 'react-router-dom';
import TopNav from './components/TopNav';
import BuilderPage from './pages/BuilderPage';
import HomePage from './pages/HomePage';
import PreviewPage from './pages/PreviewPage';
import ProofPage from './pages/ProofPage';

export default function App() {
  return (
    <div className="app-shell">
      <TopNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/proof" element={<ProofPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}