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
    public async Task ClickingNavLink_ShowsOnlyCorrectBookType( string navLinkName,
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
    public async Task SignIn_WithValidCredentials_NavigatesToHome()
    {
        await Page.GotoAsync($"{BaseUrl}/sign-in");

        await Page.GetByLabel("Username/E-mail").FillAsync("admin");
        await Page.GetByLabel("Password").FillAsync("Admin123!");

        await Page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();
        await Expect(Page).ToHaveURLAsync(new Regex("/home"));
    }

    [Test]
    public async Task SignIn_WithInvalidCredentials_DisplaysErrorMessage()
    {
        await Page.GotoAsync($"{BaseUrl}/sign-in");

        await Page.GetByLabel("Username/E-mail").FillAsync("admin");
        await Page.GetByLabel("Password").FillAsync("invalid");

        await Page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();
        await Expect(Page).ToHaveURLAsync(new Regex("/sign-in"));
        await Expect(Page.GetByText("Invalid username or password. Please check your credentials and try again."))
                         .ToBeVisibleAsync();
    }

    [TestCase("", "", TestName = "SignIn_BothFieldsEmpty_DisplaysErrorMessage")]
    [TestCase("admin", "", TestName = "SignIn_PasswordEmpty_DisplaysErrorMessage")]
    [TestCase("", "Admin123!", TestName = "SignIn_UsernameEmpty_DisplaysErrorMessage")]
    public async Task SignIn_WithEmptyCredentials_DisplaysErrorMessage(string usernameOrEmail, string password)
    {
        await Page.GotoAsync($"{BaseUrl}/sign-in");

        await Page.GetByLabel("Username/E-mail").FillAsync(usernameOrEmail);
        await Page.GetByLabel("Password").FillAsync(password);

        await Page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();

        await Expect(Page).ToHaveURLAsync(new Regex("/sign-in"));
        await Expect(Page.GetByText("Please enter both your username/email and password."))
                         .ToBeVisibleAsync();
    }

}
