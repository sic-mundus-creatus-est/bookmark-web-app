using Microsoft.Playwright;

namespace BookMark.Playwright.tests;

public abstract class TestBase
{
    protected static string BaseUrl => "http://localhost:5173";

    protected static async Task<IPage> OpenNewPageAsync()
    {
        var context = await GlobalSetup.Browser.NewContextAsync();
        return await context.NewPageAsync();
    }
    
}
