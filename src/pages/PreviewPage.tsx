import { CSSProperties, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  computeAtsV1,
  createEmptyResumeData,
  getAllSkills,
  hasAnyPreviewContent,
  loadResumeAccent,
  loadResumeData,
  loadResumeTemplate,
  RESUME_ACCENTS,
  RESUME_TEMPLATES,
  saveResumeAccent,
  saveResumeTemplate,
  splitBullets,
  splitDescriptionPoints,
  type ResumeAccentKey,
  type ResumeBuilderData,
  type ResumeTemplate
} from '../lib/resumeData';

const TEMPLATE_LABELS: Record<ResumeTemplate, string> = {
  classic: 'Classic',
  modern: 'Modern',
  minimal: 'Minimal'
};

const CATEGORY_META = [
  { key: 'technical', label: 'Technical Skills' },
  { key: 'soft', label: 'Soft Skills' },
  { key: 'tools', label: 'Tools & Technologies' }
] as const;

const isEducationVisible = (entry: ResumeBuilderData['education'][number]): boolean =>
  [entry.school, entry.degree, entry.year].some((value) => value.trim().length > 0);

const isExperienceVisible = (entry: ResumeBuilderData['experience'][number]): boolean =>
  [entry.company, entry.role, entry.duration, entry.highlights].some((value) => value.trim().length > 0);

const isProjectVisible = (entry: ResumeBuilderData['projects'][number]): boolean =>
  [entry.title, entry.description, entry.liveUrl, entry.githubUrl, entry.highlights].some((value) => value.trim().length > 0) || entry.techStack.length > 0;

const getTemplateStyle = (accentHsl: string): CSSProperties => ({
  ['--resume-accent' as string]: accentHsl
});

