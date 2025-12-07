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
    [Test]
    public async Task HasTitle()
    {
        await Page.GotoAsync("http://localhost:5173");

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
        await Page.GotoAsync("http://localhost:5173/home");

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
        await Page.GotoAsync("http://localhost:5173/sign-in");

        await Page.GetByLabel("Username/E-mail").FillAsync("admin");
        await Page.GetByLabel("Password").FillAsync("Admin123!");

        await Page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();
        await Expect(Page).ToHaveURLAsync(new Regex("/home"));
    }

}
