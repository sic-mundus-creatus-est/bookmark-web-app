using BookMark.Controllers;
using BookMark.Data;
using BookMark.Models;
using BookMark.Models.Domain;
using BookMark.Models.DTOs;
using BookMark.Models.Relationships;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.NUnit.tests;

[TestFixture]
public class AuthorControllerTests
{
    private IServiceScope _scope;
    private AuthorController _controller;

    private static AuthorResponseDTO? _authorCreatedFromTest;
    
    [SetUp]
    public void Setup()
    {
        _scope = GlobalTestSetup.Factory.Services.CreateScope();
        _controller = _scope.ServiceProvider.GetRequiredService<AuthorController>();
    }

    [TearDown]
    public void TearDown()
    {
        _scope.Dispose();
    }

#region CREATE

    [Test, Order(1)]
    public async Task Create_CreatesNewAuthor_WhenRequiredDataIsProvided()
    {
        var creationData = new AuthorCreateDTO
        {
            Name = "Test Author"
        };

        var result = (await _controller.Create(creationData)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var createdAuthor = result.Value as AuthorResponseDTO;
        Assert.That(createdAuthor, Is.Not.Null);
        _authorCreatedFromTest = createdAuthor;
    }

    [Test]
    public async Task Create_ReturnsBadRequest_WhenOptionalParametersAreInvalid()
    {
        var creationData = new AuthorCreateDTO
        {
            Name = "Failed Test",
            BirthYear = 2000,
            DeathYear = 1900
        };

        var result = (await _controller.Create(creationData)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));

        var problem = result.Value as ProblemDetails;
        Assert.That(problem, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(problem.Title, Is.EqualTo("Bad Request"));
            Assert.That(problem.Detail, Does.Contain("Birth Year must come before Death Year"));
        });
    }

    [Test]
    public async Task Create_ReturnsOk_WhenOptionalParametersAreValid()
    {
        var createDto = new AuthorCreateDTO
        {
            Name = "Another One",
            Biography = "Hello world!",
            BirthYear = 1984,
        };

        var result = (await _controller.Create(createDto)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var createdAuthor = result.Value as AuthorResponseDTO;
        Assert.That(createdAuthor, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(createdAuthor.Id, Is.Not.Null.Or.Empty);
            Assert.That(createdAuthor.Name, Is.EqualTo(createDto.Name));
            Assert.That(createdAuthor.BirthYear, Is.EqualTo(createDto.BirthYear));
            Assert.That(createdAuthor.DeathYear, Is.EqualTo(createDto.DeathYear));
        });
    }

#endregion

