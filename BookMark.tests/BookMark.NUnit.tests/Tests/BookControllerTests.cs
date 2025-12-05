using BookMark.Controllers;
using BookMark.Models;
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

    private static BookResponseDTO? _bookCreatedFromTest;

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

#region CREATE

    [Test, Order(1)]
    public async Task Create_CreatesNewBook_WhenRequiredDataIsProvided()
    {
        var creationData = new BookCreateDTO
        {
            BookTypeId = "book",
            Title = "Test Book",
            AuthorIds = ["tolkien"],
            GenreIds = ["fantasy"],
            OriginalLanguage = "English",
            PageCount = 67,
            PublicationYear = 1967
        };

        var result = (await _controller.Create(creationData)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var createdBook = result!.Value as BookResponseDTO;
        Assert.That(createdBook, Is.Not.Null);
        _bookCreatedFromTest = createdBook;
    }

    [Test]
    public void Create_ThrowsDbUpdateException_WhenBookTypeOrAuthorsOrGenresDoNotExist()
    {
        var creationData = new BookCreateDTO
        {// invalid ids provided to simulate missing required relationships while saving
            BookTypeId = "this-book-type-does-not-exist",
            Title = "Invalid Book",
            AuthorIds = ["this-author-does-not-exist"],
            GenreIds = ["this-genre-does-not-exist"],
            OriginalLanguage = "English",
            PageCount = 400,
            PublicationYear = 400,
            Description = "Invalid references"
        };

        Assert.ThrowsAsync<DbUpdateException>(async () =>
        {
            await _controller.Create(creationData);
        });
    }

    [Test]
    public void Create_ThrowsArgumentException_WhenCoverImageIsTooLarge()
    {
        var bigBytes = new byte[12 * 1024 * 1024]; // 12 MB
        var file = new FormFile(baseStream: new MemoryStream(bigBytes),
                                baseStreamOffset: 0, 
                                length: bigBytes.Length,
                                name: "CoverImageFile",
                                fileName: "large_image.jpg");

        var dto = new BookCreateDTO
        {
            BookTypeId = "book",
            Title = "Large File Test",
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
        Assert.That(ex.Message, Does.Contain("exceedes the max file size"));
    }

    [Test]
    public void Create_ReturnsBadRequest_WhenCoverImageIsEmpty()
    {
        var emptyFile = new FormFile(baseStream: new MemoryStream([]),
                                     baseStreamOffset: 0,
                                     length: 0,
                                     name: "CoverImageFile",
                                     fileName: "empty_image.jpg");

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

#endregion

#region GET

    [Test, Order(2)]
    public async Task Get_ReturnsOkAndBook_WhenBookExists()
    {
        var result = (await _controller.Get(_bookCreatedFromTest!.Id)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var book = result.Value as BookResponseDTO;
        Assert.That(book, Is.Not.Null);
        Assert.Multiple(() =>
        {// checks to see if everything's been properly saved in the db
            Assert.That(book.Id, Is.EqualTo(_bookCreatedFromTest.Id));
            Assert.That(book.Title, Is.EqualTo(_bookCreatedFromTest.Title));
            Assert.That(book.Authors, Is.EquivalentTo(_bookCreatedFromTest.Authors));
            Assert.That(book.Genres, Is.EquivalentTo(_bookCreatedFromTest.Genres));
            Assert.That(book.BookType, Is.EqualTo(_bookCreatedFromTest.BookType));
            Assert.That(book.PublicationYear, Is.EqualTo(_bookCreatedFromTest.PublicationYear));
            Assert.That(book.OriginalLanguage, Is.EqualTo(_bookCreatedFromTest.OriginalLanguage));
            Assert.That(book.PageCount, Is.EqualTo(_bookCreatedFromTest.PageCount));
            Assert.That(book.CoverImageUrl, Is.EqualTo(_bookCreatedFromTest.CoverImageUrl));
            Assert.That(book.Description, Is.EqualTo(_bookCreatedFromTest.Description));
        });
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsInvalid()
    {
        var result = (await _controller.Get(id: "this-book-does-not-exist")).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsEmpty()
    {
        var result = (await _controller.Get(string.Empty)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

#endregion

#region UPDATE

    [Test, Order(3)]
    public async Task Update_UpdatesOnlyProvidedFields()
    {
        var bookBeforeUpdate = ((await _controller.Get(_bookCreatedFromTest!.Id)).Result as ObjectResult)!.Value as BookResponseDTO;

        var update = new BookUpdateDTO
        {
            Title = "Test Book - (Updated Title)",
            Description = "This book has been updated"
        };

        var result = (await _controller.Update(_bookCreatedFromTest.Id, update)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var bookAfterUpdate = result.Value as BookResponseDTO;
        Assert.That(bookAfterUpdate, Is.Not.Null);
        Assert.Multiple(() =>
        {
            // updated fields
            Assert.That(bookAfterUpdate.Title, Is.EqualTo(update.Title));
            Assert.That(bookAfterUpdate.Description, Is.EqualTo(update.Description));

            // unchanged fields
            Assert.That(bookAfterUpdate.BookType.Id, Is.EqualTo(bookBeforeUpdate!.BookType.Id));
            Assert.That(bookAfterUpdate.OriginalLanguage, Is.EqualTo(bookBeforeUpdate.OriginalLanguage));
            Assert.That(bookAfterUpdate.PublicationYear, Is.EqualTo(bookBeforeUpdate.PublicationYear));
            Assert.That(bookAfterUpdate.PageCount, Is.EqualTo(bookBeforeUpdate.PageCount));
        });
    }

    [Test, Order(4)]
    public void Update_ReturnsDbUpdateException_WhenNewBookTypeIdDoesNotExist()
    {
        var update = new BookUpdateDTO
        {// invalid id provided to simulate missing relationship while saving
            BookTypeId = "this-book-type-does-not-exist"
        };

        Assert.ThrowsAsync<DbUpdateException>(async () =>
        {
            await _controller.Update(_bookCreatedFromTest!.Id, update);
        });
    }

    [Test]
    public void Update_ThrowsDbUpdateConcurrencyException_WhenBookDoesNotExist()
    {
        var update = new BookUpdateDTO
        {
            Description = "It doesn't matter what's in the update because the book doesn't exist..."
        };

        Assert.ThrowsAsync<DbUpdateConcurrencyException>(async () =>
        {
            await _controller.Update(id: "this-book-does-not-exist", update);
        });
    }

#endregion

#region DELETE

    [Test, Order(7)]
    public async Task Delete_ReturnsOk_WhenBookIsDeleted()
    {
        var result = await _controller.Delete(_bookCreatedFromTest!.Id);

        Assert.That(((NoContentResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));
    }

    [Test]
    public async Task Delete_ReturnsBadRequest_WhenIdIsInvalid()
    {
        var result = await _controller.Delete("random-id");

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

#endregion

#region REPLACE-AUTHORS

    [Test, Order(4)]
    public async Task ReplaceAuthors_SuccessfullyReplacesAuthors()
    {
        var newAuthors = new List<string> { "strugatsky" };

        var result = await _controller.ReplaceAuthors(_bookCreatedFromTest!.Id, authorIds: newAuthors);
        Assert.That(result, Is.InstanceOf<OkResult>());
    }

    [Test, Order(4)]
    public void ReplaceAuthors_ReturnsDbUpdateException_WhenAnAuthorDoesNotExist()
    {
        var newAuthors = new List<string> { "tolkien", "unknown-author" };

        Assert.ThrowsAsync<DbUpdateException>(async () =>
        {
            await _controller.ReplaceAuthors(_bookCreatedFromTest!.Id, authorIds: newAuthors);
        });
    }

    [Test]
    public async Task ReplaceAuthors_ReturnsBadRequest_WhenMoreThanMAXAuthorsProvided()
    {
        var tooManyAuthors = Enumerable.Range(1, BookController.MAX_BOOK_AUTHORS+1).Select(i => $"a{i}").ToList();

        var result = await _controller.ReplaceAuthors(bookId: "does-not-matter-because-of-===>", tooManyAuthors) as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

#endregion

#region REPLACE-GENRES

    [Test, Order(4)]
    public async Task ReplaceGenres_ReturnsOk_WhenValidGenresProvided()
    {
        var newGenres = new List<string> { "fantasy", "thriller" };

        var result = await _controller.ReplaceGenres(_bookCreatedFromTest!.Id, genreIds: newGenres);
        Assert.That(result, Is.InstanceOf<OkResult>());
    }

    [Test]
    public async Task ReplaceGenres_ReturnsBadRequest_WhenLessThanMINGenresProvided()
    {// min is 1
        var result = await _controller.ReplaceGenres(bookId: "does-not-matter-because-of-===>", genreIds: []/* 0 genres*/);

        Assert.That(((ObjectResult)result).StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

    [Test, Order(4)]
    public void ReplaceGenres_ReturnsDbUpdateException_WhenAnGenreDoesNotExist()
    {
        var newGenres = new List<string> { "this-genre-does-not-exist", "this-one-too" };

        Assert.ThrowsAsync<DbUpdateException>(async () =>
        {
            await _controller.ReplaceGenres(_bookCreatedFromTest!.Id, genreIds: newGenres);
        });
    }

#endregion

#region GET-CONSTRAINED

    [Test]
    public async Task GetConstrained_ReturnsWantedPageIndexAndPageSize()
    {
        var wantedPageIndex = 2;
        var wantedPageSize = 4;
        var result = (await _controller.GetConstrained(wantedPageIndex, wantedPageSize)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = ((OkObjectResult)result!).Value as Page<BookLinkDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(page.PageIndex, Is.EqualTo(wantedPageIndex));
            Assert.That(page.Items, Has.Count.EqualTo(wantedPageSize));
        });
    }

    [Test]
    public async Task GetConstrained_ReturnsAllMatches_WhenFiltersContainSearchBoxParameters()
    {
        var searchTerm = "ring";
        var filters = new Dictionary<string, string>
        {
            ["Title~="] = searchTerm,
            ["Description~="] = searchTerm,
            ["Authors.Author.Name~="] = searchTerm
        };

        var result = (await _controller.GetConstrained(filters: filters)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = result.Value as Page<BookLinkDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.That(page.Items, Is.Not.Empty);
        Assert.That(page.Items.Any(b => (b.Title?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ?? false)
                                     || (b.Description?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ?? false)
                                     || (b.Authors?.Any(a => a.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)) ?? false)),
                    Is.True,
                    "Expected at least one item to match the search term in Title, Description, or Author.Name");
    }

    [Test]
    public async Task GetConstrained_ReturnsEmptyPage_WhenNoMatch()
    {
        var filters = new Dictionary<string, string>
        {
            ["Title=="] = "this_title_does_not_exist_123"
        };

        var result = (await _controller.GetConstrained(filters: filters)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = result.Value as Page<BookLinkDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(page.Items, Is.Empty);
            Assert.That(page.TotalPages, Is.EqualTo(0));
        });
    }

#endregion

#region UPDATE-COVER-IMAGE

    [Test]
    public async Task UpdateCoverImage_ReturnsBadRequest_WhenBookDoesNotExist()
    {
        var result = await _controller.UpdateCoverImage(bookId: "this-book-does-not-exist", newCover: null) as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

    [Test, Order(6)]
    public async Task UpdateCoverImage_RemovesCover_WhenNewCoverParameterIsNull()
    {
        var result = await _controller.UpdateCoverImage(_bookCreatedFromTest!.Id, newCover: null);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
    }

    [Test, Order(5)]
    public async Task UpdateCoverImage_ReplacesCover_WhenValidFileProvided()
    {
        var testImage = CreateTinyPngFile();

        var result = await _controller.UpdateCoverImage(_bookCreatedFromTest!.Id, newCover: testImage);
        Assert.That(result, Is.InstanceOf<OkResult>());
    }

#endregion

    private static FormFile CreateTinyPngFile(string fileName = "cover.png")
    {
        byte[] pngBytes = Convert.FromBase64String(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9p6nXQAAAABJRU5ErkJggg=="
        );

        var stream = new MemoryStream(pngBytes);

        return new FormFile(stream, 0, stream.Length, "newCover", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/png"
        };
    }

}
