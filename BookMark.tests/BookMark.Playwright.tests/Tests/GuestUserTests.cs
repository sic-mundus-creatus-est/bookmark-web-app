using System.Text.RegularExpressions;
using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;
using NUnit.Framework;

namespace BookMark.Playwright.tests;

[Parallelizable(ParallelScope.All)]
[TestFixture]
public class GuestUserTests : TestBase
{
    [Test]
    public async Task HasTitle()
    {
        var page = await OpenNewPageAsync();
        await page.GotoAsync(BaseUrl);

        await Expect(page).ToHaveURLAsync(new Regex("/home"));
        await Expect(page).ToHaveTitleAsync(new Regex("BookMark"));

        await page.Context.CloseAsync();
    }

#region CAN_NAVIGATE

    [TestCase("Books", "/books", "Book")]
    [TestCase("Comics", "/comics", "Comic")]
    [TestCase("Manga", "/manga", "Manga")]
    public async Task ClickingNavLink_ShowsOnlyExpectedBookType( string navLinkName,
                                                                string expectedUrl,
                                                                string expectedType )
    {
        var page = await OpenNewPageAsync();

        await page.GotoAsync($"{BaseUrl}/home");

        var navLink = page.GetByRole(AriaRole.Link, new() { Name = navLinkName });
        await navLink.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex(expectedUrl));

        // expects the nav link to be "active"
        await Expect(navLink).ToHaveClassAsync(new Regex("font-extrabold.*text-popover"));

        var cards = await page.GetByTestId("book-card").AllAsync();
        foreach (var card in cards)
        {// check to see if all books are of expected type
            await Expect(card).ToHaveAttributeAsync("data-book-type", expectedType);
        }

        await page.Context.CloseAsync();
    }

#endregion

#region CAN_SEARCH

    [Test]
    public async Task Search_ShowsNoResults_WhenSearchTermHasNoMatches()
    {
        var page = await OpenNewPageAsync();

        var searchTerm = "no_matches";
        await page.GotoAsync($"{BaseUrl}");

        await page.GetByLabel("Search Term Input")
                    .Locator("visible=true") // since both navbars, mobile&desktop, are in DOM and we need only the visible one (one is always hidden)
                    .FillAsync(searchTerm);
        await page.GetByLabel("Submit Search")
                    .Locator("visible=true")
                    .ClickAsync();

        await Expect(page).ToHaveURLAsync($"{BaseUrl}/all?search-term=test");

        await Expect(page.GetByText($"No results found for \"{searchTerm}\"."))
                         .ToBeVisibleAsync();

        await Expect(page.GetByTestId("book-card")).ToHaveCountAsync(0);

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task Search_ShowsResults_WhenSearchTermHasMatches()
    {
        var page = await OpenNewPageAsync();

        var searchTerm = "tolkien";
        await page.GotoAsync($"{BaseUrl}");

        await page.GetByLabel("Search Term Input")
                  .Locator("visible=true")
                  .FillAsync(searchTerm);

        await page.GetByLabel("Submit Search")
                  .Locator("visible=true")
                  .ClickAsync();

        await Expect(page).ToHaveURLAsync($"{BaseUrl}/all?search-term={searchTerm}");

        await Expect(page.GetByText($"Search results for \"{searchTerm}\":"))
                         .ToBeVisibleAsync();

        var cardsLocator = page.GetByTestId("book-card");

        var count = await cardsLocator.CountAsync();
        Assert.That(count, Is.GreaterThan(0), "Expected at least one search result card. Did you run NUnit tests first?");

        for (int i = 0; i < count; i++)
        {
            var card = cardsLocator.Nth(i);
            await Expect(card).ToContainTextAsync(searchTerm, new() { IgnoreCase = true });
        }

        await page.Context.CloseAsync();
    }

#endregion

#region CANT_EDIT

    [Test]
    public async Task BookPage_DoesNotShowEditButton_WhenUserIsNotSignedIn()
    {
        var page = await OpenNewPageAsync();
        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/book"));
        await Expect(page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).Not.ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task AuthorPage_DoesNotShowEditButton_WhenUserIsNotSignedIn()
    {
        var page = await OpenNewPageAsync();
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
    public async Task GenrePage_DoesNotShowEditButton_WhenUserIsNotSignedIn()
    {
        var page = await OpenNewPageAsync();
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
    public async Task UserPage_DoesNotShowEditButton_WhenUserIsNotSignedIn()
    {
        var page = await OpenNewPageAsync();
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

#region CANT_REVIEW

    [Test]
    public async Task BookPage_DoesNotShowPostReviewForm_WhenUserIsNotSignedIn()
    {
        var page = await OpenNewPageAsync();

        await page.GotoAsync($"{BaseUrl}/home");

        await page.GetByTestId("book-card").First.ClickAsync();

        await Expect(page.GetByText("Post Review")).Not.ToBeVisibleAsync();
        
        await page.Context.CloseAsync();
    }

#endregion

#region CAN_SIGN_IN

    [Test]
    public async Task SignIn_SignsUserInAndNavigatesToHome_WhenCredentialsAreValid()
    {
        var page = await OpenNewPageAsync();

        await page.GotoAsync($"{BaseUrl}/sign-in");

        await page.GetByLabel("Username/E-mail").FillAsync("admin");
        await page.GetByLabel("Password").FillAsync("Admin123!");

        await page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();
        await Expect(page).ToHaveURLAsync(new Regex("/home"));

        await page.Context.CloseAsync();
    }

    [Test]
    public async Task SignIn_ShowsErrorMessage_WhenCredentialsAreInvalid()
    {
        var page = await OpenNewPageAsync();

        await page.GotoAsync($"{BaseUrl}/sign-in");

        await page.GetByLabel("Username/E-mail").FillAsync("admin");
        await page.GetByLabel("Password").FillAsync("invalid");

        await page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();
        await Expect(page).ToHaveURLAsync(new Regex("/sign-in"));
        await Expect(page.GetByText("Invalid username or password. Please check your credentials and try again."))
                         .ToBeVisibleAsync();

        await page.Context.CloseAsync();
    }

    [TestCase("", "", TestName = "SignIn_ShowsErrorMessage_WhenBothFieldsAreEmpty")]
    [TestCase("admin", "", TestName = "SignIn_ShowsErrorMessage_WhenPasswordIsEmpty")]
    [TestCase("", "Admin123!", TestName = "SignIn_ShowsErrorMessage_WhenUsernameIsEmpty")]
    public async Task SignIn_ShowsErrorMessage_WhenFormIsNotFull(string usernameOrEmail, string password)
    {
        var page = await OpenNewPageAsync();

        await page.GotoAsync($"{BaseUrl}/sign-in");

        await page.GetByLabel("Username/E-mail").FillAsync(usernameOrEmail);
        await page.GetByLabel("Password").FillAsync(password);

        await page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();

        await Expect(page).ToHaveURLAsync(new Regex("/sign-in"));
        await Expect(page.GetByText("Please enter both your username/email and password."))
                         .ToBeVisibleAsync();
        
        await page.Context.CloseAsync();
    }

#endregion

}
