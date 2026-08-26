# Agent Guide — Horas laborales

This repository is a **static GitHub Pages site**. There is no .NET / MAUI app, no backend, and no bundler.

| Path | Purpose |
|------|---------|
| `index.html` | Single page UI (Spanish) |
| `styles.css` | Page styles |
| `worktime.js` | Working-day count, expected hours, parse/format `h:mm` |
| `app.js` | Form defaults and live recalculation |
| `worktime.test.js` | Node tests for `worktime.js` |
| `.github/workflows/pages.yml` | Deploy to GitHub Pages from `main` |
| `.github/workflows/test.yml` | Run `node --test worktime.test.js` |

## Conventions

- Vanilla HTML/CSS/JS. Classic `<script>` tags (not ES modules) so `file://` and Pages both work.
- Time format: results use `h:mm` (minutes always two digits). Worked time is two numeric fields (hours, minutes 0–59) so mobile keyboards do not need `:`.
- Default start date: 1 January of the current calendar year (`app.js`). Default end date: today.
- Working days: Monday–Friday minus holidays for every year overlapping the range (`holidaysForYear` in `worktime.js`). Compare `YYYY-MM-DD` strings; iterate in UTC.
- Expected hours: **8 per working day** (`HOURS_PER_DAY`). A full non-leap year where all configured holidays fall on weekdays is **252 days / 2016 hours**, not 261 weekdays / 2088 hours.
- UI language: Spanish. README and this file: English.
- Commit messages: English.

## Commands

```bash
node --test worktime.test.js
python3 -m http.server 8080
```

GitHub Pages URL: `https://cesarordazv.github.io/WorktimeCalculator/`

## Common tasks

### Add or update holidays

Edit `holidaysForYear` in `worktime.js`. Holidays are computed for each year in the selected range (do not keep a per-year date list):

- LFT: 1 January, first Monday of February, third Monday of March, 1 May, 16 September, third Monday of November, 25 December
- Holy Thursday and Good Friday (Easter minus 3 and 2 days)
- 1 October on presidential inauguration years (every six years from 2024)

A full 2026 calendar year must be 252 working days / **2016** hours. 2088 hours means weekdays were counted and holidays were not subtracted.

### Change hours per day

Edit `HOURS_PER_DAY` in `worktime.js`.

### New UI fields

1. Add logic in `worktime.js` (`calculate` / helpers) with no DOM.
2. Cover it in `worktime.test.js`.
3. Bind in `index.html` + `app.js`.

## Pitfalls

- Zero working days: do not divide; show `—` for the daily average.
- Invalid hours/minutes (minutes over 59) and start-after-end must show an error, not silent zeros.
- Relative asset paths only (`styles.css`, not `/styles.css`) so the project Pages URL works.
- Do not reintroduce a MAUI/XAML app unless explicitly requested.
- 2088 hours for a full year means holidays were not applied (261 weekdays × 8). The correct total with the current holiday rules is 2016.

## Out of scope (unless explicitly requested)

- Cloud sync, persistence, or user accounts
- Dynamic holiday APIs
- Build tools or npm dependencies
