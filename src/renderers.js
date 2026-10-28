import {
  buildYearData,
  daysInMonth,
  formatDayLabel,
  mondayIndex,
} from "./yearData.js";

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  return node;
}

function dayCell(day, extraClass = "") {
  const cell = el("div", `day level-${day.level}${extraClass ? ` ${extraClass}` : ""}`);
  const label = `${formatDayLabel(day.date)} · ${day.games} games`;
  cell.setAttribute("role", "img");
  cell.setAttribute("aria-label", label);
  cell.title = label;
  return cell;
}

function legend() {
  const wrap = el("div", "legend");
  wrap.append(el("span", "legend-label", { text: "Less" }));
  for (let i = 0; i < 5; i++) {
    wrap.append(el("span", `legend-swatch level-${i}`));
  }
  wrap.append(el("span", "legend-label", { text: "More" }));
  return wrap;
}

/** GitHub-style: 7 rows × ~53 week columns */
export function renderGitHubHeatmap(year) {
  const days = buildYearData(year);
  const jan1 = days[0].date;
  const pad = mondayIndex(jan1);
  const cols = Math.ceil((pad + days.length) / 7);

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "GitHub-style week columns" }));
  card.append(
    el("p", "viz-desc", {
      text: "7×53 grid, 5px cells — fits 375px without scrolling.",
    }),
  );

  const frame = el("div", "viz-frame github-frame");
  const labels = el("div", "github-dow");
  ["", "Mon", "", "Wed", "", "Fri", ""].forEach((t) => {
    labels.append(el("span", "github-dow-label", { text: t }));
  });

  const gridWrap = el("div", "github-grid-wrap");
  const grid = el("div", "github-grid");
  grid.style.setProperty("--cols", String(cols));

  const cells = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < cols * 7) cells.push(null);

  const monthMarkers = el("div", "github-months");
  monthMarkers.style.setProperty("--cols", String(cols));

  for (let c = 0; c < cols; c++) {
    const weekStart = cells[c * 7]?.date ?? cells.find((d, i) => i >= c * 7 && d)?.date;
    if (weekStart && weekStart.getDate() <= 7) {
      monthMarkers.append(
        el("span", "github-month-label", {
          text: MONTH_SHORT[weekStart.getMonth()],
          style: `grid-column: ${c + 1}`,
        }),
      );
    }
  }

  for (let i = 0; i < cells.length; i++) {
    const day = cells[i];
    if (!day) {
      grid.append(el("div", "day empty"));
      continue;
    }
    const isMonthStart = day.date.getDate() === 1;
    grid.append(dayCell(day, isMonthStart ? "month-start" : ""));
  }

  gridWrap.append(monthMarkers, grid);
  frame.append(labels, gridWrap);
  card.append(frame, legend());
  return card;
}

/** 12 rows, one month per row */
export function renderMonthStrips(year) {
  const days = buildYearData(year);
  const byKey = new Map(
    days.map((d) => [`${d.date.getMonth()}-${d.date.getDate()}`, d]),
  );

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Month strips" }));
  card.append(
    el("p", "viz-desc", {
      text: "12 rows × up to 31 days — reads like mini calendars.",
    }),
  );

  const frame = el("div", "viz-frame month-strips");
  for (let m = 0; m < 12; m++) {
    const row = el("div", "month-row");
    row.append(el("span", "month-name", { text: MONTH_SHORT[m] }));
    const track = el("div", "month-track");
    const len = daysInMonth(year, m);
    track.style.setProperty("--days", String(len));
    for (let d = 1; d <= len; d++) {
      const day = byKey.get(`${m}-${d}`);
      track.append(dayCell(day));
    }
    row.append(track);
    frame.append(row);
  }
  card.append(frame, legend());
  return card;
}

/** Fixed width snake, 31 cells per row */
export function renderSnake(year) {
  const days = buildYearData(year);
  const cols = 31;
  const rows = Math.ceil(days.length / cols);

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Snake grid" }));
  card.append(
    el("p", "viz-desc", {
      text: "31 columns per row; path reverses each row (boustrophedon).",
    }),
  );

  const frame = el("div", "viz-frame snake-frame");
  const grid = el("div", "snake-grid");
  grid.style.setProperty("--cols", String(cols));

  for (let r = 0; r < rows; r++) {
    const slice = days.slice(r * cols, (r + 1) * cols);
    const ordered = r % 2 === 1 ? [...slice].reverse() : slice;
    for (const day of ordered) {
      const isMonthStart = day.date.getDate() === 1;
      grid.append(dayCell(day, isMonthStart ? "month-start" : ""));
    }
  }

  frame.append(grid);
  card.append(frame, legend());
  return card;
}

