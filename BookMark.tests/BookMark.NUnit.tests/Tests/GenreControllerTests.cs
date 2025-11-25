using BookMark.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.NUnit.tests;

[TestFixture]
public class GenreControllerTests
{
    private IServiceScope _scope;
    private GenreController _controller;
    
    [SetUp]
    public void Setup()
    {
        _scope = GlobalTestSetup.Factory.Services.CreateScope();
        _controller = _scope.ServiceProvider.GetRequiredService<GenreController>();
    }

    [TearDown]
    public void TearDown()
    {
        _scope.Dispose();
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsInvalid()
    {
        var result = (await _controller.Get("random-id")).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }
}
