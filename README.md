# Horas laborales

Static site that answers **how many hours you should have logged** between two dates: 8 hours per working day (Monday–Friday, minus the holiday list).

There is no backend, build, or package manager. GitHub Pages serves the files as-is.

Live site (after Pages is enabled on `main`):

https://cesarordazv.github.io/WorktimeCalculator/

## Local use

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

The start date defaults to **1 January of the current year**; the end date defaults to today.

## GitHub Pages

1. Merge this to `main`.
2. Repo → **Settings** → **Pages**.
3. **Source**: GitHub Actions (see `.github/workflows/pages.yml`).
4. Wait for the **Deploy to GitHub Pages** workflow.

Alternative: **Deploy from a branch** → `main` → `/` (root). Asset paths are relative, so the project site under `/WorktimeCalculator/` works.

## Rules

- Date range is **inclusive**.
- A working day is Monday–Friday and **not** in `HOLIDAYS` (`worktime.js`).
- Expected hours = `8 × (working days − calendar months × 14/12)` (the main result).
- Difference = hours worked − expected (minus sign and red when behind).
- Daily average = worked ÷ working days (`—` if there are no working days).
- Time format: `h:mm` (for example `160:30` or `1920:00`) with two-digit minutes. Hours can exceed 24 to cover full-year totals.

Holidays are year-specific (Mexican federal holidays plus Holy Thursday and Good Friday):

```
2025-01-01  2025-02-03  2025-03-17  2025-04-17  2025-04-18
2025-05-01  2025-09-16  2025-11-18  2025-12-25

2026-01-01  2026-02-02  2026-03-16  2026-04-02  2026-04-03
2026-05-01  2026-09-16  2026-11-16  2026-12-25
```

Add more ISO dates (`YYYY-MM-DD`) to `HOLIDAYS` in `worktime.js`. Change hours per day with `HOURS_PER_DAY` in the same file.

## Files

| File | Role |
|------|------|
| `index.html` | Page |
| `styles.css` | Layout |
| `worktime.js` | Calculation (no DOM) |
| `app.js` | Form |
| `.nojekyll` | Skip Jekyll on Pages |
| `.github/workflows/pages.yml` | Publish |
| `.github/workflows/test.yml` | `node --test worktime.test.js` |

## Tests

```bash
node --test worktime.test.js
```
