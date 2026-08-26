# Migration Plan: MAUI App → Static Site (GitHub Pages)

The rewrite is **implemented as a copy-ready kit** in `static-site/`. Do not replace the MAUI app in this repository. After you create the new repo, copy that folder’s contents to its **root** and enable GitHub Pages.

Step-by-step for the repo switch: [`HANDOFF.md`](HANDOFF.md).

The MAUI app has **no backend**. Expected hours are `8 ×` Monday–Friday minus the holiday list in `WorktimeCalculator/Utilities/WorktimeCalculator.cs`.

---

## Copy-ready layout (new repo root)

```
index.html
styles.css
worktime.js          # domain logic + HOLIDAYS
app.js               # form
worktime.test.js     # optional: node --test worktime.test.js
README.md
.nojekyll
.github/workflows/pages.yml
```

Hosting: **GitHub Pages**. Relative asset paths work at `https://<user>.github.io/<repo>/`.

Enable Pages after the first push to `main`:

1. **Settings → Pages → Source: GitHub Actions** (workflow included), or
2. **Deploy from a branch** → `main` → `/` (root).

---

## Product rules

| Input | Default | Notes |
|-------|---------|--------|
| Start date | `2024-12-30` | Inclusive |
| End date | Today | Inclusive |
| Working hours | `0:00` | `h:mm`, e.g. `160:30` |

| Output | Rule |
|--------|------|
| Expected hours (main) | `8 × workingDays` |
| Hours difference | `worked − expected` (minus + red when behind) |
| Daily average | `worked ÷ workingDays` (`—` if 0 days) |

Working day: in range, Monday–Friday, not in `HOLIDAYS`. No locale API. Dates not in the list count as working days.

### Holidays (2025, from MAUI `holydays`)

`2025-01-01`, `2025-02-03`, `2025-03-17`, `2025-04-17`, `2025-04-18`, `2025-05-01`, `2025-09-16`, `2025-11-18`, `2025-12-25`

---

## What was dropped vs fixed

Dropped: MAUI/XAML/MVVM, `Platforms/`, unused `TimeSpanConverter`.

Fixed in `worktime.js` (do not reintroduce): divide-by-zero, daily hours via total hours, padded minutes, validation for range and `h:mm`, date-only holiday match.

---

## Test vectors

See `HANDOFF.md` and `static-site/worktime.test.js`.
