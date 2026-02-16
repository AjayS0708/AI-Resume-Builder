import { useMemo, useState } from 'react';

type PersonalInfo = {
  name: string;
  email: string;
  phone: string;
  location: string;
};

type EducationEntry = {
  school: string;
  degree: string;
  year: string;
};

type ExperienceEntry = {
  company: string;
  role: string;
  duration: string;
};

type ProjectEntry = {
  name: string;
  description: string;
};

type BuilderData = {
  personal: PersonalInfo;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string;
  github: string;
  linkedin: string;
};

const emptyData = (): BuilderData => ({
  personal: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [{ school: '', degree: '', year: '' }],
  experience: [{ company: '', role: '', duration: '' }],
  projects: [{ name: '', description: '' }],
  skills: '',
  github: '',
  linkedin: ''
});

const sampleData = (): BuilderData => ({
  personal: {
    name: 'Alex Carter',
    email: 'alex.carter@email.com',
    phone: '+1 (555) 100-2000',
    location: 'Austin, TX'
  },
  summary: 'Product-focused software engineer with strong ownership across frontend and backend delivery.',
  education: [{ school: 'State University', degree: 'B.S. Computer Science', year: '2024' }],
  experience: [{ company: 'Nexa Labs', role: 'Software Engineer', duration: '2024 - Present' }],
  projects: [{ name: 'Portfolio Platform', description: 'Built modular web experience for client showcases.' }],
  skills: 'React, TypeScript, Node.js, SQL, Git',
  github: 'https://github.com/example',
  linkedin: 'https://linkedin.com/in/example'
});

const updateListItem = <T,>(items: T[], index: number, next: T): T[] =>
  items.map((item, i) => (i === index ? next : item));

export default function BuilderPage() {
  const [data, setData] = useState<BuilderData>(emptyData);

  const skillsList = useMemo(
    () => data.skills.split(',').map((item) => item.trim()).filter(Boolean),
    [data.skills]
  );

  return (
    <main className="page page-builder">
      <section className="builder-grid">
        <section className="builder-form-card">
          <div className="section-head">
            <h1>Resume Builder</h1>
            <button type="button" onClick={() => setData(sampleData())}>Load Sample Data</button>
          </div>

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
            </div>
          ))}
          <button
            type="button"
            className="ghost-button"
            onClick={() => setData({ ...data, experience: [...data.experience, { company: '', role: '', duration: '' }] })}
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
            </div>
          ))}
          <button
            type="button"
            className="ghost-button"
            onClick={() => setData({ ...data, projects: [...data.projects, { name: '', description: '' }] })}
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
            <section>
              <h3>{data.personal.name || 'Your Name'}</h3>
              <p>
                {data.personal.email || 'email@example.com'} | {data.personal.phone || '+1 (000) 000-0000'} |{' '}
                {data.personal.location || 'City, Country'}
              </p>
            </section>

            <section>
              <h4>Summary</h4>
              <p>{data.summary || 'Summary placeholder for live structured layout.'}</p>
            </section>

            <section>
              <h4>Education</h4>
              {data.education.map((entry, index) => (
                <p key={`prev-edu-${index}`}>
                  {(entry.degree || 'Degree')} - {(entry.school || 'School')} ({entry.year || 'Year'})
                </p>
              ))}
            </section>

            <section>
              <h4>Experience</h4>
              {data.experience.map((entry, index) => (
                <p key={`prev-exp-${index}`}>
                  {(entry.role || 'Role')} - {(entry.company || 'Company')} ({entry.duration || 'Duration'})
                </p>
              ))}
            </section>

            <section>
              <h4>Projects</h4>
              {data.projects.map((entry, index) => (
                <p key={`prev-proj-${index}`}>
                  {(entry.name || 'Project Name')}: {entry.description || 'Project description placeholder.'}
                </p>
              ))}
            </section>

            <section>
              <h4>Skills</h4>
              <p>{skillsList.length > 0 ? skillsList.join(', ') : 'Skills placeholder.'}</p>
            </section>

            <section>
              <h4>Links</h4>
              <p>GitHub: {data.github || 'github.com/username'}</p>
              <p>LinkedIn: {data.linkedin || 'linkedin.com/in/username'}</p>
            </section>
          </div>
        </aside>
      </section>
    </main>
  );
}