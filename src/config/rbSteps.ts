export type BuildStep = {
  index: number;
  slug: string;
  route: string;
  title: string;
  prompt: string;
};

export const RB_STEPS: BuildStep[] = [
  {
    index: 1,
    slug: '01-problem',
    route: '/rb/01-problem',
    title: 'Problem Definition',
    prompt: 'Define the exact problem statement, target user, and measurable outcome for this build step.'
  },
  {
    index: 2,
    slug: '02-market',
    route: '/rb/02-market',
    title: 'Market Framing',
    prompt: 'Document the market need, alternatives, and differentiation assumptions with concise evidence.'
  },
  {
    index: 3,
    slug: '03-architecture',
    route: '/rb/03-architecture',
    title: 'Architecture',
    prompt: 'Outline system boundaries, key components, data flow, and tradeoffs at architecture level.'
  },
  {
    index: 4,
    slug: '04-hld',
    route: '/rb/04-hld',
    title: 'High Level Design',
    prompt: 'Describe modules, interfaces, and ownership at high-level design granularity.'
  },
  {
    index: 5,
    slug: '05-lld',
    route: '/rb/05-lld',
    title: 'Low Level Design',
    prompt: 'Define data models, endpoint contracts, validations, and implementation constraints.'
  },
  {
    index: 6,
    slug: '06-build',
    route: '/rb/06-build',
    title: 'Build',
    prompt: 'Convert the plan into actionable build tasks, acceptance criteria, and execution sequence.'
  },
  {
    index: 7,
    slug: '07-test',
    route: '/rb/07-test',
    title: 'Test',
    prompt: 'Specify test strategy, test cases, failure handling, and quality gates for release readiness.'
  },
  {
    index: 8,
    slug: '08-ship',
    route: '/rb/08-ship',
    title: 'Ship',
    prompt: 'Define deployment checklist, rollback criteria, and launch validation signals.'
  }
];

export const RB_PROOF_ROUTE = '/rb/proof';
