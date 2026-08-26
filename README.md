# Worktime Calculator

A cross-platform .NET MAUI app that helps you track and analyze working hours over a date range. Enter your total hours worked between two dates and the app calculates expected hours, the difference, and your daily average—excluding weekends and configured public holidays.

## Features

- **Date range selection** — Pick a start and end date for the period you want to analyze.
- **Total working hours input** — Enter hours in `h:mm` format (e.g. `160:30`).
- **Expected working hours** — Computes 8 hours per working day in the range.
- **Hours difference** — Shows how many hours you are ahead or behind expectations; negative values are highlighted in red.
- **Daily average** — Divides total hours by the number of working days in the range.
- **Weekend and holiday exclusion** — Saturdays, Sundays, and a built-in list of public holidays are not counted as working days.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | .NET 9 |
| UI | .NET MAUI |
| MVVM | CommunityToolkit.Mvvm |
| Platforms | Android, iOS, macOS (Mac Catalyst), Windows |

## Project Structure

```
WorktimeCalculator/
├── Converters/          # XAML value converters (e.g. color for positive/negative)
├── Platforms/           # Platform-specific entry points and manifests
├── Resources/           # Icons, fonts, splash screen, styles
├── Utilities/           # Core calculation logic and helpers
├── ViewModels/          # MVVM view models
└── Views/               # XAML pages
```

Core business logic lives in `Utilities/WorktimeCalculator.cs`. The main UI is `Views/WorktimeCalculatorPage.xaml` bound to `ViewModels/WorktimeCalculatorVM.cs`.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- MAUI workload: `dotnet workload install maui`
- For mobile targets, the corresponding SDKs (Android SDK, Xcode for iOS/macOS, etc.)

## Build and Run

Restore and build from the repository root:

```bash
dotnet restore WorktimeCalculator.sln
dotnet build WorktimeCalculator.sln
```

Run on a specific platform (examples):

```bash
# Windows
dotnet build -t:Run -f net9.0-windows10.0.19041.0 WorktimeCalculator/WorktimeCalculator.csproj

# Android (device or emulator required)
dotnet build -t:Run -f net9.0-android WorktimeCalculator/WorktimeCalculator.csproj

# macOS
dotnet build -t:Run -f net9.0-maccatalyst WorktimeCalculator/WorktimeCalculator.csproj
```

You can also open `WorktimeCalculator.sln` in Visual Studio 2022 and run from the IDE.

## Usage

1. Set **Start Date** and **End Date** for your reporting period.
2. Enter your **Working hours** total in `h:mm` format.
3. Tap **Calculate**.

The app displays:

| Field | Description |
|-------|-------------|
| Expected Workinghours | 8 hours × number of working days in the range |
| Workinghours difference | Your total minus expected; red when behind |
| Daily Workinghours | Average hours per working day |

## Holidays

Public holidays are defined in `Utilities/WorktimeCalculator.cs` as a static list. The current list covers **2025** (Mexican federal holidays). To support other years or regions, extend or replace that list.

Working days exclude:

- Saturday and Sunday
- Dates in the holidays list

## Migration to a static site

The calculation logic has no server dependency. A plan to rebuild this as a static HTML page plus a small JavaScript module (in a **separate** repository) is in [MIGRATION.md](MIGRATION.md).

## License

No license file is present in this repository. Contact the repository owner for usage terms.