export default function PreviewPage() {
  const resumeRef = useRef<HTMLElement | null>(null);
  const [data] = useState<ResumeBuilderData>(() => {
    if (typeof window === 'undefined') {
      return createEmptyResumeData();
    }
    return loadResumeData();
  });

  const [template, setTemplate] = useState<ResumeTemplate>(() => {
    if (typeof window === 'undefined') {
      return 'classic';
    }
    return loadResumeTemplate();
  });

  const [accent, setAccent] = useState<ResumeAccentKey>(() => {
    if (typeof window === 'undefined') {
      return 'teal';
    }
    return loadResumeAccent();
  });

  const updateTemplate = (next: ResumeTemplate) => {
    setTemplate(next);
    saveResumeTemplate(next);
  };

  const updateAccent = (next: ResumeAccentKey) => {
    setAccent(next);
    saveResumeAccent(next);
  };

  const accentTheme = RESUME_ACCENTS.find((item) => item.key === accent) ?? RESUME_ACCENTS[0];
  const skills = useMemo(() => getAllSkills(data), [data]);
  const ats = useMemo(() => computeAtsV1(data), [data]);
  const education = useMemo(() => data.education.filter(isEducationVisible), [data.education]);
  const experience = useMemo(() => data.experience.filter(isExperienceVisible), [data.experience]);
  const projects = useMemo(() => data.projects.filter(isProjectVisible), [data.projects]);
  const hasContent = useMemo(() => hasAnyPreviewContent(data), [data]);
  const [copyLabel, setCopyLabel] = useState<string>('Copy Resume as Text');
  const [warning, setWarning] = useState<string>('');
  const [toast, setToast] = useState<string>('');

  const scoreBand = useMemo(() => {
    if (ats.score <= 40) {
      return { label: 'Needs Work', className: 'score-low' as const };
    }
    if (ats.score <= 70) {
      return { label: 'Getting There', className: 'score-mid' as const };
    }
    return { label: 'Strong Resume', className: 'score-high' as const };
  }, [ats.score]);

  const renderCommonMainContent = () => (
    <>
      {data.summary.trim().length > 0 && (
        <section className="resume-block">
          <h2>Summary</h2>
          <p>{data.summary.trim()}</p>
        </section>
      )}

      {education.length > 0 && (
        <section className="resume-block">
          <h2>Education</h2>
          {education.map((entry, index) => (
            <p key={`preview-edu-${index}`}>
              {[entry.degree, entry.school].map((value) => value.trim()).filter(Boolean).join(' - ')}
              {entry.year.trim().length > 0 ? ` (${entry.year.trim()})` : ''}
            </p>
          ))}
        </section>
      )}

      {experience.length > 0 && (
        <section className="resume-block">
          <h2>Experience</h2>
          {experience.map((entry, index) => (
            <div key={`preview-exp-${index}`} className="preview-entry">
              <p>
                {[entry.role, entry.company].map((value) => value.trim()).filter(Boolean).join(' - ')}
                {entry.duration.trim().length > 0 ? ` (${entry.duration.trim()})` : ''}
              </p>
              {splitBullets(entry.highlights).length > 0 && (
                <ul>
                  {splitBullets(entry.highlights).map((line) => (
                    <li key={`${line}-${index}`}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section className="resume-block">
          <h2>Projects</h2>
          <div className="project-card-list">
            {projects.map((entry, index) => (
              <article key={`preview-proj-${index}`} className="project-card">
                {entry.title.trim().length > 0 && <h5>{entry.title.trim()}</h5>}
                {entry.description.trim().length > 0 && (
                  <ul>
                    {splitDescriptionPoints(entry.description).map((point, pointIndex) => (
                      <li key={`${entry.title}-${pointIndex}`}>{point}</li>
                    ))}
                  </ul>
                )}
                {entry.techStack.length > 0 && (
                  <div className="chip-row">
                    {entry.techStack.map((tech) => (
                      <span key={`${entry.title}-${tech}`} className="chip chip-static">{tech}</span>
                    ))}
                  </div>
                )}
                <div className="project-links">
                  {entry.liveUrl.trim().length > 0 && <a href={entry.liveUrl.trim()} target="_blank" rel="noreferrer">Live URL</a>}
                  {entry.githubUrl.trim().length > 0 && <a href={entry.githubUrl.trim()} target="_blank" rel="noreferrer">GitHub</a>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );

  const renderSkillsGrouped = () => (
    <section className="resume-block">
      <h2>Skills</h2>
      {CATEGORY_META.map((meta) => (
        <div key={`preview-${meta.key}`} className="skill-preview-group">
          {data.skillsByCategory[meta.key].length > 0 && <p>{meta.label}</p>}
          <div className="chip-row">
            {data.skillsByCategory[meta.key].map((skill) => (
              <span key={`preview-${meta.key}-${skill}`} className="chip chip-static">{skill}</span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );

  const renderClassicOrMinimal = () => (
    <>
      {(data.personal.name || data.personal.email || data.personal.phone || data.personal.location) && (
        <header className="resume-header-block">
          {data.personal.name.trim().length > 0 && <h1>{data.personal.name.trim()}</h1>}
          <p>
            {[data.personal.email, data.personal.phone, data.personal.location]
              .map((value) => value.trim())
              .filter(Boolean)
              .join(' | ')}
          </p>
        </header>
      )}

      {renderCommonMainContent()}

      {skills.length > 0 && renderSkillsGrouped()}

      {(data.github.trim().length > 0 || data.linkedin.trim().length > 0) && (
        <section className="resume-block">
          <h2>Links</h2>
          {data.github.trim().length > 0 && <p>GitHub: {data.github.trim()}</p>}
          {data.linkedin.trim().length > 0 && <p>LinkedIn: {data.linkedin.trim()}</p>}
        </section>
      )}
    </>
  );

  const renderModern = () => (
    <div className="modern-layout">
      <aside className="modern-sidebar">
        {data.personal.name.trim().length > 0 && <h1>{data.personal.name.trim()}</h1>}
        <div className="resume-block">
          <h2>Contact</h2>
          {data.personal.email.trim().length > 0 && <p>{data.personal.email.trim()}</p>}
          {data.personal.phone.trim().length > 0 && <p>{data.personal.phone.trim()}</p>}
          {data.personal.location.trim().length > 0 && <p>{data.personal.location.trim()}</p>}
        </div>
        {skills.length > 0 && renderSkillsGrouped()}
        {(data.github.trim().length > 0 || data.linkedin.trim().length > 0) && (
          <div className="resume-block">
            <h2>Links</h2>
            {data.github.trim().length > 0 && <p>GitHub: {data.github.trim()}</p>}
            {data.linkedin.trim().length > 0 && <p>LinkedIn: {data.linkedin.trim()}</p>}
          </div>
        )}
      </aside>
      <section className="modern-main">{renderCommonMainContent()}</section>
    </div>
  );

  return (
    <main className="page page-preview">
      <div className="preview-frame">
        <div className="visual-template-picker" aria-label="Template picker">
          {RESUME_TEMPLATES.map((item) => (
            <button
              key={item}
              type="button"
              className={item === template ? 'template-thumb active' : 'template-thumb'}
              onClick={() => updateTemplate(item)}
            >
              <span className="template-thumb-label">{TEMPLATE_LABELS[item]}</span>
              <span className={`template-sketch template-sketch-${item}`}>
                <span />
                <span />
                <span />
              </span>
              {item === template && <span className="template-check">✓</span>}
            </button>
          ))}
        </div>

        <div className="color-picker-row" aria-label="Accent color picker">
          {RESUME_ACCENTS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === accent ? 'color-dot active' : 'color-dot'}
              style={{ background: item.hsl }}
              title={item.label}
              onClick={() => updateAccent(item.key)}
            />
          ))}
        </div>

        <section className="preview-score-card" aria-live="polite">
          <div className={`score-ring ${scoreBand.className}`} style={{ ['--score-value' as string]: `${ats.score}` }}>
            <div className="score-core">{ats.score}</div>
          </div>
          <div className="score-meta">
            <h3>ATS Resume Score</h3>
            <p>{scoreBand.label}</p>
          </div>
        </section>

        <section className="preview-suggestions-card">
          <h3>Improvement Suggestions</h3>
          {ats.suggestions.length > 0 ? (
            <ul>
              {ats.suggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No major gaps detected.</p>
          )}
        </section>

        <div className="preview-toolbar">
          <button
            type="button"
            onClick={async () => {
              const isIncomplete = data.personal.name.trim().length === 0 || (projects.length === 0 && experience.length === 0);
              setWarning(isIncomplete ? 'Your resume may look incomplete.' : '');

              if (!resumeRef.current) {
                setToast('Unable to export PDF right now. Try again.');
                window.setTimeout(() => setToast(''), 1800);
                return;
              }

              const canvas = await html2canvas(resumeRef.current, {
                scale: 1.25,
                useCORS: true,
                backgroundColor: '#ffffff'
              });

              const imageData = canvas.toDataURL('image/jpeg', 0.78);
              const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                compress: true
              });
              const pageWidth = 210;
              const pageHeight = 297;
              const margin = 10;
              const usableWidth = pageWidth - margin * 2;
              const scaledHeight = (canvas.height * usableWidth) / canvas.width;

              if (scaledHeight <= pageHeight - margin * 2) {
                pdf.addImage(imageData, 'JPEG', margin, margin, usableWidth, scaledHeight, undefined, 'MEDIUM');
              } else {
                const totalPages = Math.ceil(scaledHeight / (pageHeight - margin * 2));
                for (let i = 0; i < totalPages; i += 1) {
                  if (i > 0) {
                    pdf.addPage();
                  }
                  const yOffset = -i * (pageHeight - margin * 2);
                  pdf.addImage(imageData, 'JPEG', margin, margin + yOffset, usableWidth, scaledHeight, undefined, 'MEDIUM');
                }
              }

              const safeName = (data.personal.name.trim() || 'resume').replace(/[^a-zA-Z0-9-_]/g, '_');
              pdf.save(`${safeName}.pdf`);
              setToast('PDF export ready! Check your downloads.');
              window.setTimeout(() => setToast(''), 1800);
            }}
          >
            Download PDF
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={async () => {
              const isIncomplete = data.personal.name.trim().length === 0 || (projects.length === 0 && experience.length === 0);
              setWarning(isIncomplete ? 'Your resume may look incomplete.' : '');

              const lines: string[] = [];
              if (data.personal.name.trim().length > 0) {
                lines.push(data.personal.name.trim());
              }

              const contact = [data.personal.email, data.personal.phone, data.personal.location]
                .map((value) => value.trim())
                .filter(Boolean)
                .join(' | ');
              if (contact.length > 0) {
                lines.push(`Contact: ${contact}`);
              }

              if (data.summary.trim().length > 0) {
                lines.push('', 'Summary', data.summary.trim());
              }
              if (education.length > 0) {
                lines.push('', 'Education');
                education.forEach((entry) => {
                  const primary = [entry.degree, entry.school].map((value) => value.trim()).filter(Boolean).join(' - ');
                  const year = entry.year.trim();
                  lines.push(year.length > 0 ? `${primary} (${year})` : primary);
                });
              }
              if (experience.length > 0) {
                lines.push('', 'Experience');
                experience.forEach((entry) => {
                  const heading = [entry.role, entry.company].map((value) => value.trim()).filter(Boolean).join(' - ');
                  const duration = entry.duration.trim();
                  lines.push(duration.length > 0 ? `${heading} (${duration})` : heading);
                  splitBullets(entry.highlights).forEach((line) => lines.push(`- ${line}`));
                });
              }
              if (projects.length > 0) {
                lines.push('', 'Projects');
                projects.forEach((entry) => {
                  if (entry.title.trim().length > 0) {
                    lines.push(entry.title.trim());
                  }
                  splitDescriptionPoints(entry.description).forEach((point) => lines.push(`- ${point}`));
                  if (entry.techStack.length > 0) {
                    lines.push(`Tech Stack: ${entry.techStack.join(', ')}`);
                  }
                  if (entry.liveUrl.trim().length > 0) {
                    lines.push(`Live URL: ${entry.liveUrl.trim()}`);
                  }
                  if (entry.githubUrl.trim().length > 0) {
                    lines.push(`GitHub URL: ${entry.githubUrl.trim()}`);
                  }
                });
              }
              if (skills.length > 0) {
                lines.push('', 'Skills', skills.join(', '));
              }
              if (data.github.trim().length > 0 || data.linkedin.trim().length > 0) {
                lines.push('', 'Links');
                if (data.github.trim().length > 0) {
                  lines.push(`GitHub: ${data.github.trim()}`);
                }
                if (data.linkedin.trim().length > 0) {
                  lines.push(`LinkedIn: ${data.linkedin.trim()}`);
                }
              }

              await navigator.clipboard.writeText(lines.join('\n'));
              setCopyLabel('Copied');
              window.setTimeout(() => setCopyLabel('Copy Resume as Text'), 1600);
            }}
          >
            {copyLabel}
          </button>
        </div>

        {warning.length > 0 && <p className="preview-warning">{warning}</p>}
        {toast.length > 0 && <p className="preview-toast">{toast}</p>}

        <article
          ref={resumeRef}
          className={`resume-preview-sheet template-${template}`}
          style={getTemplateStyle(accentTheme.hsl)}
        >
          {hasContent ? (
            template === 'modern' ? renderModern() : renderClassicOrMinimal()
          ) : (
            <p>Resume preview is empty. Add details in the builder to populate this page.</p>
          )}
        </article>
      </div>
    </main>
  );
}