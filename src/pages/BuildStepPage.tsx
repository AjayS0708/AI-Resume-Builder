import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RB_STEPS } from '../config/rbSteps';
import type { BuildStep } from '../config/rbSteps';
import { artifactStorage } from '../state/artifactStorage';

type Props = {
  step: BuildStep;
};

const statusLabel = (completed: number): string => {
  if (completed >= RB_STEPS.length) {
    return 'Complete';
  }
  if (completed === 0) {
    return 'Not Started';
  }
  return 'In Progress';
};

export default function BuildStepPage({ step }: Props) {
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [artifactSaved, setArtifactSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!artifactStorage.canOpen(step.index)) {
      const lockedTo = Math.max(1, step.index - 1);
      navigate(RB_STEPS[lockedTo - 1].route, { replace: true });
      return;
    }
    const existing = artifactStorage.read(step.index);
    setArtifact(existing);
    setArtifactSaved(existing.length > 0);
  }, [navigate, step.index]);

  const completed = artifactStorage.completedCount();
  const status = statusLabel(completed);
  const isLast = step.index === RB_STEPS.length;
  const canGoNext = artifactSaved;

  const promptText = useMemo(() => {
    return [
      `Project: AI Resume Builder — Build Track`,
      `Step ${step.index} of 8: ${step.title}`,
      step.prompt,
      'Output exactly one clear artifact for this step.'
    ].join('\n');
  }, [step.index, step.prompt, step.title]);

  const onSaveArtifact = () => {
    artifactStorage.write(step.index, artifact);
    const saved = artifactStorage.has(step.index);
    setArtifactSaved(saved);
  };

  const onCopyPrompt = async () => {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const onNext = () => {
    if (!canGoNext) {
      return;
    }
    if (isLast) {
      navigate('/rb/proof');
      return;
    }
    navigate(RB_STEPS[step.index].route);
  };

  return (
    <div className="page-shell">
      <header className="top-bar">
        <div className="top-left">AI Resume Builder</div>
        <div className="top-center">Project 3 — Step {step.index} of 8</div>
        <div className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>{status}</div>
      </header>

      <section className="context-header">
        <h1>{step.title}</h1>
        <p>Route: {step.route}</p>
      </section>

      <main className="workspace-grid">
        <section className="main-workspace">
          <h2>Main Workspace</h2>
          <p>Build artifact for Step {step.index}. Skipping is blocked until prior steps are complete.</p>

          <label htmlFor="artifact">Artifact Upload (text or link)</label>
          <textarea
            id="artifact"
            value={artifact}
            onChange={(event) => setArtifact(event.target.value)}
            placeholder={`Store under key: rb_step_${step.index}_artifact`}
          />

          <div className="main-actions">
            <button type="button" onClick={onSaveArtifact}>Upload Artifact</button>
            <button type="button" onClick={onNext} disabled={!canGoNext}>
              {isLast ? 'Go To Proof' : 'Next Step'}
            </button>
          </div>
        </section>

        <aside className="secondary-panel">
          <h2>Build Panel</h2>
          <label htmlFor="lovable-prompt">Copy This Into Lovable</label>
          <textarea id="lovable-prompt" value={promptText} readOnly />
          <button type="button" onClick={onCopyPrompt}>{copied ? 'Copied' : 'Copy'}</button>

          <div className="lovable-block">
            <div className="lovable-title">Build in Lovable</div>
            <div className="lovable-controls">
              <button type="button">It Worked</button>
              <button type="button">Error</button>
              <button type="button">Add Screenshot</button>
            </div>
          </div>
        </aside>
      </main>

      <footer className="proof-footer">
        <span>Proof Footer</span>
        <span>{artifactSaved ? `rb_step_${step.index}_artifact saved` : `rb_step_${step.index}_artifact missing`}</span>
      </footer>
    </div>
  );
}
