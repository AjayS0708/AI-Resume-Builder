export type PersonalInfo = {
  name: string;
  email: string;
  phone: string;
  location: string;
};

export type EducationEntry = {
  school: string;
  degree: string;
  year: string;
};

export type ExperienceEntry = {
  company: string;
  role: string;
  duration: string;
  highlights: string;
};

export type ProjectEntry = {
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  highlights: string;
};

export type SkillsByCategory = {
  technical: string[];
  soft: string[];
  tools: string[];
};

export type ResumeBuilderData = {
  personal: PersonalInfo;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skillsByCategory: SkillsByCategory;
  skills: string;
  github: string;
  linkedin: string;
};

export type AtsResult = {
  score: number;
  suggestions: string[];
  allCriteriaMet: boolean;
};

export type ResumeTemplate = 'classic' | 'modern' | 'minimal';

export const RESUME_STORAGE_KEY = 'resumeBuilderData';
export const RESUME_TEMPLATE_KEY = 'resumeTemplateChoice';
export const RESUME_TEMPLATES: ResumeTemplate[] = ['classic', 'modern', 'minimal'];

export const createEmptyResumeData = (): ResumeBuilderData => ({
  personal: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [{ school: '', degree: '', year: '' }],
  experience: [{ company: '', role: '', duration: '', highlights: '' }],
  projects: [{ title: '', description: '', techStack: [], liveUrl: '', githubUrl: '', highlights: '' }],
  skillsByCategory: { technical: [], soft: [], tools: [] },
  skills: '',
  github: '',
  linkedin: ''
});

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item ?? '').trim()).filter(Boolean);
};

const normalizeEducation = (raw: unknown): EducationEntry[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ school: '', degree: '', year: '' }];
  }
  return raw.map((item) => ({
    school: typeof item === 'object' && item !== null && 'school' in item ? String((item as { school?: unknown }).school ?? '') : '',
    degree: typeof item === 'object' && item !== null && 'degree' in item ? String((item as { degree?: unknown }).degree ?? '') : '',
    year: typeof item === 'object' && item !== null && 'year' in item ? String((item as { year?: unknown }).year ?? '') : ''
  }));
};

const normalizeExperience = (raw: unknown): ExperienceEntry[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ company: '', role: '', duration: '', highlights: '' }];
  }
  return raw.map((item) => ({
    company: typeof item === 'object' && item !== null && 'company' in item ? String((item as { company?: unknown }).company ?? '') : '',
    role: typeof item === 'object' && item !== null && 'role' in item ? String((item as { role?: unknown }).role ?? '') : '',
    duration: typeof item === 'object' && item !== null && 'duration' in item ? String((item as { duration?: unknown }).duration ?? '') : '',
    highlights: typeof item === 'object' && item !== null && 'highlights' in item ? String((item as { highlights?: unknown }).highlights ?? '') : ''
  }));
};

const normalizeProjects = (raw: unknown): ProjectEntry[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ title: '', description: '', techStack: [], liveUrl: '', githubUrl: '', highlights: '' }];
  }
  return raw.map((item) => {
    const legacy = (typeof item === 'object' && item !== null ? item : {}) as {
      title?: unknown;
      name?: unknown;
      description?: unknown;
      techStack?: unknown;
      liveUrl?: unknown;
      githubUrl?: unknown;
      highlights?: unknown;
    };

    return {
      title: String(legacy.title ?? legacy.name ?? ''),
      description: String(legacy.description ?? ''),
      techStack: normalizeStringArray(legacy.techStack),
      liveUrl: String(legacy.liveUrl ?? ''),
      githubUrl: String(legacy.githubUrl ?? ''),
      highlights: String(legacy.highlights ?? '')
    };
  });
};

const normalizeSkillsByCategory = (raw: unknown, fallbackSkills: string): SkillsByCategory => {
  const parsed = (typeof raw === 'object' && raw !== null ? raw : {}) as {
    technical?: unknown;
    soft?: unknown;
    tools?: unknown;
  };

  const technical = normalizeStringArray(parsed.technical);
  const soft = normalizeStringArray(parsed.soft);
  const tools = normalizeStringArray(parsed.tools);

  if (technical.length === 0 && soft.length === 0 && tools.length === 0) {
    return {
      technical: fallbackSkills.split(',').map((item) => item.trim()).filter(Boolean),
      soft: [],
      tools: []
    };
  }

  return { technical, soft, tools };
};

