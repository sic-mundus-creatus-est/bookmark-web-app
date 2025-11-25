using BookMark.Controllers;
using BookMark.Models.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.NUnit.tests;

// [MethodName]_[ExpectedOutcome]_[Scenario/Condition]

[TestFixture]
public class BookControllerTests
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

// ==============================================================================================================
// CREATE

    [Test, Order(1)]
    public async Task Create_ReturnsOk_WhenValidBookDataProvided()
    {
        var createDto = new BookCreateDTO
        {
            BookTypeId = "book",
            Title = "Test Book",
            AuthorIds = ["tolkien"],
            GenreIds = ["fantasy"],
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

    [Test]
    public void Create_ThrowsDbUpdateException_WhenAuthorsOrGenresDoNotExist()
    {
        var dto = new BookCreateDTO
        {
            BookTypeId = "nonexistent-type",
            Title = "Invalid Book",
            AuthorIds = ["no-such-author"],
            GenreIds = ["no-such-genre"],
            OriginalLanguage = "English",
            PageCount = 100,
            PublicationYear = 2024,
            Description = "Invalid references"
        };

        Assert.ThrowsAsync<DbUpdateException>(async () =>
        {
            await _controller.Create(dto);
        });
    }

    [Test]
    public void Create_ThrowsArgumentException_WhenCoverImageIsTooLarge()
    {
        var bigBytes = new byte[12 * 1024 * 1024]; // 12 MB
        var stream = new MemoryStream(bigBytes);

        var file = new FormFile(stream, 0, bigBytes.Length, "CoverImageFile", "big_image.jpg");

        var dto = new BookCreateDTO
        {
            BookTypeId = "book",
            Title = "Test Huge File",
            AuthorIds = ["tolkien"],
            GenreIds = ["fantasy"],
            OriginalLanguage = "English",
            PageCount = 100,
            PublicationYear = 2024,
            CoverImageFile = file
        };

        var ex = Assert.ThrowsAsync<ArgumentException>(async () =>
        {
            await _controller.Create(dto);
        });

        Assert.That(ex!.Message, Does.Contain("exceedes the max file size"));
    }

    [Test]
    public void Create_ReturnsBadRequest_WhenCoverImageHasZeroLength()
    {
        var emptyFile = new FormFile(
            baseStream: new MemoryStream([]),
            baseStreamOffset: 0,
            length: 0,
            name: "CoverImageFile",
            fileName: "empty.jpg"
        );

        var dto = new BookCreateDTO
        {
            Title = "Test Book",
            BookTypeId = "book",
            AuthorIds = ["tolkien"],
            GenreIds = ["fantasy"],
            OriginalLanguage = "English",
            PageCount = 100,
            PublicationYear = 2024,
            CoverImageFile = emptyFile
        };

        var ex = Assert.ThrowsAsync<ArgumentException>(async () =>
        {
            await _controller.Create(dto);
        });

        Assert.That(ex.Message, Does.Contain("file").And.Contain("is empty"));
    }
// ==============================================================================================================

// ==============================================================================================================
// GET

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
// ==============================================================================================================
// UPDATE

    [Test, Order(3)]
    public async Task Update_UpdatesTitleOnly_WhenSingleFieldProvided()
    {
        var updateDto = new BookUpdateDTO
        {
            Title = "The Fellowship of the Ring - Corrected"
        };

        var result = (await _controller.Update(_createdBookId!, updateDto)).Result;
        Assert.That(((OkObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var updatedBook = ((OkObjectResult)result!).Value as BookResponseDTO;
        Assert.That(updatedBook, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(updatedBook!.Title, Is.EqualTo(updateDto.Title));
            Assert.That(updatedBook.PageCount, Is.EqualTo(300));
            Assert.That(updatedBook.Authors.Any(a => a.Id == "tolkien"), Is.True);
            Assert.That(updatedBook.Genres.Any(g => g.Id == "fantasy"), Is.True);
        });
    }

    [Test, Order(4)]
    public async Task Update_UpdatesMultipleFields_WhenProvided()
    {
        var updateDto = new BookUpdateDTO
        {
            PublicationYear = 1955,
            PageCount = 430
        };

        var result = (await _controller.Update(_createdBookId!, updateDto)).Result;
        Assert.That(((OkObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var updatedBook = ((OkObjectResult)result!).Value as BookResponseDTO;
        Assert.That(updatedBook, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(updatedBook.PublicationYear, Is.EqualTo(1955));
            Assert.That(updatedBook.PageCount, Is.EqualTo(430));
            Assert.That(updatedBook.Title, Is.EqualTo("The Fellowship of the Ring - Corrected"));
        });
    }

    [Test]
    public void Update_ReturnsDbUpdateException_WhenNewBookTypeIdDoesNotExist()
    {
        var updateDto = new BookUpdateDTO
        {
            BookTypeId = "nonexistent-type"
        };

        Assert.ThrowsAsync<DbUpdateException>(async () =>
        {
            await _controller.Update("monster", updateDto);
        });
    }

// ==============================================================================================================
// DELETE

    [Test, Order(5)]
    public async Task Delete_ReturnsOk_WhenBookIsDeleted()
    {
        var result = await _controller.Delete(_createdBookId!);

        Assert.That(((NoContentResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));
    }

    [Test]
    public async Task Delete_ReturnsBadRequest_WhenIdIsInvalid()
    {
        var result = await _controller.Delete(_createdBookId!);

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }
// ==============================================================================================================

}
