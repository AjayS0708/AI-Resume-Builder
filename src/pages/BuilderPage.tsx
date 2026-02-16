import { useEffect, useMemo, useState } from 'react';
import {
  computeAtsV1,
  createEmptyResumeData,
  hasAnyPreviewContent,
  loadResumeData,
  saveResumeData,
  splitBullets,
  splitSkills,
  type ResumeBuilderData
} from '../lib/resumeData';

const sampleData = (): ResumeBuilderData => ({
  personal: {
    name: 'Alex Carter',
    email: 'alex.carter@email.com',
    phone: '+1 (555) 100-2000',
    location: 'Austin, TX'
  },
  summary:
    'Product-focused software engineer with experience building full-stack applications, improving developer workflows, and shipping user-facing features with measurable outcomes across frontend and backend systems. Strong in React, TypeScript, Node.js, and API design with a focus on reliable delivery and clean architecture.',
  education: [
    { school: 'State University', degree: 'B.S. Computer Science', year: '2024' }
  ],
  experience: [
    {
      company: 'Nexa Labs',
      role: 'Software Engineer',
      duration: '2024 - Present',
      highlights: 'Improved page load speed by 32% across core workflows.\nReduced incident count by 18% using release guardrails.'
    }
  ],
  projects: [
    {
      name: 'Portfolio Platform',
      description: 'Modular web experience for client showcases.',
      highlights: 'Increased session duration by 24% after redesign.'
    },
    {
      name: 'Support Automation Tool',
      description: 'Internal ticket routing assistant.',
      highlights: 'Cut average routing time from 12 minutes to 3 minutes.'
    }
  ],
  skills: 'React, TypeScript, Node.js, SQL, Git, REST APIs, Testing, CI/CD',
  github: 'https://github.com/example',
  linkedin: 'https://linkedin.com/in/example'
});

const updateListItem = <T,>(items: T[], index: number, next: T): T[] =>
  items.map((item, i) => (i === index ? next : item));

const isEducationVisible = (entry: ResumeBuilderData['education'][number]): boolean =>
  [entry.school, entry.degree, entry.year].some((value) => value.trim().length > 0);

const isExperienceVisible = (entry: ResumeBuilderData['experience'][number]): boolean =>
  [entry.company, entry.role, entry.duration, entry.highlights].some((value) => value.trim().length > 0);

const isProjectVisible = (entry: ResumeBuilderData['projects'][number]): boolean =>
  [entry.name, entry.description, entry.highlights].some((value) => value.trim().length > 0);

const scoreTone = (score: number): 'low' | 'mid' | 'high' => {
  if (score < 40) {
    return 'low';
  }
  if (score < 75) {
    return 'mid';
  }
  return 'high';
};

