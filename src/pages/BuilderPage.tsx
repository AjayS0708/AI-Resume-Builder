import { useEffect, useMemo, useState } from 'react';
import {
  computeAtsV1,
  computeTopImprovements,
  createEmptyResumeData,
  getAllSkills,
  hasAnyPreviewContent,
  hasNumericIndicator,
  loadResumeData,
  loadResumeTemplate,
  RESUME_TEMPLATES,
  saveResumeData,
  saveResumeTemplate,
  splitDescriptionPoints,
  splitBullets,
  startsWithActionVerb,
  type ResumeBuilderData,
  type ResumeTemplate
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
  education: [{ school: 'State University', degree: 'B.S. Computer Science', year: '2024' }],
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
      title: 'Portfolio Platform',
      description: 'Built modular web experience for client showcases and content operations.',
      techStack: ['React', 'TypeScript'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example/portfolio',
      highlights: 'Improved engagement by 24%'
    }
  ],
  skillsByCategory: {
    technical: ['React', 'TypeScript', 'Node.js'],
    soft: ['Problem Solving'],
    tools: ['Git']
  },
  skills: '',
  github: 'https://github.com/example',
  linkedin: 'https://linkedin.com/in/example'
});

type SkillCategoryKey = 'technical' | 'soft' | 'tools';

const CATEGORY_META: Array<{ key: SkillCategoryKey; label: string }> = [
  { key: 'technical', label: 'Technical Skills' },
  { key: 'soft', label: 'Soft Skills' },
  { key: 'tools', label: 'Tools & Technologies' }
];

const updateListItem = <T,>(items: T[], index: number, next: T): T[] =>
  items.map((item, i) => (i === index ? next : item));

const isEducationVisible = (entry: ResumeBuilderData['education'][number]): boolean =>
  [entry.school, entry.degree, entry.year].some((value) => value.trim().length > 0);

const isExperienceVisible = (entry: ResumeBuilderData['experience'][number]): boolean =>
  [entry.company, entry.role, entry.duration, entry.highlights].some((value) => value.trim().length > 0);

const isProjectVisible = (entry: ResumeBuilderData['projects'][number]): boolean =>
  [entry.title, entry.description, entry.liveUrl, entry.githubUrl, entry.highlights].some((value) => value.trim().length > 0) || entry.techStack.length > 0;

const scoreTone = (score: number): 'low' | 'mid' | 'high' => {
  if (score < 40) {
    return 'low';
  }
  if (score < 75) {
    return 'mid';
  }
  return 'high';
};

const projectGuidance = (description: string): { needsVerb: boolean; needsNumber: boolean } | null => {
  const text = description.trim();
  if (!text) {
    return null;
  }
  const needsVerb = !startsWithActionVerb(text);
  const needsNumber = !hasNumericIndicator(text);
  if (!needsVerb && !needsNumber) {
    return null;
  }
  return { needsVerb, needsNumber };
};

const uniquePush = (arr: string[], value: string): string[] => {
  const normalized = value.trim();
  if (!normalized) {
    return arr;
  }
  if (arr.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
    return arr;
  }
  return [...arr, normalized];
};

