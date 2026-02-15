import { Patient, Stage } from '@/data/patients';

export type AgingBand = 'Green' | 'Orange' | 'Red' | 'DarkRed';

export const STAGE_TO_METRIC: Record<Stage, string> = {
  'ORTHO PLANNED': 'Ortho Planned',
  'CONSULT SCHEDULED': 'Consult Scheduled',
  'CONSULT COMPLETED (FINANCIAL PRESENTED)': 'Consult Completed / Financial Presented',
  'PENDING DECISION': 'Pending Decision',
  STARTED: 'Started',
  'NOT NOW (REVISIT)': 'Not Now (Revisit)',
  LOST: 'Lost'
};

export const getDaysSince = (dateStr: string, today: Date) => {
  const ms = today.getTime() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

export const getAgingBand = (daysSince: number): AgingBand => {
  if (daysSince <= 2) return 'Green';
  if (daysSince <= 6) return 'Orange';
  if (daysSince <= 13) return 'Red';
  return 'DarkRed';
};

export const agingClass: Record<AgingBand, string> = {
  Green: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Orange: 'bg-orange-100 text-orange-800 border-orange-300',
  Red: 'bg-rose-100 text-rose-800 border-rose-300',
  DarkRed: 'bg-red-200 text-red-950 border-red-400'
};

export const fmtMoney = (value?: number) => (value ? `$${value.toLocaleString()}` : '—');

export const createFollowUps = (anchor: Date) => {
  const addDays = (days: number) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  return [
    { id: crypto.randomUUID(), dueDate: addDays(3), label: 'Day 3' as const, completed: false },
    { id: crypto.randomUUID(), dueDate: addDays(7), label: 'Day 7' as const, completed: false },
    { id: crypto.randomUUID(), dueDate: addDays(14), label: 'Day 14' as const, completed: false }
  ];
};

export const markNextFollowUpDone = (patient: Patient) => {
  const idx = patient.followUpTasks.findIndex((t) => !t.completed);
  if (idx === -1) return patient.followUpTasks;

  return patient.followUpTasks.map((task, i) => (i === idx ? { ...task, completed: true } : task));
};