/** 52 rows of 7-day micro bars */
export function renderWeekBars(year) {
  const days = buildYearData(year);
  const jan1 = days[0].date;
  const pad = mondayIndex(jan1);
  const cells = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Week micro-bars" }));
  card.append(
    el("p", "viz-desc", {
      text: "Each row is one week; Mon–Sun across the top.",
    }),
  );

  const frame = el("div", "viz-frame week-bars");

  const header = el("div", "week-bar-header");
  for (const t of ["M", "T", "W", "T", "F", "S", "S"]) {
    header.append(el("span", "week-bar-dow", { text: t }));
  }

  for (let w = 0; w < cells.length / 7; w++) {
    const row = el("div", "week-bar-row");

    const track = el("div", "week-bar-track");
    for (let i = 0; i < 7; i++) {
      const day = cells[w * 7 + i];
      if (!day) track.append(el("div", "day bar empty"));
      else track.append(dayCell(day, "bar"));
    }
    row.append(track);
    frame.append(row);
  }
  frame.append(header);
  card.append(frame, legend());
  return card;
}

/** Horizontal scroll with larger cells */
export function renderScrollableWeeks(year) {
  const days = buildYearData(year);
  const jan1 = days[0].date;
  const pad = mondayIndex(jan1);
  const cols = Math.ceil((pad + days.length) / 7);

  const cells = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Scrollable weeks (larger cells)" }));
  card.append(
    el("p", "viz-desc", {
      text: "10px cells; swipe horizontally — best for tap targets.",
    }),
  );

  const scroller = el("div", "scroll-weeks");
  const grid = el("div", "scroll-github-grid");
  grid.style.setProperty("--cols", String(cols));

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < 7; r++) {
      const day = cells[c * 7 + r];
      if (!day) grid.append(el("div", "day scroll empty"));
      else grid.append(dayCell(day, "scroll"));
    }
  }

  scroller.append(grid);
  card.append(scroller, legend());
  return card;
}

