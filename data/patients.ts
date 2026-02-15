export const STAGES = [
  'ORTHO PLANNED',
  'CONSULT SCHEDULED',
  'CONSULT COMPLETED (FINANCIAL PRESENTED)',
  'PENDING DECISION',
  'STARTED',
  'NOT NOW (REVISIT)',
  'LOST'
] as const;

export type Stage = (typeof STAGES)[number];
export type Office = 'Smyrna' | 'Nashville' | 'Nolensville';

export type FollowUpTask = {
  id: string;
  dueDate: string;
  label: 'Day 3' | 'Day 7' | 'Day 14';
  completed: boolean;
};

export type ContactLog = {
  id: string;
  date: string;
  type: 'call' | 'text';
  note: string;
};

export type Patient = {
  id: string;
  name: string;
  office: Office;
  referringGP: string;
  stage: Stage;
  caseValue: number;
  downPayment?: number;
  monthlyPayment?: number;
  clearanceStatus: string;
  consultDate?: string;
  startDate?: string;
  revisitDate?: string;
  lastContactDate: string;
  nextFollowUpDate?: string;
  tags: string[];
  notes: string;
  followUpTasks: FollowUpTask[];
  contactLog: ContactLog[];
};

const d = (isoDate: string, time = '14:00:00') => `${isoDate}T${time}.000Z`;

