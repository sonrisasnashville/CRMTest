'use client';

import { useEffect, useMemo, useState } from 'react';
import { Patient, STAGES, Stage, samplePatients } from '@/data/patients';
import { agingClass, createFollowUps, fmtMoney, getAgingBand, getDaysSince, markNextFollowUpDone } from '@/lib/crm';

const STORAGE_KEY = 'tc-ortho-crm-state-v1';
const DEMO_TODAY = '2026-02-15T12:00:00.000Z';

export default function Page() {
  const [patients, setPatients] = useState<Patient[]>(samplePatients);
  const [search, setSearch] = useState('');
  const [officeFilter, setOfficeFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [agingFilter, setAgingFilter] = useState('All');
  const [month, setMonth] = useState('Feb 2026');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [useDemoDate, setUseDemoDate] = useState(true);

  const today = useMemo(() => (useDemoDate ? new Date(DEMO_TODAY) : new Date()), [useDemoDate]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setPatients(JSON.parse(raw));
      } catch {
        setPatients(samplePatients);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  const selectedPatient = patients.find((p) => p.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const days = getDaysSince(p.lastContactDate, today);
      const band = getAgingBand(days);

      return (
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (officeFilter === 'All' || p.office === officeFilter) &&
        (stageFilter === 'All' || p.stage === stageFilter) &&
        (agingFilter === 'All' || band === agingFilter)
      );
    });
  }, [patients, search, officeFilter, stageFilter, agingFilter, today]);

  const kpis = useMemo(() => {
    const byStage = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
    filtered.forEach((p) => {
      byStage[p.stage] += 1;
    });

    const started = byStage.STARTED;
    const consultCompleted = byStage['CONSULT COMPLETED (FINANCIAL PRESENTED)'];
    const conversionRate = consultCompleted ? ((started / consultCompleted) * 100).toFixed(1) : '0.0';

    const startedWithConsult = filtered.filter((p) => p.stage === 'STARTED' && p.consultDate);
    const avgDays = startedWithConsult.length
      ? (
          startedWithConsult.reduce((sum, p) => sum + getDaysSince(`${p.consultDate}T12:00:00.000Z`, today), 0) /
          startedWithConsult.length
        ).toFixed(1)
      : '0.0';

    const heat = { Green: 0, Orange: 0, Red: 0, DarkRed: 0 };
    filtered.forEach((p) => {
      heat[getAgingBand(getDaysSince(p.lastContactDate, today))] += 1;
    });

    return { byStage, conversionRate, avgDays, heat };
  }, [filtered, today]);

  const updatePatient = (id: string, updater: (p: Patient) => Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? updater(p) : p)));
  };

  const moveStage = (id: string, stage: Stage) => {
    updatePatient(id, (p) => {
      const next: Patient = { ...p, stage };
      if (stage === 'CONSULT COMPLETED (FINANCIAL PRESENTED)' && p.followUpTasks.length === 0) {
        const anchor = p.consultDate ? new Date(`${p.consultDate}T12:00:00.000Z`) : today;
        next.followUpTasks = createFollowUps(anchor);
      }
      if (stage === 'CONSULT SCHEDULED' && !p.consultDate) {
        next.consultDate = today.toISOString().split('T')[0];
      }
      if (stage === 'STARTED' && !p.startDate) {
        next.startDate = today.toISOString().split('T')[0];
      }
      return next;
    });
  };

  const logContact = (id: string, type: 'call' | 'text') => {
    updatePatient(id, (p) => ({
      ...p,
      lastContactDate: today.toISOString(),
      contactLog: [
        {
          id: crypto.randomUUID(),
          date: today.toISOString(),
          type,
          note: type === 'call' ? 'Outbound follow-up call logged.' : 'Follow-up text message sent.'
        },
        ...p.contactLog
      ],
      followUpTasks: markNextFollowUpDone(p)
    }));
  };

  return (
    <main className="min-h-screen pb-8">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-3 p-4">
          <h1 className="mr-auto text-xl font-semibold text-brand">Ortho TC Conversion CRM</h1>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded border px-3 py-2 text-sm">
            <option>Feb 2026</option>
            <option>Mar 2026</option>
            <option>Apr 2026</option>
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient" className="rounded border px-3 py-2 text-sm" />
          <select value={officeFilter} onChange={(e) => setOfficeFilter(e.target.value)} className="rounded border px-3 py-2 text-sm">
            <option>All</option><option>Smyrna</option><option>Nashville</option><option>Nolensville</option>
          </select>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="rounded border px-3 py-2 text-sm">
            <option>All</option>{STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={agingFilter} onChange={(e) => setAgingFilter(e.target.value)} className="rounded border px-3 py-2 text-sm">
            <option>All</option><option>Green</option><option>Orange</option><option>Red</option><option>DarkRed</option>
          </select>
          <button onClick={() => setUseDemoDate((v) => !v)} className="rounded bg-brand px-3 py-2 text-sm text-white">
            Demo Controls: {useDemoDate ? 'Demo Date ON' : 'Real Date ON'}
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1700px] gap-3 p-4 md:grid-cols-4 xl:grid-cols-7">
        {[
          ['Ortho Planned', kpis.byStage['ORTHO PLANNED']],
          ['Consult Scheduled', kpis.byStage['CONSULT SCHEDULED']],
          ['Consult Completed / Financial Presented', kpis.byStage['CONSULT COMPLETED (FINANCIAL PRESENTED)']],
          ['Pending Decision', kpis.byStage['PENDING DECISION']],
          ['Started', kpis.byStage.STARTED],
          ['Conversion Rate', `${kpis.conversionRate}%`],
          ['Avg Days Since Consult Completed', kpis.avgDays]
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-[1700px] gap-4 px-4 pb-3 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <p className="mb-2 text-sm font-semibold">Follow-up heat</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(['Green', 'Orange', 'Red', 'DarkRed'] as const).map((key) => (
              <div key={key} className={`rounded border px-2 py-1 ${agingClass[key]}`}>{key}: {kpis.heat[key]}</div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <p className="mb-2 text-sm font-semibold">Aging Legend</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`rounded border px-2 py-1 ${agingClass.Green}`}>Green 0–2 days</span>
            <span className={`rounded border px-2 py-1 ${agingClass.Orange}`}>Orange 3–6 days</span>
            <span className={`rounded border px-2 py-1 ${agingClass.Red}`}>Red 7–13 days</span>
            <span className={`rounded border px-2 py-1 ${agingClass.DarkRed}`}>Dark Red 14+ days</span>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1700px] gap-4 overflow-x-auto px-4 pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dragId && moveStage(dragId, stage)}
            className="w-[320px] flex-none rounded-xl border bg-slate-100 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{stage}</h2>
              <span className="rounded bg-white px-2 py-0.5 text-xs">{filtered.filter((p) => p.stage === stage).length}</span>
            </div>
            <div className="space-y-2">
              {filtered.filter((p) => p.stage === stage).map((patient) => {
                const days = getDaysSince(patient.lastContactDate, today);
                const band = getAgingBand(days);
                return (
                  <article
                    key={patient.id}
                    draggable
                    onDragStart={() => setDragId(patient.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => setSelectedId(patient.id)}
                    className="cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition hover:shadow"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{patient.name}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{patient.office}</span>
                    </div>
                    <p className="text-xs text-slate-600">Ref GP: {patient.referringGP} · {fmtMoney(patient.caseValue)}</p>
                    <div className="my-1 flex flex-wrap gap-1">
                      {[patient.clearanceStatus, ...patient.tags].slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Last: {new Date(patient.lastContactDate).toLocaleDateString()}</span>
                      <span className={`rounded border px-2 py-0.5 ${agingClass[band]}`}>{days}d</span>
                    </div>
                    {patient.nextFollowUpDate && (
                      <p className="mt-1 text-xs text-slate-600">Next follow-up: {patient.nextFollowUpDate}</p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {selectedPatient && (
        <aside className="fixed inset-y-0 right-0 z-30 w-full max-w-xl overflow-y-auto border-l bg-white p-4 shadow-2xl">
          <button onClick={() => setSelectedId(null)} className="ml-auto block rounded border px-2 py-1 text-xs">Close</button>
          <h3 className="mt-2 text-xl font-semibold">{selectedPatient.name}</h3>
          <p className="text-sm text-slate-600">{selectedPatient.stage}</p>

          <div className="my-4">
            <p className="mb-2 text-sm font-semibold">Journey Progress</p>
            <div className="flex items-center gap-2 text-xs">
              {['ORTHO PLANNED', 'CONSULT SCHEDULED', 'CONSULT COMPLETED (FINANCIAL PRESENTED)', 'PENDING DECISION', 'STARTED'].map((step, i) => {
                const active = ['ORTHO PLANNED', 'CONSULT SCHEDULED', 'CONSULT COMPLETED (FINANCIAL PRESENTED)', 'PENDING DECISION', 'STARTED'].indexOf(selectedPatient.stage) >= i;
                return <div key={step} className={`h-2 flex-1 rounded ${active ? 'bg-brand' : 'bg-slate-200'}`} />;
              })}
            </div>
          </div>

          <div className="mb-4 rounded-lg border p-3 text-sm">
            <p><strong>Ref GP:</strong> {selectedPatient.referringGP}</p>
            <p><strong>Case:</strong> {fmtMoney(selectedPatient.caseValue)} {selectedPatient.monthlyPayment ? `· ${fmtMoney(selectedPatient.monthlyPayment)}/mo` : ''}</p>
            <p><strong>Notes:</strong> {selectedPatient.notes}</p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={() => logContact(selectedPatient.id, 'call')} className="rounded bg-slate-900 px-3 py-2 text-xs text-white">Log Call</button>
            <button onClick={() => logContact(selectedPatient.id, 'text')} className="rounded bg-slate-900 px-3 py-2 text-xs text-white">Send Text</button>
            <button onClick={() => moveStage(selectedPatient.id, 'CONSULT SCHEDULED')} className="rounded border px-3 py-2 text-xs">Schedule Consult</button>
            <button onClick={() => moveStage(selectedPatient.id, 'CONSULT COMPLETED (FINANCIAL PRESENTED)')} className="rounded border px-3 py-2 text-xs">Mark Financial Presented</button>
            <button onClick={() => moveStage(selectedPatient.id, 'STARTED')} className="rounded border px-3 py-2 text-xs">Move to Started</button>
            <button onClick={() => moveStage(selectedPatient.id, 'NOT NOW (REVISIT)')} className="rounded border px-3 py-2 text-xs">Move to Not Now</button>
            <button onClick={() => moveStage(selectedPatient.id, 'LOST')} className="rounded border px-3 py-2 text-xs">Move to Lost</button>
          </div>

          <div className="mb-4 rounded-lg border p-3">
            <p className="mb-2 text-sm font-semibold">Follow-up tasks</p>
            {selectedPatient.followUpTasks.length === 0 ? (
              <p className="text-xs text-slate-500">No automated follow-ups yet.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {selectedPatient.followUpTasks.map((task) => (
                  <label key={task.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        updatePatient(selectedPatient.id, (p) => ({
                          ...p,
                          followUpTasks: p.followUpTasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
                        }))
                      }
                    />
                    <span>{task.label} · due {task.dueDate}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-semibold">Timeline log</p>
            <div className="space-y-2 text-xs">
              {selectedPatient.contactLog.map((log) => (
                <div key={log.id} className="rounded border bg-slate-50 p-2">
                  <p className="font-semibold">{log.type.toUpperCase()} · {new Date(log.date).toLocaleString()}</p>
                  <p className="text-slate-600">{log.note}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}
