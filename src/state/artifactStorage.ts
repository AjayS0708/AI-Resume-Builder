import { RB_STEPS } from '../config/rbSteps';

const storageKeyFor = (index: number): string => `rb_step_${index}_artifact`;

export const artifactStorage = {
  keyFor: storageKeyFor,
  read(index: number): string {
    return localStorage.getItem(storageKeyFor(index)) ?? '';
  },
  write(index: number, value: string): void {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      localStorage.removeItem(storageKeyFor(index));
      return;
    }
    localStorage.setItem(storageKeyFor(index), trimmed);
  },
  has(index: number): boolean {
    return this.read(index).length > 0;
  },
  completedCount(): number {
    return RB_STEPS.filter((step) => this.has(step.index)).length;
  },
  firstLockedStep(): number {
    for (const step of RB_STEPS) {
      if (!this.has(step.index)) {
        return step.index;
      }
    }
    return RB_STEPS.length;
  },
  canOpen(index: number): boolean {
    if (index <= 1) {
      return true;
    }
    return this.has(index - 1);
  }
};
