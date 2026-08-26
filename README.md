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
- A working day is Monday–Friday minus holidays computed for the years in the range (`holidaysForYear` in `worktime.js`).
- Expected hours = `8 × working days` (the main result). A full 2026 year is **2016:00** (252 days), not 2088:00 (261 weekdays with no holidays).
- Difference = hours worked − expected (minus sign and red when behind).
- Daily average = worked ÷ working days (`—` if there are no working days).
- Time format: results use `h:mm` with two-digit minutes. Input is two numeric fields (hours and minutes), so Android can use the number keypad.

Holidays follow Mexican LFT rules (fixed dates and movable Mondays) plus Holy Thursday and Good Friday, generated for each year in the range. 2026 dates:

```
2026-01-01  2026-02-02  2026-03-16  2026-04-02  2026-04-03
2026-05-01  2026-09-16  2026-11-16  2026-12-25
```

Change hours per day with `HOURS_PER_DAY` in `worktime.js`.

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
