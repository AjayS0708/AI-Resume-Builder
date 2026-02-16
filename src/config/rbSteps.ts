export type RbStep = {
  index: number;
  route: string;
  title: string;
};

export const RB_STEPS: RbStep[] = [
  { index: 1, route: '/rb/01-problem', title: 'Problem' },
  { index: 2, route: '/rb/02-market', title: 'Market' },
  { index: 3, route: '/rb/03-architecture', title: 'Architecture' },
  { index: 4, route: '/rb/04-hld', title: 'HLD' },
  { index: 5, route: '/rb/05-lld', title: 'LLD' },
  { index: 6, route: '/rb/06-build', title: 'Build' },
  { index: 7, route: '/rb/07-test', title: 'Test' },
  { index: 8, route: '/rb/08-ship', title: 'Ship' }
];