#region GET

    [Test, Order(2)]
    public async Task Get_ReturnsOkAndAuthor_WhenAuthorExists()
    {
        var result = (await _controller.Get(_authorCreatedFromTest!.Id)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var author = result.Value as AuthorResponseDTO;
        Assert.That(author, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(author.Id, Is.EqualTo(_authorCreatedFromTest.Id));
            Assert.That(author.Name, Is.EqualTo(_authorCreatedFromTest.Name));
            Assert.That(author.Biography, Is.EqualTo(_authorCreatedFromTest.Biography));
            Assert.That(author.BirthYear, Is.EqualTo(_authorCreatedFromTest.BirthYear));
            Assert.That(author.DeathYear, Is.EqualTo(_authorCreatedFromTest.DeathYear));
        });
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsInvalid()
    {
        var result = (await _controller.Get(id: "this-author-does-not-exist")).Result as ObjectResult;
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
        var update = new AuthorUpdateDTO
        {
            Biography = "New Biography of Test Author.",
            BirthYear = 2025,
            DeathYear = 2025
        };

        var result = (await _controller.Update(_authorCreatedFromTest!.Id, update)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var updatedAuthor = ((OkObjectResult)result!).Value as AuthorResponseDTO;
        Assert.That(updatedAuthor, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(updatedAuthor.Name, Is.EqualTo(_authorCreatedFromTest.Name));
            Assert.That(updatedAuthor.Biography, Is.EqualTo(update.Biography));
            Assert.That(updatedAuthor.BirthYear, Is.EqualTo(update.BirthYear));
            Assert.That(updatedAuthor.DeathYear, Is.EqualTo(update.DeathYear));
        });
    }

    [Test, Order(3)]
    public async Task Update_ReturnsBadRequest_WhenNoFieldIsProvided()
    {
        var update = new AuthorUpdateDTO {};

        var result = (await _controller.Update(_authorCreatedFromTest!.Id, update)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

    [Test]
    public async Task Update_ReturnsBadRequest_WhenProvidedParametersAreInvalid()
    {
        var update = new AuthorUpdateDTO
        {
            Biography = "Invalid Birth-Death-Year Ratio",
            BirthYear = 2222,
            DeathYear = 1111
        };

        var result = (await _controller.Update(id: "id-does-not-matter-in-this-situation", update)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));

        var problem = result.Value as ProblemDetails;
        Assert.That(problem, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(problem.Title, Is.EqualTo("Bad Request"));
            Assert.That(problem.Detail, Does.Contain("Birth Year must come before Death Year"));
        });
    }

#endregion

#region DELETE

    [Test, Order(4)]
    public async Task Delete_ReturnsNoContent_WhenAuthorIsDeleted()
    {
        var result = await _controller.Delete(_authorCreatedFromTest!.Id);

        Assert.That(((NoContentResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));
    }

    [Test]
    public void Delete_ThrowsDbUpdateConcurrencyException_WhenIdIsInvalid()
    {
        Assert.ThrowsAsync<DbUpdateConcurrencyException>(async () =>
        {
            await _controller.Delete("this-author-is-not-real");
        });
    }

    [Test]
    public async Task Delete_RemovesAuthorAndOrphanBooks()
    {
        var context = _scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var author = new Author
        {
            Id = "test-author-man",
            Name = "Temporary Test Author"
        };
        context.Authors.Add(author);

        var book1 = new Book { Id = "book1", Title = "Book One", BookTypeId = "book", OriginalLanguage = "TEST", PageCount = 123 };
        var book2 = new Book { Id = "book2", Title = "Book Two", BookTypeId = "book", OriginalLanguage = "TEST", PageCount = 123 };
        context.Books.AddRange(book1, book2);

        context.BookAuthors.AddRange(
            new BookAuthor { AuthorId = author.Id, BookId = book1.Id },
            new BookAuthor { AuthorId = author.Id, BookId = book2.Id }
        );

        await context.SaveChangesAsync();

        foreach (var entry in context.ChangeTracker.Entries().ToList())
            entry.State = EntityState.Detached;

        var result = await _controller.Delete(author.Id);

        Assert.Multiple(() =>
        {
            Assert.That(((NoContentResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));

            // author is deleted
            Assert.That(context.Authors.Any(a => a.Id == author.Id), Is.False);

            // BookAuthor relations are removed
            Assert.That(context.BookAuthors.Any(ba => ba.AuthorId == author.Id), Is.False);

            // books that end up without authors are also deleted
            Assert.That(context.Books.Any(b => b.Id == "book1"), Is.False);
            Assert.That(context.Books.Any(b => b.Id == "book2"), Is.False);
        });
    }

#endregion

#region GET-AUTHOR-SUGGESTIONS

    [Test]
    public async Task GetAuthorSuggestions_ReturnsMatchingAuthors()
    {
        var searchTerm = "George";

        var result = (await _controller.GetAuthorSuggestions(searchTerm)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var suggestions = result.Value as List<AuthorLinkDTO>;
        Assert.That(suggestions, Is.Not.Null);
        Assert.That(suggestions.All(a => a.Name.Contains("George", StringComparison.OrdinalIgnoreCase)), Is.True);
    }

    [Test]
    public async Task GetAuthorSuggestions_ReturnsOnlyNotSkippedIds()
    {
        var searchTerm = "George";
        var skipIds = new List<string> { "martin", "eliot" };

        var result = (await _controller.GetAuthorSuggestions(searchTerm, skipIds)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var suggestions = result.Value as List<AuthorLinkDTO>;
        Assert.That(suggestions, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(suggestions.All(a => a.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)), Is.True);
            Assert.That(suggestions.All(a => !skipIds.Contains(a.Id)), Is.True);
        });
    }

    [Test]
    public async Task GetAuthorSuggestions_ReturnsWantedCount()
    {
        var searchTerm = "a";
        var count = 7;

        var result = (await _controller.GetAuthorSuggestions(searchTerm: searchTerm, count: count)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var suggestions = result.Value as List<AuthorLinkDTO>;
        Assert.That(suggestions, Is.Not.Null);
        Assert.That(suggestions, Has.Count.EqualTo(count));
        Assert.That(suggestions.All(a => a.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)), Is.True);
    }

#endregion

}
