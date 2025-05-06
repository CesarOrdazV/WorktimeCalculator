using CommunityToolkit.Mvvm.ComponentModel;
using System.Windows.Input;

namespace WorktimeCalculator.ViewModels;

public class WorktimeCalculatorVM() : ObservableObject
{
    private DateTime _startDate = new DateTime(2024, 12, 30);
    private DateTime _endDate = DateTime.Today;
    private string _workinghoursString = "0:00";
    private string _expectedWorkinghours = "0:00";
    private string _workinghoursDifference = "0:00";
    private string _dailyWorkinghoursString = "0:00";
    private bool _isPositive = true;

    public DateTime StartDate
    {
        get => _startDate;
        set => SetProperty(ref _startDate, value);
    }
    public DateTime EndDate
    {
        get => _endDate;
        set => SetProperty(ref _endDate, value);
    }
    public string Workinghours
    {
        get => _workinghoursString;
        set => SetProperty(ref _workinghoursString, value);
    }

    public string ExpectedWorkinghours
    {
        get => _expectedWorkinghours;
        set => SetProperty(ref _expectedWorkinghours, value);
    }

    public string WorkinghoursDifference
    {
        get => _workinghoursDifference;
        set => SetProperty(ref _workinghoursDifference, value);
    }

    public string DailyWorkinghours
    {
        get => _dailyWorkinghoursString;
        set => SetProperty(ref _dailyWorkinghoursString, value);
    }

    public bool IsPositive
    {
        get => _isPositive;
        set => SetProperty(ref _isPositive, value);
    }
    public ICommand CalculateDailyWorkingHoursCommand => new Command(CalculateDailyWorkingHours);

    private void CalculateDailyWorkingHours()
    {
        try
        {
            var workinghours = new TimeSpan(0, 0, 0);
            string[] parts = _workinghoursString.Split(':');

            if (parts.Length == 2 && int.TryParse(parts[0], out int hours) && int.TryParse(parts[1], out int minutes))
            {
                workinghours = new TimeSpan(hours, minutes, 0);
            }

            var dailyWorkinghours = Utilities.WorktimeCalculator.CalculateDailyWorkingHours(_startDate, _endDate, workinghours);
            var expectedWorkinghours = Utilities.WorktimeCalculator.CalculateExpectedWorkinghours(_startDate, _endDate);
            _dailyWorkinghoursString = $"{dailyWorkinghours.Hours}:{dailyWorkinghours.Minutes}";
            _expectedWorkinghours = $"{(int)expectedWorkinghours.TotalHours}:{expectedWorkinghours.Minutes}";

            var minutesDifference = workinghours.TotalMinutes - expectedWorkinghours.TotalMinutes;
            var difference = TimeSpan.FromMinutes(minutesDifference);
            _isPositive = difference.TotalHours >= 0; 
            var differenceHours = Math.Abs((int)difference.TotalHours);
            var differenceMinutes = Math.Abs(difference.Minutes);
            _workinghoursDifference = $"{differenceHours}:{differenceMinutes}";

            OnPropertyChanged(nameof(DailyWorkinghours));
            OnPropertyChanged(nameof(ExpectedWorkinghours));
            OnPropertyChanged(nameof(WorkinghoursDifference));
            OnPropertyChanged(nameof(IsPositive));
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}