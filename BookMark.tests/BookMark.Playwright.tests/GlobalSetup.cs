using Microsoft.Playwright;
using NUnit.Framework;

namespace BookMark.Playwright.tests;

[SetUpFixture]
public class GlobalSetup
{
    public static IPlaywright PlaywrightInstance { get; private set; }
    public static IBrowser Browser { get; private set; }

    [OneTimeSetUp]
    public async Task Setup()
    {
        var browserName = Environment.GetEnvironmentVariable("BROWSER") ?? "chromium";

        PlaywrightInstance = await Microsoft.Playwright.Playwright.CreateAsync();
        Browser = browserName switch
        {
            "chromium" => await PlaywrightInstance.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true }),
            "firefox"  => await PlaywrightInstance.Firefox.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true }),
            "webkit"   => await PlaywrightInstance.Webkit.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true }),
            _ => throw new ArgumentException($"Unknown browser: {browserName}")
        };
    }

    [OneTimeTearDown]
    public async Task Teardown()
    {
        await Browser.CloseAsync();
        PlaywrightInstance.Dispose();
    }

}
