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
- Working days: Monday–Friday minus ISO dates in `HOLIDAYS` (`worktime.js`). Compare `YYYY-MM-DD` strings; iterate in UTC.
- Expected hours: **8 per working day** (`HOURS_PER_DAY`).
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

Edit the `HOLIDAYS` array in `worktime.js`. Use `YYYY-MM-DD`. Holidays are year-specific; add a new year explicitly.

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

## Out of scope (unless explicitly requested)

- Cloud sync, persistence, or user accounts
- Dynamic holiday APIs
- Build tools or npm dependencies
