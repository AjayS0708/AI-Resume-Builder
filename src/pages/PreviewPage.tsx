import { useMemo, useState } from 'react';
import {
  createEmptyResumeData,
  getAllSkills,
  hasAnyPreviewContent,
  loadResumeData,
  loadResumeTemplate,
  RESUME_TEMPLATES,
  saveResumeTemplate,
  splitBullets,
  type ResumeBuilderData,
  type ResumeTemplate
} from '../lib/resumeData';

const isEducationVisible = (entry: ResumeBuilderData['education'][number]): boolean =>
  [entry.school, entry.degree, entry.year].some((value) => value.trim().length > 0);

const isExperienceVisible = (entry: ResumeBuilderData['experience'][number]): boolean =>
  [entry.company, entry.role, entry.duration, entry.highlights].some((value) => value.trim().length > 0);

const isProjectVisible = (entry: ResumeBuilderData['projects'][number]): boolean =>
  [entry.title, entry.description, entry.liveUrl, entry.githubUrl, entry.highlights].some((value) => value.trim().length > 0) || entry.techStack.length > 0;

export default function PreviewPage() {
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

  const updateTemplate = (next: ResumeTemplate) => {
    setTemplate(next);
    saveResumeTemplate(next);
  };

  const skills = useMemo(() => getAllSkills(data), [data]);
  const education = useMemo(() => data.education.filter(isEducationVisible), [data.education]);
  const experience = useMemo(() => data.experience.filter(isExperienceVisible), [data.experience]);
  const projects = useMemo(() => data.projects.filter(isProjectVisible), [data.projects]);
  const hasContent = useMemo(() => hasAnyPreviewContent(data), [data]);
  const [copyLabel, setCopyLabel] = useState<string>('Copy Resume as Text');
  const [warning, setWarning] = useState<string>('');

  return (
    <main className="page page-preview">
      <div className="preview-frame">
        <div className="template-tabs" role="tablist" aria-label="Resume template">
          {RESUME_TEMPLATES.map((item) => (
            <button
              key={item}
              type="button"
              className={item === template ? 'template-tab active' : 'template-tab'}
              onClick={() => updateTemplate(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="preview-toolbar">
          <button
            type="button"
            onClick={() => {
              const isIncomplete = data.personal.name.trim().length === 0 || (projects.length === 0 && experience.length === 0);
              setWarning(isIncomplete ? 'Your resume may look incomplete.' : '');
              window.print();
            }}
          >
            Print / Save as PDF
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
                  if (entry.description.trim().length > 0) {
                    lines.push(entry.description.trim());
                  }
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

        <article className={`resume-preview-sheet template-${template}`}>
          {hasContent ? (
            <>
              {(data.personal.name || data.personal.email || data.personal.phone || data.personal.location) && (
                <header>
                  {data.personal.name.trim().length > 0 && <h1>{data.personal.name.trim()}</h1>}
                  <p>
                    {[data.personal.email, data.personal.phone, data.personal.location]
                      .map((value) => value.trim())
                      .filter(Boolean)
                      .join(' | ')}
                  </p>
                </header>
              )}

              {data.summary.trim().length > 0 && (
                <section>
                  <h2>Summary</h2>
                  <p>{data.summary.trim()}</p>
                </section>
              )}

              {education.length > 0 && (
                <section>
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
                <section>
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
                <section>
                  <h2>Projects</h2>
                  <div className="project-card-list">
                    {projects.map((entry, index) => (
                      <article key={`preview-proj-${index}`} className="project-card">
                        {entry.title.trim().length > 0 && <h5>{entry.title.trim()}</h5>}
                        {entry.description.trim().length > 0 && <p>{entry.description.trim()}</p>}
                        {entry.techStack.length > 0 && (
                          <div className="chip-row">
                            {entry.techStack.map((tech) => (
                              <span key={`${entry.title}-${tech}`} className="chip chip-static">{tech}</span>
                            ))}
                          </div>
                        )}
                        <div className="project-links">
                          {entry.liveUrl.trim().length > 0 && <a href={entry.liveUrl.trim()} target="_blank" rel="noreferrer">↗ Live</a>}
                          {entry.githubUrl.trim().length > 0 && <a href={entry.githubUrl.trim()} target="_blank" rel="noreferrer">⌘ Code</a>}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {skills.length > 0 && (
                <section>
                  <h2>Skills</h2>
                  <div className="skill-preview-group">
                    {data.skillsByCategory.technical.length > 0 && <p>Technical Skills</p>}
                    <div className="chip-row">
                      {data.skillsByCategory.technical.map((skill) => (
                        <span key={`preview-technical-${skill}`} className="chip chip-static">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="skill-preview-group">
                    {data.skillsByCategory.soft.length > 0 && <p>Soft Skills</p>}
                    <div className="chip-row">
                      {data.skillsByCategory.soft.map((skill) => (
                        <span key={`preview-soft-${skill}`} className="chip chip-static">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="skill-preview-group">
                    {data.skillsByCategory.tools.length > 0 && <p>Tools & Technologies</p>}
                    <div className="chip-row">
                      {data.skillsByCategory.tools.map((skill) => (
                        <span key={`preview-tools-${skill}`} className="chip chip-static">{skill}</span>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {(data.github.trim().length > 0 || data.linkedin.trim().length > 0) && (
                <section>
                  <h2>Links</h2>
                  {data.github.trim().length > 0 && <p>GitHub: {data.github.trim()}</p>}
                  {data.linkedin.trim().length > 0 && <p>LinkedIn: {data.linkedin.trim()}</p>}
                </section>
              )}
            </>
          ) : (
            <p>Resume preview is empty. Add details in the builder to populate this page.</p>
          )}
        </article>
      </div>
    </main>
  );
}