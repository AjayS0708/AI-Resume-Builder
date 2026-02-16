import { RB_STEPS } from '../config/rbSteps';

const keyFor = (index: number): string => `rb_step_${index}_artifact`;
const FINAL_SUBMISSION_KEY = 'rb_final_submission';

const hasCompletedChecklist = (): boolean => {
  try {
    const raw = localStorage.getItem(FINAL_SUBMISSION_KEY);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw) as { checklist?: unknown };
    if (!Array.isArray(parsed.checklist)) {
      return false;
    }
    return parsed.checklist.length >= 10 && parsed.checklist.every(Boolean);
  } catch {
    return false;
  }
};

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
    if (index === 8) {
      return this.has(index - 1) && hasCompletedChecklist();
    }
    return this.has(index - 1);
  },
  completedCount(): number {
    return RB_STEPS.filter((step) => this.has(step.index)).length;
  }
};
