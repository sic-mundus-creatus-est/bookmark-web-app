using BookMark.Controllers;
using BookMark.Models.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.tests;

// [MethodName]_[ExpectedOutcome]_[Scenario/Condition]

[TestFixture]
public class Tests
{
    private WebApplicationFactory<Program> _factory = null!;
    private BookController _bookController = null!;
    
    private const string TestBookId = "b28cb09a-0dfc-426b-afa6-289b140e8034";

    [SetUp]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>();
        var _scope = _factory.Services.CreateScope();
        var services = _scope.ServiceProvider;
        _bookController = services.GetRequiredService<BookController>();
    }

    [TearDown]
    public void TearDown()
    {
        _factory?.Dispose();
    }

    [Test]
    public async Task Get_ReturnsOk_WhenABookExists()
    {
        var result = (await _bookController.Get(TestBookId)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var dto = ((OkObjectResult)result!).Value as BookResponseDTO;
        Assert.That(dto, Is.Not.Null);
        Assert.That(dto!.Id, Is.EqualTo(TestBookId));
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsInvalid()
    {
        var result = (await _bookController.Get("random-id")).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsEmpty()
    {
        var result = (await _bookController.Get("")).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

}
