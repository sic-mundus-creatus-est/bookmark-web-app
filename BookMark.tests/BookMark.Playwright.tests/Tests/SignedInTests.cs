using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;
using NUnit.Framework;

namespace BookMark.Playwright.tests;

[Parallelizable(ParallelScope.Self)]
[TestFixture]
public class SignedInTests : TestBase
{   
    private IPage _page;

    [SetUp]
    public async Task Setup()
    {
        _page = await OpenNewPageAsync();

        await _page.GotoAsync($"{BaseUrl}/sign-in");

        await _page.GetByLabel("Username/E-mail").FillAsync("admin");
        await _page.GetByLabel("Password").FillAsync("Admin123!");

        await _page.GetByRole(AriaRole.Button, new() { Name = "Sign In" }).ClickAsync();

        await Expect(_page).ToHaveURLAsync($"{BaseUrl}/home");

        await Expect(_page.GetByText("Profile")).ToBeVisibleAsync();
        await Expect(_page.GetByText("Sign Out")).ToBeVisibleAsync();
    }

    [TearDown]
    public async Task Teardown()
    {
        await _page.Context.CloseAsync();
    }

    [TestCase("/sign-in")]
    [TestCase("/sign-up")]
    public async Task AuthPages_RedirectToHome_WhenUserIsSignedIn(string path)
    {
        await _page.GotoAsync($"{BaseUrl}{path}");

        await Expect(_page).ToHaveURLAsync($"{BaseUrl}/home");
    }

    [Test]
    public async Task SignOut_SignsUserOut()
    {
        await _page.GotoAsync($"{BaseUrl}");

        await Expect(_page.GetByText("Sign Out")).ToBeVisibleAsync();
        await _page.GetByText("Sign Out").ClickAsync();

        await Expect(_page).ToHaveURLAsync($"{BaseUrl}/home");

        await Expect(_page.GetByText("Sign In")).ToBeVisibleAsync();
        await Expect(_page.GetByText("Sign Up")).ToBeVisibleAsync();
    }

    [Test]
    public async Task BookPage_ShowsPostReviewForm_WhenUserIsSignedIn()
    {
        await _page.GotoAsync($"{BaseUrl}/home");

        var cardsLocator = _page.GetByTestId("book-card");
        await cardsLocator.Nth(1).ClickAsync();

        await Expect(_page.GetByText("Post Review")).ToBeVisibleAsync();
    }

    [Test]
    public async Task UserProfilePage_ShowsEditButton_WhenUserIsOnItsOwnProfile()
    {
        await _page.GotoAsync($"{BaseUrl}/home");
        
        await _page.GetByText("Profile").ClickAsync();

        await Expect(_page.GetByRole(AriaRole.Button, new() { Name = "Edit" })).ToBeVisibleAsync();
    }

}