export const normalizeResumeData = (input: unknown): ResumeBuilderData => {
  if (typeof input !== 'object' || input === null) {
    return createEmptyResumeData();
  }

  const raw = input as Partial<ResumeBuilderData>;
  const legacySkills = String(raw.skills ?? '');

  return {
    personal: {
      name: String(raw.personal?.name ?? ''),
      email: String(raw.personal?.email ?? ''),
      phone: String(raw.personal?.phone ?? ''),
      location: String(raw.personal?.location ?? '')
    },
    summary: String(raw.summary ?? ''),
    education: normalizeEducation(raw.education),
    experience: normalizeExperience(raw.experience),
    projects: normalizeProjects(raw.projects),
    skillsByCategory: normalizeSkillsByCategory(raw.skillsByCategory, legacySkills),
    skills: legacySkills,
    github: String(raw.github ?? ''),
    linkedin: String(raw.linkedin ?? '')
  };
};

export const loadResumeData = (): ResumeBuilderData => {
  const raw = localStorage.getItem(RESUME_STORAGE_KEY);
  if (!raw) {
    return createEmptyResumeData();
  }

  try {
    return normalizeResumeData(JSON.parse(raw));
  } catch {
    return createEmptyResumeData();
  }
};

export const saveResumeData = (data: ResumeBuilderData): void => {
  localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(data));
};

const normalizeTemplate = (value: unknown): ResumeTemplate => {
  if (value === 'classic' || value === 'modern' || value === 'minimal') {
    return value;
  }
  return 'classic';
};

export const loadResumeTemplate = (): ResumeTemplate => {
  return normalizeTemplate(localStorage.getItem(RESUME_TEMPLATE_KEY));
};

export const saveResumeTemplate = (template: ResumeTemplate): void => {
  localStorage.setItem(RESUME_TEMPLATE_KEY, template);
};

export const splitBullets = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export const splitDescriptionPoints = (text: string): string[] => {
  return text
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `${part}.`);
};

export const getAllSkills = (data: ResumeBuilderData): string[] => {
  const categorySkills = [
    ...data.skillsByCategory.technical,
    ...data.skillsByCategory.soft,
    ...data.skillsByCategory.tools
  ];
  const legacySkills = data.skills.split(',').map((item) => item.trim()).filter(Boolean);
  const combined = [...categorySkills, ...legacySkills];
  return Array.from(new Set(combined.map((item) => item.trim()).filter(Boolean)));
};

const countWords = (text: string): number =>
  text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;

const hasMeaningfulExperience = (entry: ExperienceEntry): boolean =>
  [entry.company, entry.role, entry.duration, entry.highlights].some((value) => value.trim().length > 0);

const hasMeaningfulProject = (entry: ProjectEntry): boolean =>
  [entry.title, entry.description, entry.liveUrl, entry.githubUrl, entry.highlights]
    .some((value) => value.trim().length > 0) || entry.techStack.length > 0;

const hasCompleteEducation = (entry: EducationEntry): boolean =>
  entry.school.trim().length > 0 && entry.degree.trim().length > 0 && entry.year.trim().length > 0;

const containsNumericImpact = (text: string): boolean => /(\d+\s?%|\b\d+\b|\d+[xX]|\d+\s?[kK])/.test(text);

const ACTION_VERBS = [
  'Built',
  'Developed',
  'Designed',
  'Implemented',
  'Led',
  'Improved',
  'Created',
  'Optimized',
  'Automated'
];

export const startsWithActionVerb = (line: string): boolean => {
  const trimmed = line.trim();
  return ACTION_VERBS.some((verb) => trimmed.startsWith(`${verb} `) || trimmed === verb);
};

export const hasNumericIndicator = (line: string): boolean => containsNumericImpact(line);