export default function BuilderPage() {
  const [data, setData] = useState<ResumeBuilderData>(() => {
    if (typeof window === 'undefined') {
      return createEmptyResumeData();
    }
    return loadResumeData();
  });

  useEffect(() => {
    saveResumeData(data);
  }, [data]);

  const skillsList = useMemo(() => splitSkills(data.skills), [data.skills]);
  const ats = useMemo(() => computeAtsV1(data), [data]);
  const previewHasContent = useMemo(() => hasAnyPreviewContent(data), [data]);

  const visibleEducation = useMemo(
    () => data.education.filter(isEducationVisible),
    [data.education]
  );
  const visibleExperience = useMemo(
    () => data.experience.filter(isExperienceVisible),
    [data.experience]
  );
  const visibleProjects = useMemo(
    () => data.projects.filter(isProjectVisible),
    [data.projects]
  );

  return (
    <main className="page page-builder">
      <section className="builder-grid">
        <section className="builder-form-card">
          <div className="section-head">
            <h1>Resume Builder</h1>
            <div className="head-actions">
              <button type="button" onClick={() => setData(sampleData())}>Load Sample Data</button>
              <button type="button" className="ghost-button" onClick={() => setData(createEmptyResumeData())}>
                Clear Form
              </button>
            </div>
          </div>

          <section className="ats-card" aria-live="polite">
            <div className="ats-head">
              <h2>ATS Readiness Score</h2>
              <strong>{ats.score}/100</strong>
            </div>
            <div className="ats-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ats.score}>
              <div className={`ats-fill ${scoreTone(ats.score)}`} style={{ width: `${ats.score}%` }} />
            </div>
            <h3 className="ats-subtitle">Suggestions</h3>
            {ats.suggestions.length > 0 ? (
              <ul className="ats-suggestions">
                {ats.suggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="ats-good">Strong baseline. No immediate ATS gaps detected.</p>
            )}
          </section>

          <h2>Personal Info</h2>
          <div className="form-grid-two">
            <input
              placeholder="Name"
              value={data.personal.name}
              onChange={(e) => setData({ ...data, personal: { ...data.personal, name: e.target.value } })}
            />
            <input
              placeholder="Email"
              value={data.personal.email}
              onChange={(e) => setData({ ...data, personal: { ...data.personal, email: e.target.value } })}
            />
            <input
              placeholder="Phone"
              value={data.personal.phone}
              onChange={(e) => setData({ ...data, personal: { ...data.personal, phone: e.target.value } })}
            />
            <input
              placeholder="Location"
              value={data.personal.location}
              onChange={(e) => setData({ ...data, personal: { ...data.personal, location: e.target.value } })}
            />
          </div>

          <h2>Summary</h2>
          <textarea
            placeholder="Professional summary"
            value={data.summary}
            onChange={(e) => setData({ ...data, summary: e.target.value })}
          />

          <h2>Education</h2>
          {data.education.map((entry, index) => (
            <div key={`edu-${index}`} className="stack-row">
              <input
                placeholder="School"
                value={entry.school}
                onChange={(e) =>
                  setData({
                    ...data,
                    education: updateListItem(data.education, index, { ...entry, school: e.target.value })
                  })
                }
              />
              <input
                placeholder="Degree"
                value={entry.degree}
                onChange={(e) =>
                  setData({
                    ...data,
                    education: updateListItem(data.education, index, { ...entry, degree: e.target.value })
                  })
                }
              />
              <input
                placeholder="Year"
                value={entry.year}
                onChange={(e) =>
                  setData({
                    ...data,
                    education: updateListItem(data.education, index, { ...entry, year: e.target.value })
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="ghost-button"
            onClick={() => setData({ ...data, education: [...data.education, { school: '', degree: '', year: '' }] })}
          >
            Add Education
          </button>

          <h2>Experience</h2>
          {data.experience.map((entry, index) => (
            <div key={`exp-${index}`} className="stack-row">
              <input
                placeholder="Company"
                value={entry.company}
                onChange={(e) =>
                  setData({
                    ...data,
                    experience: updateListItem(data.experience, index, { ...entry, company: e.target.value })
                  })
                }
              />
              <input
                placeholder="Role"
                value={entry.role}
                onChange={(e) =>
                  setData({
                    ...data,
                    experience: updateListItem(data.experience, index, { ...entry, role: e.target.value })
                  })
                }
              />
              <input
                placeholder="Duration"
                value={entry.duration}
                onChange={(e) =>
                  setData({
                    ...data,
                    experience: updateListItem(data.experience, index, { ...entry, duration: e.target.value })
                  })
                }
              />
              <textarea
                placeholder="Highlights (one bullet per line)"
                value={entry.highlights}
                onChange={(e) =>
                  setData({
                    ...data,
                    experience: updateListItem(data.experience, index, { ...entry, highlights: e.target.value })
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setData({
                ...data,
                experience: [...data.experience, { company: '', role: '', duration: '', highlights: '' }]
              })
            }
          >
            Add Experience
          </button>

          <h2>Projects</h2>
          {data.projects.map((entry, index) => (
            <div key={`proj-${index}`} className="stack-row">
              <input
                placeholder="Project Name"
                value={entry.name}
                onChange={(e) =>
                  setData({
                    ...data,
                    projects: updateListItem(data.projects, index, { ...entry, name: e.target.value })
                  })
                }
              />
              <textarea
                placeholder="Project Description"
                value={entry.description}
                onChange={(e) =>
                  setData({
                    ...data,
                    projects: updateListItem(data.projects, index, { ...entry, description: e.target.value })
                  })
                }
              />
              <textarea
                placeholder="Highlights (one bullet per line)"
                value={entry.highlights}
                onChange={(e) =>
                  setData({
                    ...data,
                    projects: updateListItem(data.projects, index, { ...entry, highlights: e.target.value })
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setData({
                ...data,
                projects: [...data.projects, { name: '', description: '', highlights: '' }]
              })
            }
          >
            Add Project
          </button>

          <h2>Skills</h2>
          <input
            placeholder="Comma-separated skills"
            value={data.skills}
            onChange={(e) => setData({ ...data, skills: e.target.value })}
          />

          <h2>Links</h2>
          <div className="form-grid-two">
            <input
              placeholder="GitHub"
              value={data.github}
              onChange={(e) => setData({ ...data, github: e.target.value })}
            />
            <input
              placeholder="LinkedIn"
              value={data.linkedin}
              onChange={(e) => setData({ ...data, linkedin: e.target.value })}
            />
          </div>
        </section>

        <aside className="builder-preview-card">
          <h2>Live Preview</h2>

          <div className="resume-shell">
            {previewHasContent ? (
              <>
                {(data.personal.name || data.personal.email || data.personal.phone || data.personal.location) && (
                  <section>
                    {data.personal.name && <h3>{data.personal.name}</h3>}
                    <p>
                      {[data.personal.email, data.personal.phone, data.personal.location]
                        .map((value) => value.trim())
                        .filter(Boolean)
                        .join(' | ')}
                    </p>
                  </section>
                )}

                {data.summary.trim().length > 0 && (
                  <section>
                    <h4>Summary</h4>
                    <p>{data.summary}</p>
                  </section>
                )}

                {visibleEducation.length > 0 && (
                  <section>
                    <h4>Education</h4>
                    {visibleEducation.map((entry, index) => (
                      <p key={`prev-edu-${index}`}>
                        {[entry.degree, entry.school].map((value) => value.trim()).filter(Boolean).join(' - ')}
                        {entry.year.trim().length > 0 ? ` (${entry.year.trim()})` : ''}
                      </p>
                    ))}
                  </section>
                )}

                {visibleExperience.length > 0 && (
                  <section>
                    <h4>Experience</h4>
                    {visibleExperience.map((entry, index) => (
                      <div key={`prev-exp-${index}`} className="preview-entry">
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

                {visibleProjects.length > 0 && (
                  <section>
                    <h4>Projects</h4>
                    {visibleProjects.map((entry, index) => (
                      <div key={`prev-proj-${index}`} className="preview-entry">
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

                {skillsList.length > 0 && (
                  <section>
                    <h4>Skills</h4>
                    <p>{skillsList.join(', ')}</p>
                  </section>
                )}

                {(data.github.trim().length > 0 || data.linkedin.trim().length > 0) && (
                  <section>
                    <h4>Links</h4>
                    {data.github.trim().length > 0 && <p>GitHub: {data.github.trim()}</p>}
                    {data.linkedin.trim().length > 0 && <p>LinkedIn: {data.linkedin.trim()}</p>}
                  </section>
                )}
              </>
            ) : (
              <p>Start filling the form to generate a live preview.</p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
