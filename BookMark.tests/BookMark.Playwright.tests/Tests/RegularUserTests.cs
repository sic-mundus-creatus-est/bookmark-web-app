using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;
using NUnit.Framework;
using System.Text.RegularExpressions;

namespace BookMark.Playwright.tests;

[Parallelizable(ParallelScope.All)]
[TestFixture]
public class RegularUserTests : TestBase
{   
    [OneTimeSetUp]
    public async Task OneTimeSetup()
    {
        SessionState = await CreateSessionState(username: "john.doe", password: "User123!");
    }

#region CANT_ACCESS_SIGN_IN_UP_PAGES_WHILE_SIGNED_IN

    [TestCase("/sign-in")]
    [TestCase("/sign-up")]
    public async Task AuthPages_RedirectToHome_WhenUserIsSignedIn(string path)
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}{path}");

        await Expect(page).ToHaveURLAsync($"{BaseUrl}/home");

        await page.Context.CloseAsync();
    }

#endregion

#region CAN_SIGN_OUT

    [Test]
    public async Task SignOut_SignsUserOut()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}");

        await Expect(page.GetByText("Sign Out")).ToBeVisibleAsync();
        await page.GetByText("Sign Out").ClickAsync();

        await Expect(page).ToHaveURLAsync($"{BaseUrl}/home");

        await Expect(page.GetByText("Sign In")).ToBeVisibleAsync();
        await Expect(page.GetByText("Sign Up")).ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

#endregion

#region CAN_EDIT_OWN_PROFILE

    [Test]
    public async Task UserProfilePage_ShowsEditButtonAndAllowsEditing_WhenUserIsOnItsOwnProfile()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");
        
        await page.GetByText("Profile").ClickAsync();
        await Expect(page).ToHaveURLAsync(new Regex("/user"));

        var editButton = page.GetByRole(AriaRole.Button, new() { Name = "Edit" });
        await Expect(editButton).ToBeVisibleAsync();
        await editButton.ClickAsync();

        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Cancel Editing" })).ToBeVisibleAsync();

        await page.GetByLabel("About Me").ClearAsync();
        var uniqueText = $"Edited About Me {DateTime.UtcNow:yyyyMMddHHmmss}";
        await page.GetByLabel("About Me").FillAsync(uniqueText);

        await page.GetByRole(AriaRole.Button, new() { Name = "Update" }).ClickAsync();

        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).ToBeVisibleAsync();
        
        await Expect(page.GetByTestId("description").First).ToContainTextAsync("Edited About Me");

        await page.Context.CloseAsync();
    }

#endregion

#region CAN_REVIEW_BOOKS

    [Test]
    public async Task BookPage_ShowsPostReviewForm_WhenUserIsSignedIn()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page.GetByText("Post Review")).ToBeVisibleAsync();

        var reviewBox = page.GetByRole(AriaRole.Textbox, new() { Name = "Review Content" });
        await Expect(reviewBox).ToBeVisibleAsync();
        await reviewBox.FillAsync("Test Review");
        await page.GetByText("Post Review").ClickAsync();

        await Expect(page.GetByTestId("current-user-book-review")).ToBeVisibleAsync();

        // deleting the review
        await page.GetByTestId("delete-review").ClickAsync();
        await Expect(page.GetByTestId("current-user-book-review")).Not.ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

#endregion

#region CANT_EDIT_BOOKS_GENRES_AUTHORS

    [Test]
    public async Task BookPage_DoesNotShowEditButton_WhenUserIsNotAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).Not.ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task AuthorPage_DoesNotShowEditButton_WhenUserIsNotAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));

        var authorRegion = page.GetByRole(AriaRole.Region, new() { Name = "Authors" });
        await authorRegion.GetByRole(AriaRole.Link).First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/author"));
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).Not.ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task GenrePage_DoesNotShowEditButton_WhenUserIsNotAdmin()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));

        var genreRegion = page.GetByRole(AriaRole.Region, new() { Name = "Genres" });
        await genreRegion.GetByRole(AriaRole.Link).First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/genre"));
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).Not.ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task UserPage_DoesNotShowEditButton_WhenUserIsNotOwnerOrAdmin()
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
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).Not.ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

#endregion

    [Test]
    public async Task FloatingActionMenu_NotShown_WhenUserIsOnlyRegular()
    {
        var page = await OpenNewPageAsync(SessionState);
        await page.GotoAsync($"{BaseUrl}/home");

        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Toggle Floating Action Menu" })).Not.ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

}
