import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RB_STEPS, type RbStep } from '../../config/rbSteps';
import { rbArtifacts } from '../../state/rbArtifacts';

type Props = {
  step: RbStep;
};

const statusText = (done: number): string => {
  if (done <= 0) {
    return 'Not Started';
  }
  if (done >= RB_STEPS.length) {
    return 'Complete';
  }
  return 'In Progress';
};

export default function RbStepPage({ step }: Props) {
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!rbArtifacts.canOpen(step.index)) {
      navigate(RB_STEPS[step.index - 2].route, { replace: true });
      return;
    }
    const existing = rbArtifacts.read(step.index);
    setArtifact(existing);
    setSaved(existing.length > 0);
  }, [navigate, step.index]);

  const done = rbArtifacts.completedCount();
  const status = statusText(done);
  const isLast = step.index === RB_STEPS.length;

  const lovablePrompt = useMemo(
    () =>
      [
        'Project: AI Resume Builder — Build Track',
        `Step ${step.index} of 8: ${step.title}`,
        'Create one artifact for this step.'
      ].join('\n'),
    [step.index, step.title]
  );

  const onUpload = () => {
    rbArtifacts.write(step.index, artifact);
    setSaved(rbArtifacts.has(step.index));
  };

  const onNext = () => {
    if (!saved) {
      return;
    }
    if (isLast) {
      navigate('/rb/proof');
      return;
    }
    navigate(RB_STEPS[step.index].route);
  };

  return (
    <main className="rb-page">
      <header className="rb-top-bar">
        <div className="rb-top-left">AI Resume Builder</div>
        <div className="rb-top-center">Project 3 — Step {step.index} of 8</div>
        <div className="rb-status-badge">{status}</div>
      </header>

      <section className="rb-context-header">
        <h1>{step.title}</h1>
        <p>{step.route}</p>
      </section>

      <section className="rb-work-grid">
        <section className="rb-main-workspace">
          <h2>Main Workspace</h2>
          <label htmlFor={`artifact-${step.index}`}>Artifact Upload (text or link)</label>
          <textarea
            id={`artifact-${step.index}`}
            placeholder={`Store under key: ${rbArtifacts.keyFor(step.index)}`}
            value={artifact}
            onChange={(event) => setArtifact(event.target.value)}
          />
          <div className="rb-actions-row">
            <button type="button" onClick={onUpload}>Upload Artifact</button>
            <button type="button" onClick={onNext} disabled={!saved}>{isLast ? 'Go To Proof' : 'Next Step'}</button>
          </div>
        </section>

        <aside className="rb-build-panel">
          <h2>Build Panel</h2>
          <label htmlFor={`lovable-${step.index}`}>Copy This Into Lovable</label>
          <textarea id={`lovable-${step.index}`} readOnly value={lovablePrompt} />
          <div className="rb-actions-row">
            <button type="button" onClick={() => navigator.clipboard.writeText(lovablePrompt)}>Copy</button>
          </div>
          <div className="rb-lovable-block">
            <h3>Build in Lovable</h3>
            <div className="rb-actions-row">
              <button type="button">It Worked</button>
              <button type="button">Error</button>
              <button type="button">Add Screenshot</button>
            </div>
          </div>
        </aside>
      </section>

      <footer className="rb-proof-footer">
        <span>Proof Footer</span>
        <span>{saved ? `${rbArtifacts.keyFor(step.index)} saved` : `${rbArtifacts.keyFor(step.index)} missing`}</span>
      </footer>
    </main>
  );
}