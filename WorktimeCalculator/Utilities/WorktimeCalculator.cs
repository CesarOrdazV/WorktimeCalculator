namespace WorktimeCalculator.Utilities;

public static class WorktimeCalculator
{
    private static readonly List<DateTime> holydays = new()
    {
        new DateTime(2026, 01, 01),
        new DateTime(2026, 02, 02),
        new DateTime(2026, 03, 16),
        new DateTime(2026, 04, 02),
        new DateTime(2026, 04, 03),
        new DateTime(2026, 05, 01),
        new DateTime(2026, 09, 16),
        new DateTime(2026, 11, 16),
        new DateTime(2026, 12, 25),
    };

    public static TimeSpan CalculateExpectedWorkinghours(DateTime startDate, DateTime endDate)
    {
        var countWorkingDays = CountWorkingDays(startDate, endDate);
        var expectedWorkinghours = 8 * countWorkingDays;

        return TimeSpan.FromHours(expectedWorkinghours);
    }

    public static TimeSpan CalculateDailyWorkingHours(DateTime startDate, DateTime endDate, TimeSpan workingHours)
    {
        var countWorkingDays = CountWorkingDays(startDate, endDate);
        var dailyWorkingHours = (float)workingHours.TotalHours / countWorkingDays;

        return TimeSpan.FromHours(dailyWorkingHours);
    }

    private static int CountWorkingDays(DateTime startDate, DateTime endDate)
    {
        var workingDays = 0;

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            if (date.DayOfWeek == DayOfWeek.Sunday || date.DayOfWeek == DayOfWeek.Saturday || holydays.Contains(date))
                continue;

            workingDays++;
        }

        return workingDays;
    }
}