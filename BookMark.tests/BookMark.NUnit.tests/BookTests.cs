using BookMark.Controllers;
using BookMark.Models.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.tests;

// [MethodName]_[ExpectedOutcome]_[Scenario/Condition]

[TestFixture]
public class Tests
{
   private BookController _controller;
    
    private const string TestBookId = "b28cb09a-0dfc-426b-afa6-289b140e8034";

    [OneTimeSetUp]
    public void Setup()
    {
        _controller = GlobalTestSetup.Services.GetRequiredService<BookController>();
    }

    [Test]
    public async Task Get_ReturnsOk_WhenABookExists()
    {
        var result = (await _controller.Get(TestBookId)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var dto = ((OkObjectResult)result!).Value as BookResponseDTO;
        Assert.That(dto, Is.Not.Null);
        Assert.That(dto!.Id, Is.EqualTo(TestBookId));
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsInvalid()
    {
        var result = (await _controller.Get("random-id")).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsEmpty()
    {
        var result = (await _controller.Get("")).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

}