export default function BuilderPage() {
  const [data, setData] = useState<ResumeBuilderData>(() => {
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
  const [skillDrafts, setSkillDrafts] = useState<Record<SkillCategoryKey, string>>({
    technical: '',
    soft: '',
    tools: ''
  });
  const [projectTechDrafts, setProjectTechDrafts] = useState<Record<number, string>>({});
  const [skillSuggestLoading, setSkillSuggestLoading] = useState<boolean>(false);
  const [openProjects, setOpenProjects] = useState<number[]>([0]);

  useEffect(() => {
    saveResumeData(data);
  }, [data]);

  useEffect(() => {
    saveResumeTemplate(template);
  }, [template]);

  const skillsList = useMemo(() => getAllSkills(data), [data]);
  const ats = useMemo(() => computeAtsV1(data), [data]);
  const topImprovements = useMemo(() => computeTopImprovements(data), [data]);
  const previewHasContent = useMemo(() => hasAnyPreviewContent(data), [data]);

  const visibleEducation = useMemo(() => data.education.filter(isEducationVisible), [data.education]);
  const visibleExperience = useMemo(() => data.experience.filter(isExperienceVisible), [data.experience]);
  const visibleProjects = useMemo(() => data.projects.filter(isProjectVisible), [data.projects]);

  const clearEducationEntry = (index: number) => {
    setData({ ...data, education: updateListItem(data.education, index, { school: '', degree: '', year: '' }) });
  };

  const deleteEducationEntry = (index: number) => {
    if (data.education.length === 1) {
      clearEducationEntry(index);
      return;
    }
    setData({ ...data, education: data.education.filter((_, i) => i !== index) });
  };

  const clearExperienceEntry = (index: number) => {
    setData({
      ...data,
      experience: updateListItem(data.experience, index, { company: '', role: '', duration: '', highlights: '' })
    });
  };

  const deleteExperienceEntry = (index: number) => {
    if (data.experience.length === 1) {
      clearExperienceEntry(index);
      return;
    }
    setData({ ...data, experience: data.experience.filter((_, i) => i !== index) });
  };

  const clearProjectEntry = (index: number) => {
    setData({
      ...data,
      projects: updateListItem(data.projects, index, {
        title: '',
        description: '',
        techStack: [],
        liveUrl: '',
        githubUrl: '',
        highlights: ''
      })
    });
  };

  const deleteProjectEntry = (index: number) => {
    if (data.projects.length === 1) {
      clearProjectEntry(index);
      return;
    }
    setData({ ...data, projects: data.projects.filter((_, i) => i !== index) });
    setProjectTechDrafts((prev) => {
      const next: Record<number, string> = {};
      Object.keys(prev).forEach((key) => {
        const current = Number(key);
        if (current < index) {
          next[current] = prev[current] ?? '';
        }
        if (current > index) {
          next[current - 1] = prev[current] ?? '';
        }
      });
      return next;
    });
    setOpenProjects((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
  };

  const addSkill = (category: SkillCategoryKey, rawSkill: string) => {
    const skill = rawSkill.trim();
    if (!skill) {
      return;
    }
    setData({
      ...data,
      skillsByCategory: {
        ...data.skillsByCategory,
        [category]: uniquePush(data.skillsByCategory[category], skill)
      }
    });
    setSkillDrafts({ ...skillDrafts, [category]: '' });
  };

  const removeSkill = (category: SkillCategoryKey, skill: string) => {
    setData({
      ...data,
      skillsByCategory: {
        ...data.skillsByCategory,
        [category]: data.skillsByCategory[category].filter((item) => item !== skill)
      }
    });
  };

  const addProjectTech = (index: number, rawTech: string) => {
    const tech = rawTech.trim();
    if (!tech) {
      return;
    }
    const entry = data.projects[index];
    setData({
      ...data,
      projects: updateListItem(data.projects, index, {
        ...entry,
        techStack: uniquePush(entry.techStack, tech)
      })
    });
    setProjectTechDrafts({ ...projectTechDrafts, [index]: '' });
  };

  const removeProjectTech = (index: number, tech: string) => {
    const entry = data.projects[index];
    setData({
      ...data,
      projects: updateListItem(data.projects, index, {
        ...entry,
        techStack: entry.techStack.filter((item) => item !== tech)
      })
    });
  };

  const toggleProject = (index: number) => {
    setOpenProjects((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const addProjectEntry = () => {
    const nextIndex = data.projects.length;
    setData({
      ...data,
      projects: [...data.projects, { title: '', description: '', techStack: [], liveUrl: '', githubUrl: '', highlights: '' }]
    });
    setOpenProjects((prev) => [...prev, nextIndex]);
  };

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

          <div className="template-tabs" role="tablist" aria-label="Resume template">
            {RESUME_TEMPLATES.map((item) => (
              <button
                key={item}
                type="button"
                className={item === template ? 'template-tab active' : 'template-tab'}
                onClick={() => setTemplate(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
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

            <h3 className="ats-subtitle">Top 3 Improvements</h3>
            {topImprovements.length > 0 ? (
              <ul className="ats-suggestions">
                {topImprovements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="ats-good">No priority improvements right now.</p>
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
              <div className="entry-actions">
                <button type="button" className="danger-button" onClick={() => deleteEducationEntry(index)}>
                  Delete Entry
                </button>
              </div>
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
              <div className="entry-actions">
                <button type="button" className="danger-button" onClick={() => deleteExperienceEntry(index)}>
                  Delete Entry
                </button>
              </div>
              {splitBullets(entry.highlights)
                .map((line) => ({ line, needsVerb: !startsWithActionVerb(line), needsNumber: !hasNumericIndicator(line) }))
                .filter((item) => item.needsVerb || item.needsNumber)
                .length > 0 && (
                <ul className="bullet-guidance">
                  {splitBullets(entry.highlights)
                    .map((line) => ({ line, needsVerb: !startsWithActionVerb(line), needsNumber: !hasNumericIndicator(line) }))
                    .filter((item) => item.needsVerb || item.needsNumber)
                    .map((item, bulletIndex) => (
                      <li key={`${index}-exp-${bulletIndex}`}>
                        <span className="bullet-line">"{item.line}"</span>
                        {item.needsVerb && <span>Start with a strong action verb.</span>}
                        {item.needsNumber && <span>Add measurable impact (numbers).</span>}
                      </li>
                    ))}
                </ul>
              )}
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

          <div className="section-head section-inline-head">
            <h2>Skills</h2>
            <button
              type="button"
              onClick={() => {
                if (skillSuggestLoading) {
                  return;
                }
                setSkillSuggestLoading(true);
                window.setTimeout(() => {
                  setData((prev) => ({
                    ...prev,
                    skillsByCategory: {
                      technical: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'].reduce(
                        (acc, skill) => uniquePush(acc, skill),
                        prev.skillsByCategory.technical
                      ),
                      soft: ['Team Leadership', 'Problem Solving'].reduce(
                        (acc, skill) => uniquePush(acc, skill),
                        prev.skillsByCategory.soft
                      ),
                      tools: ['Git', 'Docker', 'AWS'].reduce(
                        (acc, skill) => uniquePush(acc, skill),
                        prev.skillsByCategory.tools
                      )
                    }
                  }));
                  setSkillSuggestLoading(false);
                }, 1000);
              }}
            >
              {skillSuggestLoading ? 'Suggesting...' : '✨ Suggest Skills'}
            </button>
          </div>

          {CATEGORY_META.map((meta) => (
            <div key={meta.key} className="skill-category-block">
              <h3>{meta.label} ({data.skillsByCategory[meta.key].length})</h3>
              <div className="chip-row">
                {data.skillsByCategory[meta.key].map((skill) => (
                  <span key={`${meta.key}-${skill}`} className="chip">
                    {skill}
                    <button type="button" className="chip-remove" onClick={() => removeSkill(meta.key, skill)}>
                      X
                    </button>
                  </span>
                ))}
              </div>
              <input
                placeholder={`Add ${meta.label}`}
                value={skillDrafts[meta.key]}
                onChange={(e) => setSkillDrafts({ ...skillDrafts, [meta.key]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(meta.key, skillDrafts[meta.key]);
                  }
                }}
              />
            </div>
          ))}

          <div className="section-head section-inline-head">
            <h2>Projects</h2>
            <button type="button" onClick={addProjectEntry}>Add Project</button>
          </div>

          {data.projects.map((entry, index) => {
            const isOpen = openProjects.includes(index);
            const guidance = projectGuidance(entry.description);
            return (
              <article key={`proj-${index}`} className="project-accordion-item">
                <button type="button" className="project-accordion-header" onClick={() => toggleProject(index)}>
                  <span>{entry.title.trim().length > 0 ? entry.title.trim() : `Project ${index + 1}`}</span>
                  <span>{isOpen ? 'Hide' : 'Show'}</span>
                </button>

                {isOpen && (
                  <div className="project-accordion-body">
                    <input
                      placeholder="Project Title"
                      value={entry.title}
                      onChange={(e) =>
                        setData({
                          ...data,
                          projects: updateListItem(data.projects, index, { ...entry, title: e.target.value })
                        })
                      }
                    />

                    <textarea
                      placeholder="Description"
                      maxLength={200}
                      value={entry.description}
                      onChange={(e) =>
                        setData({
                          ...data,
                          projects: updateListItem(data.projects, index, {
                            ...entry,
                            description: e.target.value.slice(0, 200)
                          })
                        })
                      }
                    />
                    <div className="counter-row">{entry.description.length}/200</div>

                    {guidance && (
                      <ul className="bullet-guidance">
                        {guidance.needsVerb && <li>Start with a strong action verb.</li>}
                        {guidance.needsNumber && <li>Add measurable impact (numbers).</li>}
                      </ul>
                    )}

                    <div className="chip-row">
                      {entry.techStack.map((tech) => (
                        <span key={`${index}-${tech}`} className="chip">
                          {tech}
                          <button type="button" className="chip-remove" onClick={() => removeProjectTech(index, tech)}>
                            X
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      placeholder="Tech Stack (press Enter)"
                      value={projectTechDrafts[index] ?? ''}
                      onChange={(e) => setProjectTechDrafts({ ...projectTechDrafts, [index]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addProjectTech(index, projectTechDrafts[index] ?? '');
                        }
                      }}
                    />

                    <input
                      placeholder="Live URL (optional)"
                      value={entry.liveUrl}
                      onChange={(e) =>
                        setData({
                          ...data,
                          projects: updateListItem(data.projects, index, { ...entry, liveUrl: e.target.value })
                        })
                      }
                    />
                    <input
                      placeholder="GitHub URL (optional)"
                      value={entry.githubUrl}
                      onChange={(e) =>
                        setData({
                          ...data,
                          projects: updateListItem(data.projects, index, { ...entry, githubUrl: e.target.value })
                        })
                      }
                    />

                    <div className="entry-actions">
                      <button type="button" className="danger-button" onClick={() => deleteProjectEntry(index)}>
                        Delete Entry
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

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

          <div className={`resume-shell template-${template}`}>
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
                    <div className="project-card-list">
                      {visibleProjects.map((entry, index) => (
                        <article key={`prev-proj-${index}`} className="project-card">
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
                            {entry.liveUrl.trim().length > 0 && <a href={entry.liveUrl.trim()} target="_blank" rel="noreferrer">↗ Live</a>}
                            {entry.githubUrl.trim().length > 0 && <a href={entry.githubUrl.trim()} target="_blank" rel="noreferrer">⌘ Code</a>}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {skillsList.length > 0 && (
                  <section>
                    <h4>Skills</h4>
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
