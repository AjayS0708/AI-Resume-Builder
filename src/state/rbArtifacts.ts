import { RB_STEPS } from '../config/rbSteps';

const keyFor = (index: number): string => `rb_step_${index}_artifact`;

export const rbArtifacts = {
  keyFor,
  read(index: number): string {
    return localStorage.getItem(keyFor(index)) ?? '';
  },
  write(index: number, value: string): void {
    const trimmed = value.trim();
    if (!trimmed) {
      localStorage.removeItem(keyFor(index));
      return;
    }
    localStorage.setItem(keyFor(index), trimmed);
  },
  has(index: number): boolean {
    return this.read(index).length > 0;
  },
  canOpen(index: number): boolean {
    if (index <= 1) {
      return true;
    }
    return this.has(index - 1);
  },
  completedCount(): number {
    return RB_STEPS.filter((step) => this.has(step.index)).length;
  }
};