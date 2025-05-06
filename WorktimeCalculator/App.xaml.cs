namespace WorktimeCalculator;

public partial class App : Application
{
	public App()
	{
		InitializeComponent();
	}

	protected override Window CreateWindow(IActivationState? activationState)
	{
		var window = new Window(new AppShell());

		if (DeviceInfo.Platform == DevicePlatform.WinUI)
		{
			window.Width = 360;
			window.Height = 480;
		}

		return window;
	}
}