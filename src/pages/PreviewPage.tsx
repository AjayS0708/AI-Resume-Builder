import { useMemo, useState } from 'react';
import {
  createEmptyResumeData,
  hasAnyPreviewContent,
  loadResumeData,
  loadResumeTemplate,
  RESUME_TEMPLATES,
  saveResumeTemplate,
  splitBullets,
  splitSkills,
  type ResumeBuilderData,
  type ResumeTemplate
} from '../lib/resumeData';

const isEducationVisible = (entry: ResumeBuilderData['education'][number]): boolean =>
  [entry.school, entry.degree, entry.year].some((value) => value.trim().length > 0);

const isExperienceVisible = (entry: ResumeBuilderData['experience'][number]): boolean =>
  [entry.company, entry.role, entry.duration, entry.highlights].some((value) => value.trim().length > 0);

const isProjectVisible = (entry: ResumeBuilderData['projects'][number]): boolean =>
  [entry.name, entry.description, entry.highlights].some((value) => value.trim().length > 0);

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

  const skills = useMemo(() => splitSkills(data.skills), [data.skills]);
  const education = useMemo(() => data.education.filter(isEducationVisible), [data.education]);
  const experience = useMemo(() => data.experience.filter(isExperienceVisible), [data.experience]);
  const projects = useMemo(() => data.projects.filter(isProjectVisible), [data.projects]);
  const hasContent = useMemo(() => hasAnyPreviewContent(data), [data]);

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
                  {projects.map((entry, index) => (
                    <div key={`preview-proj-${index}`} className="preview-entry">
                      {entry.name.trim().length > 0 && <p>{entry.name.trim()}</p>}
                      {entry.description.trim().length > 0 && <p>{entry.description.trim()}</p>}
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

              {skills.length > 0 && (
                <section>
                  <h2>Skills</h2>
                  <p>{skills.join(', ')}</p>
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