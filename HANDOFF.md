# Handoff: switch to the new repo and publish on GitHub Pages

This is the packet for the **same chat**, after you create an empty repository and change the workspace to it. Do not keep implementing the minisite inside this MAUI repo.

The ready-to-copy site lives in `static-site/` on branch `cursor/static-site-migration-plan-faa5` (PR #2).

## What to copy (new repo root = these files)

Copy **the contents** of `static-site/`, not the MAUI project.

```
index.html
styles.css
worktime.js
app.js
worktime.test.js      # optional, Node tests only
README.md
.nojekyll
.github/workflows/pages.yml
```

Do **not** copy `WorktimeCalculator/`, `*.sln`, or `Platforms/`.

### If this workspace is gone after the switch

From the new repo (with `gh` authenticated):

```bash
git clone --depth 1 --branch cursor/static-site-migration-plan-faa5 \
  https://github.com/CesarOrdazV/WorktimeCalculator.git /tmp/worktime-src
cp -a /tmp/worktime-src/static-site/. .
rm -rf /tmp/worktime-src
```

Or raw files:

https://github.com/CesarOrdazV/WorktimeCalculator/tree/cursor/static-site-migration-plan-faa5/static-site

## New repo setup (GitHub Pages)

Suggested repo name: `horas-laborales`  
Public URL: `https://cesarordazv.github.io/horas-laborales/`

1. Create the empty GitHub repo (public, no README if you will push these files as the first commit).
2. Copy the files above to the repo **root**.
3. Commit and push to `main`.
4. GitHub → **Settings** → **Pages**:
   - **Source: GitHub Actions** (matches `.github/workflows/pages.yml`), **or**
   - **Deploy from a branch** → `main` → `/` (root). Then the workflow is optional.
5. First-time Actions deploy: GitHub may ask to enable Pages / wait for the `github-pages` environment.
6. Confirm the site loads CSS/JS (relative paths; works as a project site under `/<repo>/`).

No Node, no .NET, no bundler to publish. `node --test worktime.test.js` is only for checking the math.

## Product rules (must preserve)

| Rule | Value |
|------|--------|
| Hours per working day | **8** (`HOURS_PER_DAY` in `worktime.js`) |
| Working day | Monday–Friday, not in `HOLIDAYS`, range **inclusive** |
| Expected hours | `8 × workingDays` — this is the main result |
| Difference | worked − expected; minus sign + red if behind |
| Daily average | worked / workingDays; `—` if 0 days |
| Time format | `h:mm`, minutes always two digits |
| Default start | `2024-12-30` |
| Default end | today |
| Default worked | `0:00` |
| UI language | Spanish |

### Holidays (copy of MAUI `holydays`, year 2025 only)

```
2025-01-01
2025-02-03
2025-03-17
2025-04-17
2025-04-18
2025-05-01
2025-09-16
2025-11-18
2025-12-25
```

Compare dates as `YYYY-MM-DD` strings. Iterate in UTC so time zones do not skip a day.

## Known MAUI bugs — already fixed in `worktime.js`

- No divide-by-zero when the range is all weekend/holiday
- Daily hours use total hours (not `TimeSpan.Hours` 0–23)
- Difference shows `−` when behind
- Minutes padded (`7:05` not `7:5`)
- Invalid `h:mm` shows a message
- Start after end shows a message
- Empty hours field counts as `0:00` so you can still see expected hours

## Test vectors

| Start | End | Worked | Working days | Expected | Notes |
|-------|-----|--------|--------------|----------|--------|
| 2025-01-01 | 2025-01-01 | 0:00 | 0 | 0:00 | New Year (holiday) |
| 2025-01-02 | 2025-01-03 | 16:00 | 2 | 16:00 | Thu–Fri |
| 2025-01-04 | 2025-01-05 | 8:00 | 0 | 0:00 | Weekend; average `—` |
| 2025-01-01 | 2025-01-07 | 32:00 | 4 | 32:00 | Holiday + weekend excluded |
| 2025-04-30 | 2025-05-02 | 16:00 | 2 | 16:00 | May 1 holiday skipped |
| 2025-01-02 | 2025-01-03 | 15:00 | 2 | 16:00 | Difference `−1:00` (behind) |
| 2025-02-01 | 2025-01-01 | 8:00 | — | — | Invalid range |

## After the first Pages deploy

- Open the site, change dates, confirm the big number (**Horas que deberías llevar**) matches the table above.
- Add 2026 holidays in `HOLIDAYS` when needed — data edit only.
- Do not port MAUI, XAML, or ViewModels.

## Out of scope

Accounts, persistence, holiday APIs, localization beyond the Spanish UI, configurable hours-per-day in the form.
