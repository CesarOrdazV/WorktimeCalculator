namespace WorktimeCalculator.Utilities;

public static class WorktimeCalculator
{
    private static readonly List<DateTime> holydays = new()
    {
        new DateTime(2025, 01, 01),
        new DateTime(2025, 02, 03),
        new DateTime(2025, 03, 17),
        new DateTime(2025, 04, 17),
        new DateTime(2025, 04, 18),
        new DateTime(2025, 05, 01),
        new DateTime(2025, 09, 16),
        new DateTime(2025, 11, 18),
        new DateTime(2025, 12, 25),       
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