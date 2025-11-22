using BookMark.Controllers;
using BookMark.Models.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.tests;

// [MethodName]_[ExpectedOutcome]_[Scenario/Condition]

[TestFixture]
public class BookTests
{
    private IServiceScope _scope;
    private BookController _controller;
    
    private static string? _createdBookId;

    [SetUp]
    public void Setup()
    {
        _scope = GlobalTestSetup.Factory.Services.CreateScope();
        _controller = _scope.ServiceProvider.GetRequiredService<BookController>();
    }

    [TearDown]
    public void TearDown()
    {
        _scope.Dispose();
    }

    [Test, Order(1)]
    public async Task Create_ReturnsOk_WhenValidBookDataProvided()
    {
        var createDto = new BookCreateDTO
        {
            BookTypeId = "book",
            Title = "Test Book",
            AuthorIds = new List<string> { "tolkien" },
            GenreIds = new List<string> { "fantasy" },
            OriginalLanguage = "English",
            PageCount = 300,
            PublicationYear = 2024,
            Description = "A book created during test."
        };

        var createResult = (await _controller.Create(createDto)).Result;

        Assert.That(((ObjectResult)createResult!).StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var createdDto = ((ObjectResult)createResult!).Value as BookResponseDTO;
        Assert.That(createdDto, Is.Not.Null);
        _createdBookId = createdDto.Id;
    }

    [Test, Order(2)]
    public async Task Get_ReturnsOk_WhenABookExists()
    {
        var result = (await _controller.Get(_createdBookId!)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var dto = ((OkObjectResult)result!).Value as BookResponseDTO;
        Assert.That(dto, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(dto!.Id, Is.EqualTo(_createdBookId));
            Assert.That(dto!.Title, Is.EqualTo("Test Book"));
            Assert.That(dto.Authors.Any(a => a.Id == "tolkien"), Is.True);
            Assert.That(dto.Genres.Any(g => g.Id == "fantasy"), Is.True);
            Assert.That(dto.BookType.Id, Is.EqualTo("book"));
        });
    }

    [Test, Order(3)]
    public async Task Delete_ReturnsOk_WhenBookIsDeleted()
    {
        var deleteResult = await _controller.Delete(_createdBookId!);

        Assert.That(((NoContentResult)deleteResult!).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));
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