/** SVG ring — 365 segments */
export function renderPolarRing(year) {
  const days = buildYearData(year);
  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Polar ring" }));
  card.append(
    el("p", "viz-desc", {
      text: "Full year in the round; center room for a headline stat.",
    }),
  );

  const frame = el("div", "viz-frame polar-frame");
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const outer = 148;
  const inner = 88;
  const n = days.length;
  const gap = 0.35;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("class", "polar-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Activity ring for ${year}`);

  const step = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  days.forEach((day, i) => {
    const a0 = startAngle + i * step + gap * 0.001;
    const a1 = startAngle + (i + 1) * step - gap * 0.001;
    const x0o = cx + outer * Math.cos(a0);
    const y0o = cy + outer * Math.sin(a0);
    const x1o = cx + outer * Math.cos(a1);
    const y1o = cy + outer * Math.sin(a1);
    const x0i = cx + inner * Math.cos(a1);
    const y0i = cy + inner * Math.sin(a1);
    const x1i = cx + inner * Math.cos(a0);
    const y1i = cy + inner * Math.sin(a0);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = [
      `M ${x0o} ${y0o}`,
      `A ${outer} ${outer} 0 ${large} 1 ${x1o} ${y1o}`,
      `L ${x0i} ${y0i}`,
      `A ${inner} ${inner} 0 ${large} 0 ${x1i} ${y1i}`,
      "Z",
    ].join(" ");
    path.setAttribute("d", d);
    path.setAttribute("class", `polar-seg level-${day.level}`);
    path.setAttribute("tabindex", "0");
    const label = `${formatDayLabel(day.date)} · ${day.games} games`;
    path.setAttribute("aria-label", label);
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = label;
    path.appendChild(title);
    svg.appendChild(path);
  });

  const center = el("div", "polar-center");
  const totalGames = days.reduce((s, d) => s + d.games, 0);
  const activeDays = days.filter((d) => d.level > 0).length;
  center.innerHTML = `<span class="polar-stat">${totalGames}</span><span class="polar-caption">games</span><span class="polar-sub">${activeDays} active days</span>`;

  frame.append(svg, center);
  card.append(frame, legend());
  return card;
}

/** Real month calendars, every day numbered */
export function renderCalendarHeatmap(year) {
  const days = buildYearData(year);
  const byKey = new Map(
    days.map((d) => [`${d.date.getMonth()}-${d.date.getDate()}`, d]),
  );

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Calendar with day numbers" }));
  card.append(
    el("p", "viz-desc", {
      text: "Real month calendars, every day numbered — best when the individual day matters. Tall: scrolls.",
    }),
  );

  const frame = el("div", "viz-frame cal-frame");
  const wk = el("div", "cal-weekdays");
  ["M", "T", "W", "T", "F", "S", "S"].forEach((t) =>
    wk.append(el("span", "cal-weekday", { text: t })),
  );
  frame.append(wk);

  const today = new Date();
  for (let m = 0; m < 12; m++) {
    const block = el("div", "cal-block");
    block.append(
      el("span", "cal-month-name", { text: `${MONTH_SHORT[m]} ${year}` }),
    );
    const grid = el("div", "cal-grid");
    const first = new Date(year, m, 1);
    for (let i = 0; i < mondayIndex(first); i++) {
      grid.append(el("div", "cal-day empty"));
    }
    const len = daysInMonth(year, m);
    for (let d = 1; d <= len; d++) {
      const day = byKey.get(`${m}-${d}`);
      const cell = dayCell(day, "cal-day");
      cell.append(el("span", "cal-day-num", { text: String(d) }));
      if (
        today.getFullYear() === year &&
        today.getMonth() === m &&
        today.getDate() === d
      ) {
        cell.classList.add("today");
      }
      grid.append(cell);
    }
    block.append(grid);
    frame.append(block);
  }
  card.append(frame, legend());
  return card;
}

/** 12 mini calendars in one screenful */
export function renderMiniYear(year) {
  const days = buildYearData(year);
  const byKey = new Map(
    days.map((d) => [`${d.date.getMonth()}-${d.date.getDate()}`, d]),
  );

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Year at a glance" }));
  card.append(
    el("p", "viz-desc", {
      text: "Twelve weekday-aligned mini calendars — whole year in one screen, no scroll.",
    }),
  );

  const frame = el("div", "viz-frame mini-year");
  for (let m = 0; m < 12; m++) {
    const month = el("div", "mini-month");
    month.append(el("span", "mini-month-name", { text: MONTH_SHORT[m] }));
    const grid = el("div", "mini-grid");
    const first = new Date(year, m, 1);
    for (let i = 0; i < mondayIndex(first); i++) {
      grid.append(el("div", "day mini empty"));
    }
    const len = daysInMonth(year, m);
    for (let d = 1; d <= len; d++) {
      const day = byKey.get(`${m}-${d}`);
      grid.append(dayCell(day, "mini"));
    }
    month.append(grid);
    frame.append(month);
  }
  card.append(frame, legend());
  return card;
}

/** GitHub structure at double cell size: 4 panels of ~13 weeks */
export function renderQuarterPanels(year) {
  const days = buildYearData(year);

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Quarter panels" }));
  card.append(
    el("p", "viz-desc", {
      text: "Same week-column logic, split 4 ways — ~2× the cell size, so days stay tappable.",
    }),
  );

  const frame = el("div", "viz-frame quarter-wrap");
  const defs = [
    ["Q1", "Jan – Mar"],
    ["Q2", "Apr – Jun"],
    ["Q3", "Jul – Sep"],
    ["Q4", "Oct – Dec"],
  ];

  for (let q = 0; q < 4; q++) {
    const qDays = days.filter(
      (d) => Math.floor(d.date.getMonth() / 3) === q,
    );
    const panel = el("div", "quarter-panel");
    panel.append(
      el("span", "quarter-title", { text: `${defs[q][0]} · ${defs[q][1]}` }),
    );
    const grid = el("div", "q-grid");
    const pad = mondayIndex(qDays[0].date);
    const cols = Math.ceil((pad + qDays.length) / 7);
    grid.style.setProperty("--cols", String(cols));

    const cells = [];
    for (let i = 0; i < pad; i++) cells.push(null);
    cells.push(...qDays);
    while (cells.length % 7 !== 0) cells.push(null);

    for (const c of cells) {
      grid.append(c ? dayCell(c, "q") : el("div", "day q empty"));
    }
    panel.append(grid);
    frame.append(panel);
  }
  card.append(frame, legend());
  return card;
}

/** 365 thin ticks with month marks — a ruler of the year */
export function renderDayRuler(year) {
  const days = buildYearData(year);

  const card = el("article", "viz-card");
  card.append(el("h2", "viz-title", { text: "Day ruler" }));
  card.append(
    el("p", "viz-desc", {
      text: "One tick per day, 365 total; month marks underneath. Reads like a timeline strip.",
    }),
  );

  const frame = el("div", "viz-frame ruler-frame");
  const W = 343;
  const tickH = 16;
  const labelH = 14;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${tickH + labelH}`);
  svg.setAttribute("class", "ruler-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Day-by-day activity ruler for ${year}`);

  const tw = W / days.length;
  days.forEach((day, i) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", (i * tw + 0.15).toFixed(2));
    rect.setAttribute("y", 0);
    rect.setAttribute("width", Math.max(tw - 0.3, 0.5).toFixed(2));
    rect.setAttribute("height", tickH);
    rect.setAttribute("class", `ruler-tick level-${day.level}`);
    const label = `${formatDayLabel(day.date)} · ${day.games} games`;
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = label;
    rect.appendChild(title);
    svg.appendChild(rect);
  });

  let acc = 0;
  MONTH_SHORT.forEach((name, m) => {
    const x = acc * tw;
    const mark = document.createElementNS("http://www.w3.org/2000/svg", "line");
    mark.setAttribute("x1", x);
    mark.setAttribute("x2", x);
    mark.setAttribute("y1", tickH);
    mark.setAttribute("y2", tickH + 3);
    mark.setAttribute("class", "ruler-mark");
    svg.appendChild(mark);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", Math.min(x, W - 22));
    text.setAttribute("y", tickH + 12);
    text.setAttribute("class", "ruler-month");
    text.textContent = name;
    svg.appendChild(text);

    acc += daysInMonth(year, m);
  });

  frame.append(svg);
  card.append(frame, legend());
  return card;
}

export const allRenderers = [
  renderGitHubHeatmap,
  renderCalendarHeatmap,
  renderMiniYear,
  renderQuarterPanels,
  renderMonthStrips,
  renderSnake,
  renderWeekBars,
  renderScrollableWeeks,
  renderDayRuler,
  renderPolarRing,
];
