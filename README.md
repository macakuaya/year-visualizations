# Year visualization examples

Static prototypes of different ways to show **every day of a year** at **375px** min width.

## Patterns in the gallery

1. **GitHub-style week columns** — 7×53 grid, 5px cells, fits without scrolling
2. **Calendar with day numbers** — 12 real month calendars, every day numbered (tall, scrolls)
3. **Year at a glance** — 12 weekday-aligned mini calendars, one screenful
4. **Quarter panels** — week columns split 4 ways, ~2× the cell size
5. **Month strips** — 12 rows × up to 31 days
6. **Snake grid** — 31 columns, alternating row direction
7. **Week micro-bars** — 52 rows × 7, Mon–Sun across the top
8. **Scrollable weeks** — 10px cells, swipe horizontally
9. **Day ruler** — 365 ticks with month marks underneath
10. **Polar ring** — 365 segments + center stat

Year dropdown: current year back four years (2024 demonstrates leap-year behavior).

## Run locally

```bash
cd year-visualizations
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Data is **mock** (deterministic fake “games per day”) so you can compare layouts without a backend.
