using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;
using NUnit.Framework;
using System.Text.RegularExpressions;

namespace BookMark.Playwright.tests;

[Parallelizable(ParallelScope.All)]
[TestFixture]
public class AdminUserTests : TestBase
{   
    [OneTimeSetUp]
    public async Task OneTimeSetup()
    {
        SessionState = await CreateSessionState(username: "admin", password: "Admin123!");
    }

    [Test]
    public async Task FloatingActionMenu_Shown_WhenUserIsAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        var toggleButton = page.GetByRole(AriaRole.Button, new() { Name = "Toggle Floating Action Menu" });
        await Expect(toggleButton).ToBeVisibleAsync();
        await toggleButton.ClickAsync();

        await Expect(page.GetByRole(AriaRole.Link, new() { Name = "Add Book" })).ToBeVisibleAsync();
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Add Genre" })).ToBeVisibleAsync();
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Add Author" })).ToBeVisibleAsync();

        await toggleButton.ClickAsync();

        await Expect(page.GetByRole(AriaRole.Link, new() { Name = "Add Book" })).Not.ToBeVisibleAsync();
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Add Genre" })).Not.ToBeVisibleAsync();
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Add Author" })).Not.ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    #region CAN_EDIT_EVERYTHING

    [Test]
    public async Task BookPage_ShowsEditButton_WhenUserIsAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task AuthorPage_ShowsEditButton_WhenUserIsAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));

        var authorRegion = page.GetByRole(AriaRole.Region, new() { Name = "Authors" });
        await authorRegion.GetByRole(AriaRole.Link).First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/author"));
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task GenrePage_ShowsEditButton_WhenUserIsAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));

        var genreRegion = page.GetByRole(AriaRole.Region, new() { Name = "Genres" });
        await genreRegion.GetByRole(AriaRole.Link).First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/genre"));
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    #endregion
}
