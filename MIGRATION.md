# Migration Plan: MAUI App → Static Site

This document describes what the current .NET MAUI app does and how to rebuild it as a static site in a **new repository**. Do not implement the static site in this repo.

The MAUI app has **no backend, no API, and no persistence**. The “service” is a few pure functions in `WorktimeCalculator/Utilities/WorktimeCalculator.cs`. A static page plus a small JavaScript module is a complete replacement.

---

## 1. What the current app does

Single screen. User picks a date range, types hours already worked, taps **Calculate**. The app shows expected hours, the gap vs. that target, and a daily average.

| Input | Default | Notes |
|-------|---------|--------|
| Start date | `2024-12-30` | Inclusive |
| End date | Today | Inclusive |
| Working hours | `0:00` | `h:mm` string, e.g. `160:30` |

| Output | Rule |
|--------|------|
| Expected working hours | `8 × workingDays` |
| Hours difference | `worked − expected` (red when behind; no minus sign in the string) |
| Daily working hours | `worked ÷ workingDays` |

### Working-day rule

A day counts if **all** of these are true:

1. It is between start and end, **inclusive**.
2. It is Monday–Friday.
3. It is **not** in the hardcoded holiday list (full date, year included).

There is no locale, no year rollover, and no API. Holidays that are not in the list are treated as normal working days.

### Holiday list (2025, Mexican calendar as used in the app)

Source: `holydays` in `WorktimeCalculator/Utilities/WorktimeCalculator.cs` (typo in the field name is intentional in the current code).

| Date | Typical meaning |
|------|-----------------|
| 2025-01-01 | New Year |
| 2025-02-03 | Constitution Day (observed Monday) |
| 2025-03-17 | Benito Juárez (observed Monday) |
| 2025-04-17 | Maundy Thursday |
| 2025-04-18 | Good Friday |
| 2025-05-01 | Labour Day |
| 2025-09-16 | Independence Day |
| 2025-11-18 | Revolution Day (as listed; not auto-computed) |
| 2025-12-25 | Christmas |

Missing years (2026+) are **not** excluded. After 2025, only weekends are skipped unless the list is updated.

### Expected hours per day

Fixed at **8**. Not configurable in the UI. Change one constant when porting if that should become an input.

---

## 2. What to keep vs. drop

### Keep (the product)

- Inclusive date range
- Mon–Fri minus holiday dates
- 8 hours per working day
- `h:mm` display
- Calculate-on-submit (or calculate live—either is fine)
- Highlight when actual hours are below expected

### Drop (MAUI-only)

- .NET 9 / MAUI / XAML / CommunityToolkit.Mvvm
- `Platforms/` (Android, iOS, Mac Catalyst, Windows, Tizen)
- `MauiProgram.cs`, `AppShell`, fonts, splash, styles
- `TimeSpanConverter` (defined, unused)
- `BoolToColorConverter` (replace with CSS)

### Fix while porting (known pitfalls)

These are bugs or sharp edges in the C# app. The static site should not copy them blindly.

| Issue | Current behavior | Recommended in the new site |
|-------|------------------|-----------------------------|
| Zero working days | `CalculateDailyWorkingHours` divides by zero | Show a message; skip average |
| Daily hours format | Uses `TimeSpan.Hours` (0–23), not `TotalHours` | Use total hours so `25:00` stays `25:00` |
| Difference sign | Absolute value only; color encodes sign | Keep color **and** prefix `−` when behind |
| Minute padding | `5:9` is possible | Always `h:mm` with two-digit minutes |
| Invalid `h:mm` | Silently becomes `0:00` | Show a short validation message |
| Holiday equality | `DateTime` includes time | Compare calendar dates only (`YYYY-MM-DD`) |
| Start after end | Loop never runs; all zeros | Validate range before calculating |
| Holiday years | 2025 only | Keep a data file that is easy to extend |

---

## 3. Target shape in the new repo

No build step required. Three files (or one HTML file with inline CSS/JS) are enough.

```
<new-repo>/
├── index.html          # Form + results
├── css/styles.css      # Optional; can be inline
├── js/worktime.js      # Domain logic (testable)
├── js/app.js           # DOM wiring
├── data/holidays.json  # Dates to exclude
└── README.md
```

Hosting: GitHub Pages (or any static host). Open `index.html` locally; no server needed.

### Suggested UI (parity with the MAUI screen)

```
Start date:              [ date ]
End date:                [ date ]
Hours worked:            [ h:mm ]

Expected hours:          160:00
Difference:              2:30          (red if negative)
Daily average:           8:12

[ Calculate ]
```

Primary user goal stated for the new site: **“hours that should have been logged”** → `Expected hours` is the main result. Difference and daily average are optional extras; include them if you want feature parity.

