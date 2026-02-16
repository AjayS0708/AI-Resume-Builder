import { Navigate } from 'react-router-dom';
import { RB_STEPS } from '../../config/rbSteps';
import { rbArtifacts } from '../../state/rbArtifacts';

export default function RbProofPage() {
  const allDone = RB_STEPS.every((step) => rbArtifacts.has(step.index));
  if (!allDone) {
    const nextNeeded = RB_STEPS.find((step) => !rbArtifacts.has(step.index))?.index ?? 1;
    return <Navigate to={RB_STEPS[Math.max(0, nextNeeded - 1)].route} replace />;
  }

  return (
    <main className="rb-page">
      <header className="rb-top-bar">
        <div className="rb-top-left">AI Resume Builder</div>
        <div className="rb-top-center">Project 3 — Step 8 of 8</div>
        <div className="rb-status-badge">Complete</div>
      </header>

      <section className="rb-context-header">
        <h1>Proof</h1>
        <p>/rb/proof</p>
      </section>

      <section className="rb-proof-inputs">
        <h2>Artifact Inputs</h2>
        <input placeholder="Lovable link" />
        <input placeholder="GitHub link" />
        <input placeholder="Deploy link" />
        <button type="button">Copy Final Submission</button>
      </section>
    </main>
  );
}