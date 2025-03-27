using CommunityToolkit.Mvvm.ComponentModel;
using System.Windows.Input;

namespace WorktimeCalculator.ViewModels;

public class WorktimeCalculatorVM() : ObservableObject
{
    private DateTime _startDate = new DateTime(2024, 12, 30);
    private DateTime _endDate = DateTime.Today;
    private string _workinghoursString = "0:00";
    private string _dailyWorkinghoursString = "0:00";

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

    public string DailyWorkinghours
    {
        get => _dailyWorkinghoursString;
        set => SetProperty(ref _dailyWorkinghoursString, value);
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
            _dailyWorkinghoursString = $"{dailyWorkinghours.Hours}:{dailyWorkinghours.Minutes}";
            OnPropertyChanged(nameof(DailyWorkinghours));
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
    }
}