export const computeAtsV1 = (data: ResumeBuilderData): AtsResult => {
  const summaryWords = countWords(data.summary);
  const projectEntries = data.projects.filter(hasMeaningfulProject);
  const experienceEntries = data.experience.filter(hasMeaningfulExperience);
  const skillsItems = getAllSkills(data);
  const hasLink = data.github.trim().length > 0 || data.linkedin.trim().length > 0;
  const completeEducation = data.education.some(hasCompleteEducation);

  const impactLines = [
    ...experienceEntries.flatMap((entry) => splitBullets(entry.highlights)),
    ...projectEntries.map((entry) => entry.description.trim()),
    ...projectEntries.flatMap((entry) => splitBullets(entry.highlights))
  ].filter(Boolean);
  const hasImpactNumbers = impactLines.some(containsNumericImpact);

  let score = 0;
  if (summaryWords >= 40 && summaryWords <= 120) {
    score += 15;
  }
  if (projectEntries.length >= 2) {
    score += 10;
  }
  if (experienceEntries.length >= 1) {
    score += 10;
  }
  if (skillsItems.length >= 8) {
    score += 10;
  }
  if (hasLink) {
    score += 10;
  }
  if (hasImpactNumbers) {
    score += 15;
  }
  if (completeEducation) {
    score += 10;
  }

  const suggestions: string[] = [];
  if (!(summaryWords >= 40 && summaryWords <= 120)) {
    suggestions.push('Write a stronger summary (40-120 words).');
  }
  if (projectEntries.length < 2) {
    suggestions.push('Add at least 2 projects.');
  }
  if (!hasImpactNumbers) {
    suggestions.push('Add measurable impact (numbers) in bullets.');
  }
  if (skillsItems.length < 8) {
    suggestions.push('Add more skills (target 8+).');
  }
  if (!hasLink) {
    suggestions.push('Add GitHub or LinkedIn link.');
  }

  return {
    score: Math.min(100, score),
    suggestions: suggestions.slice(0, 3),
    allCriteriaMet: suggestions.length === 0
  };
};

export const hasAnyPreviewContent = (data: ResumeBuilderData): boolean => {
  const hasPersonal = [data.personal.name, data.personal.email, data.personal.phone, data.personal.location]
    .some((value) => value.trim().length > 0);
  const hasSummary = data.summary.trim().length > 0;
  const hasEducation = data.education.some((entry) => [entry.school, entry.degree, entry.year].some((value) => value.trim().length > 0));
  const hasExperience = data.experience.some(hasMeaningfulExperience);
  const hasProjects = data.projects.some(hasMeaningfulProject);
  const hasSkills = getAllSkills(data).length > 0;
  const hasLinks = data.github.trim().length > 0 || data.linkedin.trim().length > 0;

  return hasPersonal || hasSummary || hasEducation || hasExperience || hasProjects || hasSkills || hasLinks;
};

export const computeTopImprovements = (data: ResumeBuilderData): string[] => {
  const summaryWords = countWords(data.summary);
  const projectEntries = data.projects.filter(hasMeaningfulProject);
  const experienceEntries = data.experience.filter(hasMeaningfulExperience);
  const skillsItems = getAllSkills(data);
  const impactLines = [
    ...experienceEntries.flatMap((entry) => splitBullets(entry.highlights)),
    ...projectEntries.map((entry) => entry.description.trim()),
    ...projectEntries.flatMap((entry) => splitBullets(entry.highlights))
  ].filter(Boolean);
  const hasImpactNumbers = impactLines.some(containsNumericImpact);

  const items: string[] = [];
  if (projectEntries.length < 2) {
    items.push('Add at least 2 projects.');
  }
  if (!hasImpactNumbers) {
    items.push('Add measurable impact (numbers) in bullets.');
  }
  if (summaryWords < 40) {
    items.push('Expand summary to at least 40 words.');
  }
  if (skillsItems.length < 8) {
    items.push('Add more skills (target 8+).');
  }
  if (experienceEntries.length === 0) {
    items.push('Add internship or project-based experience.');
  }
  return items.slice(0, 3);
};