export const samplePatients: Patient[] = [
  {
    id: 'p1',
    name: 'Maria Lopez',
    office: 'Smyrna',
    referringGP: 'Dr. Kevin',
    stage: 'ORTHO PLANNED',
    caseValue: 5800,
    clearanceStatus: 'Cleared',
    lastContactDate: d('2026-02-15'),
    tags: ['Cleared'],
    notes: 'Ready to book consult at preferred afternoon times.',
    followUpTasks: [],
    contactLog: [{ id: 'c1', date: d('2026-02-15'), type: 'text', note: 'Sent intro and next steps.' }]
  },
  {
    id: 'p2',
    name: 'Ethan Miller',
    office: 'Nolensville',
    referringGP: 'Dr. Matthew',
    stage: 'ORTHO PLANNED',
    caseValue: 6200,
    clearanceStatus: 'Needs 1 Filling',
    lastContactDate: d('2026-02-11'),
    nextFollowUpDate: '2026-02-17',
    tags: ['Needs 1 Filling'],
    notes: 'Pending restorative clearance before consult scheduling.',
    followUpTasks: [],
    contactLog: [{ id: 'c2', date: d('2026-02-11'), type: 'call', note: 'Reviewed filling completion timeline.' }]
  },
  {
    id: 'p3',
    name: 'Sofia Ramirez',
    office: 'Nashville',
    referringGP: 'Dr. Kevin',
    stage: 'CONSULT SCHEDULED',
    caseValue: 5400,
    downPayment: 500,
    clearanceStatus: 'Cleared',
    consultDate: '2026-02-20',
    lastContactDate: d('2026-02-14'),
    tags: ['Down $500'],
    notes: 'Confirmed consult reminder text 24h prior.',
    followUpTasks: [],
    contactLog: [{ id: 'c3', date: d('2026-02-14'), type: 'text', note: 'Consult reminder sent.' }]
  },
  {
    id: 'p4',
    name: 'Jacob Tran',
    office: 'Smyrna',
    referringGP: 'Dr. Ashley',
    stage: 'CONSULT SCHEDULED',
    caseValue: 6100,
    clearanceStatus: 'Cleared',
    consultDate: '2026-02-22',
    lastContactDate: d('2026-02-10'),
    nextFollowUpDate: '2026-02-18',
    tags: ['Needs translator support'],
    notes: 'Family requests evening slot.',
    followUpTasks: [],
    contactLog: [{ id: 'c4', date: d('2026-02-10'), type: 'call', note: 'Confirmed transportation needs.' }]
  },
  {
    id: 'p5',
    name: 'Liam Johnson',
    office: 'Smyrna',
    referringGP: 'Dr. Kevin',
    stage: 'CONSULT COMPLETED (FINANCIAL PRESENTED)',
    caseValue: 6000,
    downPayment: 500,
    monthlyPayment: 200,
    clearanceStatus: 'Cleared',
    consultDate: '2026-02-05',
    lastContactDate: d('2026-02-07'),
    nextFollowUpDate: '2026-02-19',
    tags: ['Financials presented'],
    notes: 'Comparing payment options with parent.',
    followUpTasks: [
      { id: 'f1', dueDate: '2026-02-08', label: 'Day 3', completed: true },
      { id: 'f2', dueDate: '2026-02-12', label: 'Day 7', completed: true },
      { id: 'f3', dueDate: '2026-02-19', label: 'Day 14', completed: false }
    ],
    contactLog: [{ id: 'c5', date: d('2026-02-07'), type: 'call', note: 'Followed up on financing questions.' }]
  },
  {
    id: 'p6',
    name: 'Valeria Cruz',
    office: 'Nolensville',
    referringGP: 'Dr. Matthew',
    stage: 'CONSULT COMPLETED (FINANCIAL PRESENTED)',
    caseValue: 5700,
    downPayment: 500,
    clearanceStatus: 'Cleared',
    consultDate: '2026-02-08',
    lastContactDate: d('2026-02-11'),
    tags: ['Day 3 complete'],
    notes: 'Wants to align start date with spring break.',
    followUpTasks: [
      { id: 'f4', dueDate: '2026-02-11', label: 'Day 3', completed: true },
      { id: 'f5', dueDate: '2026-02-15', label: 'Day 7', completed: false },
      { id: 'f6', dueDate: '2026-02-22', label: 'Day 14', completed: false }
    ],
    contactLog: [{ id: 'c6', date: d('2026-02-11'), type: 'text', note: 'Shared payment plan summary.' }]
  },
  {
    id: 'p7',
    name: 'Noah Patel',
    office: 'Nashville',
    referringGP: 'Dr. Priya',
    stage: 'PENDING DECISION',
    caseValue: 6300,
    clearanceStatus: 'Cleared',
    consultDate: '2026-01-28',
    lastContactDate: d('2026-01-31'),
    tags: ['Discussing with spouse'],
    notes: 'Needs one more insurance verification check.',
    followUpTasks: [],
    contactLog: [{ id: 'c7', date: d('2026-01-31'), type: 'call', note: 'Requested callback next week.' }]
  },
  {
    id: 'p8',
    name: 'Isabella Nguyen',
    office: 'Smyrna',
    referringGP: 'Dr. Kevin',
    stage: 'PENDING DECISION',
    caseValue: 5500,
    clearanceStatus: 'Cleared',
    consultDate: '2026-02-10',
    lastContactDate: d('2026-02-12'),
    tags: ['Financial hesitation'],
    notes: 'Requested lower monthly payment scenario.',
    followUpTasks: [],
    contactLog: [{ id: 'c8', date: d('2026-02-12'), type: 'text', note: 'Sent adjusted finance estimate.' }]
  },
  {
    id: 'p9',
    name: 'Camila Torres',
    office: 'Smyrna',
    referringGP: 'Dr. Ashley',
    stage: 'STARTED',
    caseValue: 5900,
    downPayment: 500,
    monthlyPayment: 210,
    clearanceStatus: 'Cleared',
    consultDate: '2026-02-04',
    startDate: '2026-02-12',
    lastContactDate: d('2026-02-13'),
    tags: ['Autopay active', 'Down $500 collected'],
    notes: 'Records transferred to active ortho roster.',
    followUpTasks: [],
    contactLog: [{ id: 'c9', date: d('2026-02-13'), type: 'text', note: 'Welcome packet sent.' }]
  },
  {
    id: 'p10',
    name: 'Mason Clark',
    office: 'Nashville',
    referringGP: 'Dr. Matthew',
    stage: 'STARTED',
    caseValue: 6100,
    downPayment: 600,
    monthlyPayment: 190,
    clearanceStatus: 'Cleared',
    consultDate: '2026-01-27',
    startDate: '2026-02-03',
    lastContactDate: d('2026-02-10'),
    tags: ['Active Month 1'],
    notes: 'No additional follow-up required in conversion board.',
    followUpTasks: [],
    contactLog: [{ id: 'c10', date: d('2026-02-10'), type: 'call', note: 'Month 1 check-in complete.' }]
  },
  {
    id: 'p11',
    name: 'Ava Hernandez',
    office: 'Smyrna',
    referringGP: 'Dr. Kevin',
    stage: 'NOT NOW (REVISIT)',
    caseValue: 5300,
    clearanceStatus: 'Cleared',
    revisitDate: '2026-06-15',
    lastContactDate: d('2026-02-09'),
    tags: ['Sports season'],
    notes: 'Revisit after softball season ends.',
    followUpTasks: [],
    contactLog: [{ id: 'c11', date: d('2026-02-09'), type: 'text', note: 'Set revisit reminder for June.' }]
  },
  {
    id: 'p12',
    name: 'Owen Brooks',
    office: 'Nolensville',
    referringGP: 'Dr. Priya',
    stage: 'LOST',
    caseValue: 6000,
    clearanceStatus: 'Cleared',
    lastContactDate: d('2026-02-01'),
    tags: ['Price shopping'],
    notes: 'Chose outside provider due to lower monthly payment.',
    followUpTasks: [],
    contactLog: [{ id: 'c12', date: d('2026-02-01'), type: 'call', note: 'Confirmed declined treatment start.' }]
  },
  {
    id: 'p13',
    name: 'Harper Davis',
    office: 'Nashville',
    referringGP: 'Dr. Kevin',
    stage: 'ORTHO PLANNED',
    caseValue: 6400,
    clearanceStatus: 'Cleared',
    lastContactDate: d('2026-02-02'),
    nextFollowUpDate: '2026-02-16',
    tags: ['Missing consult date'],
    notes: 'Patient requested Saturday consult options.',
    followUpTasks: [],
    contactLog: [{ id: 'c13', date: d('2026-02-02'), type: 'text', note: 'Asked for weekend availability.' }]
  },
  {
    id: 'p14',
    name: 'Elijah Reed',
    office: 'Smyrna',
    referringGP: 'Dr. Ashley',
    stage: 'PENDING DECISION',
    caseValue: 5600,
    clearanceStatus: 'Needs 1 Filling',
    consultDate: '2026-02-01',
    lastContactDate: d('2026-02-06'),
    nextFollowUpDate: '2026-02-16',
    tags: ['Red aging'],
    notes: 'Needs filling before final commitment.',
    followUpTasks: [],
    contactLog: [{ id: 'c14', date: d('2026-02-06'), type: 'call', note: 'Waiting on restorative appointment.' }]
  }
];
