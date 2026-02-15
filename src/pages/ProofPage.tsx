import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { RB_STEPS } from '../config/rbSteps';
import { artifactStorage } from '../state/artifactStorage';

export default function ProofPage() {
  const [lovableLink, setLovableLink] = useState<string>('');
  const [githubLink, setGithubLink] = useState<string>('');
  const [deployLink, setDeployLink] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const allComplete = RB_STEPS.every((step) => artifactStorage.has(step.index));

  const statusRows = useMemo(
    () =>
      RB_STEPS.map((step) => ({
        step: step.index,
        route: step.route,
        complete: artifactStorage.has(step.index)
      })),
    []
  );

  if (!allComplete) {
    const firstLocked = artifactStorage.firstLockedStep();
    return <Navigate to={RB_STEPS[firstLocked - 1].route} replace />;
  }

  const onCopyFinalSubmission = async () => {
    const lines = [
      'AI Resume Builder - Build Track (Project 3)',
      ...statusRows.map((row) => `Step ${row.step}: ${row.complete ? 'Complete' : 'Pending'} (${row.route})`),
      `Lovable Link: ${lovableLink || 'N/A'}`,
      `GitHub Link: ${githubLink || 'N/A'}`,
      `Deploy Link: ${deployLink || 'N/A'}`
    ];

    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="page-shell">
      <header className="top-bar">
        <div className="top-left">AI Resume Builder</div>
        <div className="top-center">Project 3 - Step 8 of 8</div>
        <div className="status-badge complete">Complete</div>
      </header>

      <section className="context-header">
        <h1>Proof</h1>
        <p>Route: /rb/proof</p>
      </section>

      <main className="proof-main">
        <div className="proof-status-card">
          <h2>8 Step Status</h2>
          <ul>
            {statusRows.map((row) => (
              <li key={row.route}>
                Step {row.step}: {row.complete ? 'Complete' : 'Pending'}
              </li>
            ))}
          </ul>
        </div>

        <div className="proof-links-card">
          <h2>Submission Links</h2>
          <label htmlFor="lovable-link">Lovable link</label>
          <input id="lovable-link" value={lovableLink} onChange={(e) => setLovableLink(e.target.value)} />

          <label htmlFor="github-link">GitHub link</label>
          <input id="github-link" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />

          <label htmlFor="deploy-link">Deploy link</label>
          <input id="deploy-link" value={deployLink} onChange={(e) => setDeployLink(e.target.value)} />

          <button type="button" onClick={onCopyFinalSubmission}>
            {copied ? 'Copied Final Submission' : 'Copy Final Submission'}
          </button>
        </div>
      </main>

      <footer className="proof-footer">
        <span>Proof Footer</span>
        <span>All artifacts uploaded</span>
      </footer>
    </div>
  );
}