---

## 4. Domain logic to port (JavaScript)

Port these functions 1:1 from `WorktimeCalculator.cs`. Keep them in `js/worktime.js` with **no DOM**. That makes them easy to test in the browser console or with a tiny test page.

```javascript
const HOURS_PER_DAY = 8;

/** @param {string[]} isoDates e.g. ["2025-01-01"] */
export function countWorkingDays(start, end, holidays) {
  const holidaySet = new Set(holidays);
  let days = 0;
  for (let d = toUtcDate(start); d <= toUtcDate(end); d.setUTCDate(d.getUTCDate() + 1)) {
    const dow = d.getUTCDay(); // 0 Sun … 6 Sat
    const iso = d.toISOString().slice(0, 10);
    if (dow === 0 || dow === 6 || holidaySet.has(iso)) continue;
    days++;
  }
  return days;
}

export function expectedHours(start, end, holidays, hoursPerDay = HOURS_PER_DAY) {
  return countWorkingDays(start, end, holidays) * hoursPerDay;
}

export function parseHmm(text) {
  const m = /^(\d+):([0-5]?\d)$/.exec(String(text).trim());
  if (!m) return null;
  return Number(m[1]) + Number(m[2]) / 60;
}

export function formatHmm(totalHours) {
  const sign = totalHours < 0 ? "−" : "";
  const abs = Math.abs(totalHours);
  const h = Math.floor(abs);
  const min = Math.round((abs - h) * 60);
  return `${sign}${h}:${String(min).padStart(2, "0")}`;
}
```

Use UTC date parts (or `YYYY-MM-DD` strings only) so local timezone does not skip or duplicate a day.

`data/holidays.json` can be a plain array:

```json
[
  "2025-01-01",
  "2025-02-03",
  "2025-03-17",
  "2025-04-17",
  "2025-04-18",
  "2025-05-01",
  "2025-09-16",
  "2025-11-18",
  "2025-12-25"
]
```

If you want zero network and a double-clickable `index.html`, embed that array in `worktime.js` instead of fetching JSON (`file://` cannot `fetch()` local JSON in most browsers).

---

## 5. Implementation steps (new repo)

Do this after the empty repository exists.

1. **Scaffold** `index.html` with a form (`<input type="date">` × 2, hours text field, results, button).
2. **Copy the holiday list** into `data/holidays.json` or a JS constant.
3. **Implement** `countWorkingDays` + `expectedHours` first. That is the whole “service.”
4. **Wire the form**: on submit, compute expected hours and render `h:mm`.
5. **Optional parity**: parse hours worked, show difference (color + sign) and daily average; guard `workingDays === 0`.
6. **README**: how to open the page, how to add holidays, 8h/day constant.
7. **Publish**: GitHub Pages from `main` (root or `/docs`).

No .NET, no Node, no bundler unless you later want tests. Vanilla JS is enough.

### Manual checks before calling it done

- Range `2025-01-01` → `2025-01-01` (holiday) → 0 working days, expected `0:00`, no crash.
- Range `2025-01-02` → `2025-01-03` (Thu–Fri) → 2 days, expected `16:00`.
- Range `2025-01-04` → `2025-01-05` (weekend) → 0 days.
- Range spanning `2025-05-01` excludes that Thursday.
- Hours `160:30` vs expected `160:00` → difference `0:30` (ahead).
- Hours `150:00` vs expected `160:00` → difference shown as behind (red / minus).
- Start date after end date → validation, not silent zeros.

---

## 6. Mapping old files → new files

| MAUI | Static site |
|------|-------------|
| `Utilities/WorktimeCalculator.cs` | `js/worktime.js` |
| `ViewModels/WorktimeCalculatorVM.cs` (parse + format + command) | `js/app.js` |
| `Views/WorktimeCalculatorPage.xaml` | `index.html` |
| `Converters/BoolToColorConverter.cs` | CSS class on the difference row |
| `holydays` list | `data/holidays.json` or JS constant |
| Everything under `Platforms/`, `Resources/`, `MauiProgram.cs` | Omit |

---

## 7. Out of scope (unless requested later)

Same as this app: no accounts, no cloud sync, no holiday API, no localization. Hours-per-day can stay a constant. Adding a year to the holiday list is a data edit, not a feature.

---

## 8. Suggested first commit in the new repo

After you create the repository, the first useful commit is:

- `index.html` + `js/worktime.js` that only answers: **given start/end, how many hours should have been logged?**
- Holiday data for 2025 copied from this file
- README with the working-day rule and how to extend holidays

Difference and daily average can be a second commit if you want a smaller first slice.
