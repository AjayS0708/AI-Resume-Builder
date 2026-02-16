import { useEffect, useMemo, useState } from 'react';
import { RB_STEPS } from '../../config/rbSteps';
import { rbArtifacts } from '../../state/rbArtifacts';

type FinalSubmissionState = {
  lovableProjectLink: string;
  githubRepositoryLink: string;
  deployedUrl: string;
  checklist: boolean[];
};

const FINAL_SUBMISSION_KEY = 'rb_final_submission';

const CHECKLIST_ITEMS: string[] = [
  'All form sections save to localStorage',
  'Live preview updates in real-time',
  'Template switching preserves data',
  'Color theme persists after refresh',
  'ATS score calculates correctly',
  'Score updates live on edit',
  'Export buttons work (copy/download)',
  'Empty states handled gracefully',
  'Mobile responsive layout works',
  'No console errors on any page'
];

const emptyFinalSubmission = (): FinalSubmissionState => ({
  lovableProjectLink: '',
  githubRepositoryLink: '',
  deployedUrl: '',
  checklist: CHECKLIST_ITEMS.map(() => false)
});

const isValidHttpUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const loadFinalSubmission = (): FinalSubmissionState => {
  const raw = localStorage.getItem(FINAL_SUBMISSION_KEY);
  if (!raw) {
    return emptyFinalSubmission();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FinalSubmissionState>;
    const base = emptyFinalSubmission();
    const parsedChecklist = Array.isArray(parsed.checklist) ? parsed.checklist.map(Boolean) : base.checklist;
    const checklist = CHECKLIST_ITEMS.map((_, index) => parsedChecklist[index] ?? false);

    return {
      lovableProjectLink: String(parsed.lovableProjectLink ?? ''),
      githubRepositoryLink: String(parsed.githubRepositoryLink ?? ''),
      deployedUrl: String(parsed.deployedUrl ?? ''),
      checklist
    };
  } catch {
    return emptyFinalSubmission();
  }
};

export default function RbProofPage() {
  const [submission, setSubmission] = useState<FinalSubmissionState>(() => {
    if (typeof window === 'undefined') {
      return emptyFinalSubmission();
    }
    return loadFinalSubmission();
  });
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(FINAL_SUBMISSION_KEY, JSON.stringify(submission));
  }, [submission]);

  const stepStatuses = useMemo(
    () =>
      RB_STEPS.map((step) => ({
        ...step,
        complete: rbArtifacts.has(step.index)
      })),
    [submission]
  );

  const allStepsCompleted = stepStatuses.every((step) => step.complete);
  const allChecklistPassed = submission.checklist.every(Boolean);
  const lovableValid =
    submission.lovableProjectLink.trim().length === 0 || isValidHttpUrl(submission.lovableProjectLink);
  const requiredLinksValid =
    isValidHttpUrl(submission.githubRepositoryLink) &&
    isValidHttpUrl(submission.deployedUrl);

  const isShipped = allStepsCompleted && allChecklistPassed && requiredLinksValid && lovableValid;

  const updateChecklist = (index: number, next: boolean) => {
    const checklist = submission.checklist.map((value, i) => (i === index ? next : value));
    setSubmission({ ...submission, checklist });
  };

  const onCopyFinalSubmission = async () => {
    const lines = [
      '------------------------------------------',
      'AI Resume Builder - Final Submission',
      '',
      `Lovable Project: ${submission.lovableProjectLink || 'N/A'}`,
      `GitHub Repository: ${submission.githubRepositoryLink || 'N/A'}`,
      `Live Deployment: ${submission.deployedUrl || 'N/A'}`,
      '',
      'Core Capabilities:',
      '- Structured resume builder',
      '- Deterministic ATS scoring',
      '- Template switching',
      '- PDF export with clean formatting',
      '- Persistence + validation checklist',
      '------------------------------------------'
    ];

    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="rb-page">
      <header className="rb-top-bar">
        <div className="rb-top-left">AI Resume Builder</div>
        <div className="rb-top-center">Project 3 - Proof</div>
        <div className="rb-status-badge">{isShipped ? 'Shipped' : 'In Progress'}</div>
      </header>

      <section className="rb-context-header">
        <h1>Proof</h1>
        <p>/rb/proof</p>
      </section>

      <section className="rb-proof-inputs">
        <h2>Step Completion Overview</h2>
        <ul className="rb-proof-list">
          {stepStatuses.map((step) => (
            <li key={step.route}>
              Step {step.index}: {step.title} - {step.complete ? 'Completed' : 'Pending'}
            </li>
          ))}
        </ul>
      </section>

      <section className="rb-proof-inputs">
        <h2>Artifact Collection</h2>
        <label htmlFor="lovable-link">Lovable Project Link (Optional)</label>
        <input
          id="lovable-link"
          type="url"
          inputMode="url"
          value={submission.lovableProjectLink}
          onChange={(event) => setSubmission({ ...submission, lovableProjectLink: event.target.value })}
          placeholder="https://..."
          aria-invalid={submission.lovableProjectLink.trim().length > 0 && !isValidHttpUrl(submission.lovableProjectLink)}
        />
        {submission.lovableProjectLink.trim().length > 0 && !isValidHttpUrl(submission.lovableProjectLink) && (
          <p className="rb-proof-hint">Enter a valid URL (http/https).</p>
        )}

        <label htmlFor="github-link">GitHub Repository Link</label>
        <input
          id="github-link"
          type="url"
          inputMode="url"
          value={submission.githubRepositoryLink}
          onChange={(event) => setSubmission({ ...submission, githubRepositoryLink: event.target.value })}
          placeholder="https://..."
          aria-invalid={submission.githubRepositoryLink.trim().length > 0 && !isValidHttpUrl(submission.githubRepositoryLink)}
        />
        {submission.githubRepositoryLink.trim().length > 0 && !isValidHttpUrl(submission.githubRepositoryLink) && (
          <p className="rb-proof-hint">Enter a valid URL (http/https).</p>
        )}

        <label htmlFor="deployed-link">Deployed URL</label>
        <input
          id="deployed-link"
          type="url"
          inputMode="url"
          value={submission.deployedUrl}
          onChange={(event) => setSubmission({ ...submission, deployedUrl: event.target.value })}
          placeholder="https://..."
          aria-invalid={submission.deployedUrl.trim().length > 0 && !isValidHttpUrl(submission.deployedUrl)}
        />
        {submission.deployedUrl.trim().length > 0 && !isValidHttpUrl(submission.deployedUrl) && (
          <p className="rb-proof-hint">Enter a valid URL (http/https).</p>
        )}
      </section>

      <section className="rb-proof-inputs">
        <h2>Checklist Validation</h2>
        <ul className="rb-proof-checklist">
          {CHECKLIST_ITEMS.map((item, index) => (
            <li key={item}>
              <label>
                <input
                  type="checkbox"
                  checked={submission.checklist[index] ?? false}
                  onChange={(event) => updateChecklist(index, event.target.checked)}
                />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="rb-proof-inputs">
        <button type="button" onClick={onCopyFinalSubmission}>
          {copied ? 'Copied Final Submission' : 'Copy Final Submission'}
        </button>
        {isShipped ? (
          <p className="rb-proof-success">Project 3 Shipped Successfully.</p>
        ) : (
          <p className="rb-proof-hint">Status remains In Progress until all steps, checklist items, and required links are complete.</p>
        )}
      </section>
    </main>
  );
}
