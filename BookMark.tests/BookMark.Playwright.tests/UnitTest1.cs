using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using NUnit.Framework;

namespace BookMark.Playwright.tests;

[Parallelizable(ParallelScope.Self)]
[TestFixture]
public class ExampleTest : PageTest
{
    private static string BaseUrl => "http://localhost:5173";

    [Test]
    public async Task HasTitle()
    {
        await Page.GotoAsync(BaseUrl);

        await Expect(Page).ToHaveURLAsync(new Regex("/home"));

        await Expect(Page).ToHaveTitleAsync(new Regex("BookMark"));
    }

    [TestCase("Books", "/books", "Book")]
    [TestCase("Comics", "/comics", "Comic")]
    [TestCase("Manga", "/manga", "Manga")]
    public async Task ClickingNavLink_ShowsOnlyExpectedBookType( string navLinkName,
                                                                string expectedUrl,
                                                                string expectedType )
    {
        await Page.GotoAsync($"{BaseUrl}/home");

        var navLink = Page.GetByRole(AriaRole.Link, new() { Name = navLinkName });
        await navLink.ClickAsync();

        await Expect(Page).ToHaveURLAsync(new Regex(expectedUrl));

        // expects the nav link to be "active"
        await Expect(navLink).ToHaveClassAsync(new Regex("font-extrabold.*text-popover"));

        var cardsLocator = Page.GetByTestId("book-card");
        await cardsLocator.First.WaitForAsync();

        var cards = await cardsLocator.AllAsync();
        foreach (var card in cards)
        {// check to see if all books are of expected type
            await Expect(card).ToHaveAttributeAsync("data-book-type", expectedType);
        }
    }

    [Test]
    public async Task SignIn_SignsUserInAndNavigatesToHome_WhenCredentialsAreValid()
    {
        await Page.GotoAsync($"{BaseUrl}/sign-in");

        await Page.GetByLabel("Username/E-mail").FillAsync("admin");
        await Page.GetByLabel("Password").FillAsync("Admin123!");

        await Page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();
        await Expect(Page).ToHaveURLAsync(new Regex("/home"));
    }

    [Test]
    public async Task SignIn_ShowsErrorMessage_WhenCredentialsAreInvalid()
    {
        await Page.GotoAsync($"{BaseUrl}/sign-in");

        await Page.GetByLabel("Username/E-mail").FillAsync("admin");
        await Page.GetByLabel("Password").FillAsync("invalid");

        await Page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();
        await Expect(Page).ToHaveURLAsync(new Regex("/sign-in"));
        await Expect(Page.GetByText("Invalid username or password. Please check your credentials and try again."))
                         .ToBeVisibleAsync();
    }

    [TestCase("", "", TestName = "SignIn_ShowsErrorMessage_WhenBothFieldsAreEmpty")]
    [TestCase("admin", "", TestName = "SignIn_ShowsErrorMessage_WhenPasswordIsEmpty")]
    [TestCase("", "Admin123!", TestName = "SignIn_ShowsErrorMessage_WhenUsernameIsEmpty")]
    public async Task SignIn_ShowsErrorMessage_WhenFormIsNotFull(string usernameOrEmail, string password)
    {
        await Page.GotoAsync($"{BaseUrl}/sign-in");

        await Page.GetByLabel("Username/E-mail").FillAsync(usernameOrEmail);
        await Page.GetByLabel("Password").FillAsync(password);

        await Page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();

        await Expect(Page).ToHaveURLAsync(new Regex("/sign-in"));
        await Expect(Page.GetByText("Please enter both your username/email and password."))
                         .ToBeVisibleAsync();
    }

    [Test]
    public async Task Search_ShowsNoResults_WhenSearchTermHasNoMatches()
    {
        var searchTerm = "test";
        await Page.GotoAsync($"{BaseUrl}");

        await Page.GetByLabel("Search Term Input")
                    .Locator("visible=true") // since both navbars, mobile&desktop, are in DOM and we need only the visible one (one is always hidden)
                    .FillAsync(searchTerm);
        await Page.GetByLabel("Submit Search")
                    .Locator("visible=true")
                    .ClickAsync();

        await Expect(Page).ToHaveURLAsync($"{BaseUrl}/all?search-term=test");

        await Expect(Page.GetByText($"No results found for \"{searchTerm}\"."))
                         .ToBeVisibleAsync();

        var cardsLocator = Page.GetByTestId("book-card");
        await Expect(cardsLocator).ToHaveCountAsync(0);
    }

}
