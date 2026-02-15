# Ortho TC Conversion CRM (Mock)

Small Next.js + TypeScript + Tailwind demo of a Treatment Coordinator conversion Kanban board.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What to test

1. **Drag & drop cards** between the seven pipeline columns.
2. **Open a card** to view the right-side drawer (progress, timeline, follow-up tasks).
3. Click **Log Call** / **Send Text** to add timeline entries and refresh last-contact aging.
4. Click **Mark Financial Presented** to move a patient into consult completed and auto-create day 3/7/14 tasks.
5. Toggle **Demo Controls** in the header to switch between real date and a fixed `2026-02-15` demo date.
6. Try **search + filters** (office, stage, aging) and verify KPI/heat panels update.

## Notes

- Data is in-memory with `localStorage` persistence so board state remains after refresh.
- Useful checks:

```bash
npm run lint
npm run typecheck
```
