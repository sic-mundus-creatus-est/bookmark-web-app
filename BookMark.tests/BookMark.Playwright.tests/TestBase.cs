using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;

namespace BookMark.Playwright.tests;

public abstract class TestBase
{
    protected static string BaseUrl => "http://localhost:5173";
    protected string SessionState = "";

    protected static async Task<IPage> OpenNewPageAsync(string? storageState = null)
    {
        BrowserNewContextOptions options = new();

        if (!string.IsNullOrEmpty(storageState))
           options.StorageState = storageState;

        var context = await GlobalSetup.Browser.NewContextAsync(options);
        return await context.NewPageAsync();
    }

    public static async Task<string> CreateSessionState(string username, string password)
    {
        var context = await GlobalSetup.Browser.NewContextAsync();
        var page = await context.NewPageAsync();

        await page.GotoAsync($"{BaseUrl}/sign-in");
        await page.GetByLabel("Username/E-mail").FillAsync(username);
        await page.GetByLabel("Password").FillAsync(password);
        await page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();

        await Expect(page).ToHaveURLAsync($"{BaseUrl}/home");

        await Expect(page.GetByText("Profile")).ToBeVisibleAsync();
        await Expect(page.GetByText("Sign Out")).ToBeVisibleAsync();

        var sessionState = await context.StorageStateAsync();

        await context.CloseAsync();

        return sessionState;
    }
    
}
