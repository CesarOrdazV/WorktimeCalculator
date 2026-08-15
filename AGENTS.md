# Agent Guide — Worktime Calculator

This document helps AI coding agents work effectively in this repository.

## Repository Overview

**Worktime Calculator** is a small .NET MAUI application (.NET 9) for analyzing working hours over a date range. It is not a backend service or multi-module monorepo—the entire app lives under `WorktimeCalculator/`.

| Path | Purpose |
|------|---------|
| `WorktimeCalculator/Utilities/WorktimeCalculator.cs` | Working-day count, expected hours, daily average |
| `WorktimeCalculator/ViewModels/WorktimeCalculatorVM.cs` | Main view model; parse input and bind results |
| `WorktimeCalculator/Views/WorktimeCalculatorPage.xaml` | Primary (and only) user screen |
| `WorktimeCalculator/Converters/BoolToColorConverter.cs` | Red text when hours difference is negative |
| `WorktimeCalculator/MauiProgram.cs` | App bootstrap; minimal configuration |

## Conventions

- **Language**: C# with `ImplicitUsings` and `Nullable` enabled.
- **MVVM**: View models use `CommunityToolkit.Mvvm` (`ObservableObject`, `SetProperty`, `ICommand` via `Command`).
- **Namespaces**: Match folder structure (e.g. `WorktimeCalculator.ViewModels`).
- **Time format**: User input and display use `h:mm` strings (hours and minutes separated by `:`).
- **Working day rules**: Monday–Friday minus dates in the static `holydays` list in `WorktimeCalculator.cs` (note: the field name is `holydays`, not `holidays`).
- **Expected hours**: Fixed at **8 hours per working day**; change `CalculateExpectedWorkinghours` if this should be configurable.

## Build Commands

From the repo root:

```bash
dotnet restore WorktimeCalculator.sln
dotnet build WorktimeCalculator.sln
```

Target a single platform when validating:

```bash
dotnet build WorktimeCalculator/WorktimeCalculator.csproj -f net9.0-windows10.0.19041.0
```

There is no dedicated test project. If you add tests, prefer a `WorktimeCalculator.Tests` project targeting `Utilities/WorktimeCalculator.cs` logic.

## Common Tasks

### Add or update public holidays

Edit the `holydays` list in `WorktimeCalculator/Utilities/WorktimeCalculator.cs`. Use `DateTime` with year, month, day. Holidays are matched by full date (year included).

### Change expected hours per day

Modify `CalculateExpectedWorkinghours` in `WorktimeCalculator.cs` (currently `8 * countWorkingDays`).

### New UI fields

1. Add properties to `WorktimeCalculatorVM`.
2. Update calculation in `CalculateDailyWorkingHours` (or a new command).
3. Bind controls in `WorktimeCalculatorPage.xaml`.

### Platform-specific changes

Use `WorktimeCalculator/Platforms/<platform>/` only when necessary. Most features should stay in shared MAUI code.

## Pitfalls

- **Empty working-day range**: If every day in the range is a weekend or holiday, `CountWorkingDays` returns 0 and `CalculateDailyWorkingHours` will divide by zero.
- **Input parsing**: `Workinghours` is parsed manually in the view model; invalid `h:mm` input silently falls back to `0:00`.
- **Holiday scope**: Only dates in the hardcoded list are excluded; there is no locale or year auto-detection.
- **XAML**: `WorktimeCalculatorPage.xaml` uses `x:DataType` for compiled bindings; keep bindings aligned with `WorktimeCalculatorVM` properties.

## Dependencies

- `Microsoft.Maui.Controls` (via SDK MAUI version)
- `CommunityToolkit.Mvvm` 8.4.0
- `Microsoft.Extensions.Logging.Debug` 9.0.0

Do not add packages without a clear need; the app intentionally stays minimal.

## Pull Requests

- Keep changes focused; this is a small app.
- Update `README.md` if user-facing behavior or setup steps change.
- Update this file if project structure, conventions, or agent workflows change.
- English for user-facing docs and commit messages.

## Out of Scope (unless explicitly requested)

- Cloud sync, persistence, or user accounts
- Localization beyond the current English UI strings
- Dynamic holiday APIs (current design is a static list)
