using WorktimeCalculator.ViewModels;

namespace WorktimeCalculator.Views;

public partial class WorktimeCalculatorPage : ContentPage
{
    public WorktimeCalculatorPage()
    {
        InitializeComponent();
        BindingContext = new WorktimeCalculatorVM();
    }
}