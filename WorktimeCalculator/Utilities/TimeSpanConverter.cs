using System;
using System.Globalization;

namespace WorktimeCalculator.Utilities;

public class TimeSpanConverter : IValueConverter
{
    // Convert from string to TimeSpan
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is string timeString)
        {
            if (TimeSpan.TryParse(timeString, out TimeSpan timeSpan))
            {
                return timeSpan;
            }
        }
        
        return TimeSpan.Zero;
    }

    // Convert from TimeSpan to string
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is TimeSpan timeSpan)
        {
            return timeSpan.ToString(@"hh\:mm");
        }
        return string.Empty;
    }
}