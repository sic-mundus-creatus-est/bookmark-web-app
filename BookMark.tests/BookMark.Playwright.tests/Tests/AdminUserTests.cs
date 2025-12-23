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

#region CAN_USE_ACTION_MENU

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

    [Test]
    public async Task FloatingActionMenu_AddBook_NavigatesToAddBookPage()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        var toggleButton = page.GetByRole(AriaRole.Button, new() { Name = "Toggle Floating Action Menu" });
        await Expect(toggleButton).ToBeVisibleAsync();
        await toggleButton.ClickAsync();

        await page.GetByRole(AriaRole.Link, new() { Name = "Add Book" }).ClickAsync();
        await Expect(page).ToHaveURLAsync(new Regex("/add-book"));

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task FloatingActionMenu_AddGenre_OpensAddGenreModal()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await Expect(page.GetByTestId("genre-modal")).Not.ToBeVisibleAsync();

        var toggleButton = page.GetByRole(AriaRole.Button, new() { Name = "Toggle Floating Action Menu" });
        await Expect(toggleButton).ToBeVisibleAsync();
        await toggleButton.ClickAsync();

        await page.GetByRole(AriaRole.Button, new() { Name = "Add Genre" }).ClickAsync();
        await Expect(page.GetByTestId("genre-modal")).ToBeVisibleAsync();

        await page.GetByLabel("Name").FillAsync("Test Genre");
        await page.GetByLabel("Description").FillAsync("Just a test genre, soon to be deleted...");
        await page.GetByRole(AriaRole.Button, new() { Name = "Add" }).ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/genre"));
        await page.GetByRole(AriaRole.Button, new() { Name = "Edit" }).ClickAsync();
        await page.GetByTestId("Delete").ClickAsync();
        await Expect(page).ToHaveURLAsync(new Regex("/home"));

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task FloatingActionMenu_AddAuthor_OpensAddAuthorModal()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await Expect(page.GetByTestId("author-modal")).Not.ToBeVisibleAsync();

        var toggleButton = page.GetByRole(AriaRole.Button, new() { Name = "Toggle Floating Action Menu" });
        await Expect(toggleButton).ToBeVisibleAsync();
        await toggleButton.ClickAsync();

        await page.GetByRole(AriaRole.Button, new() { Name = "Add Author" }).ClickAsync();
        await Expect(page.GetByTestId("author-modal")).ToBeVisibleAsync();

        await page.GetByLabel("Name").FillAsync("Test Author");
        await page.GetByRole(AriaRole.Button, new() { Name = "Add" }).ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/author"));
        await page.GetByRole(AriaRole.Button, new() { Name = "Edit" }).ClickAsync();
        await page.GetByTestId("Delete").ClickAsync();
        await Expect(page).ToHaveURLAsync(new Regex("/home"));

        await page.Context.CloseAsync();
    }

#endregion

#region CAN_EDIT_EVERYTHING

    [Test]
    public async Task BookPage_ShowsEditButton_WhenUserIsAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));
        var editButton = page.GetByRole(AriaRole.Button, new() { Name = "Edit" });
        await Expect(editButton).ToBeVisibleAsync();
        await editButton.ClickAsync();

        await page.GetByRole(AriaRole.Button, new() { Name = "Update" }).ClickAsync();
        await Expect(page.GetByText("You haven’t made any changes.")).ToBeVisibleAsync();

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

    [Test]
    public async Task AnyUserProfilePage_ShowsEditButton_WhenUserIsAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        var ratedBook = page.GetByTestId("book-card")
                            .Filter(new LocatorFilterOptions { Has = page.GetByTestId("rated-book") }).First;
        await ratedBook.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));
        await Expect(page.GetByTestId("book-community-reviews")).ToBeVisibleAsync();

        var firstReviewCard = page.GetByTestId("book-review").First;
        await firstReviewCard.GetByRole(AriaRole.Link).ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/user"));
        var editButton = page.GetByRole(AriaRole.Button, new() { Name = "Edit" });
        await Expect(editButton).ToBeVisibleAsync();
        await editButton.ClickAsync();

        var uniqueText = $"{DateTime.UtcNow:yyyyMMddHHmmss}";
        await page.GetByLabel("About Me").FillAsync($"(touched by an admin) + {uniqueText}");

        await page.GetByRole(AriaRole.Button, new() { Name = "Update" }).ClickAsync();

        await Expect(page.GetByTestId("description").First).ToContainTextAsync(new Regex("(touched by an admin)"));

        await page.Context.CloseAsync();
    }

#endregion

}
