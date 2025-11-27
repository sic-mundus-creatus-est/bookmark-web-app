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

    private static string? _createdAuthorId;
    
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
    public async Task Create_ReturnsOk_WhenValidAuthorDataProvided()
    {
        var createDto = new AuthorCreateDTO
        {
            Name = "Test Author"
        };

        var createResult = (await _controller.Create(createDto)).Result;

        Assert.That(((ObjectResult)createResult!).StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var author = ((ObjectResult)createResult!).Value as AuthorResponseDTO;
        Assert.That(author, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(author.Id, Is.Not.Null.Or.Empty);
            Assert.That(author.Name, Is.EqualTo(createDto.Name));
        });

        _createdAuthorId = author.Id;
    }

    [Test]
    public async Task Create_ReturnsBadRequest_WhenOptionalParametersAreInvalid()
    {
        var createDto = new AuthorCreateDTO
        {
            Name = "Temporal Author",
            BirthYear = 2000,
            DeathYear = 1900
        };

        var result = (await _controller.Create(createDto)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));

        var problem = ((ObjectResult)result).Value as ProblemDetails;
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
            Name = "Valid Temporal Author",
            Biography = "Hello world!",
            BirthYear = 1984,
        };

        var createResult = (await _controller.Create(createDto)).Result;
        Assert.That(((ObjectResult)createResult!).StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var author = ((ObjectResult)createResult!).Value as AuthorResponseDTO;
        Assert.That(author, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(author.Id, Is.Not.Null.Or.Empty);
            Assert.That(author.Name, Is.EqualTo(createDto.Name));
            Assert.That(author.BirthYear, Is.EqualTo(createDto.BirthYear));
            Assert.That(author.DeathYear, Is.EqualTo(createDto.DeathYear));
        });
    }

#endregion

#region GET

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsInvalid()
    {
        var result = (await _controller.Get("random-id")).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsEmpty()
    {
        var result = (await _controller.Get(string.Empty)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }
    
    [Test, Order(2)]
    public async Task Get_ReturnsAuthor_WhenIdIsValid()
    {
        var result = (await _controller.Get(_createdAuthorId!)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var dto = ((OkObjectResult)result!).Value as AuthorResponseDTO;
        Assert.That(dto, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(dto!.Id, Is.EqualTo(_createdAuthorId));
            Assert.That(dto!.Name, Is.EqualTo("Test Author"));
        });
    }

#endregion

#region UPDATE

    [Test, Order(3)]
    public async Task Update_ReturnsUpdatedAuthor_WhenFieldsAreProvided()
    {
        var updateDto = new AuthorUpdateDTO
        {
            Biography = "New Biography of Test Author.",
            BirthYear = 2025,
            DeathYear = 2025
        };

        var result = (await _controller.Update(_createdAuthorId!, updateDto)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var updatedAuthor = ((OkObjectResult)result!).Value as AuthorResponseDTO;
        Assert.That(updatedAuthor, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(updatedAuthor.Name, Is.EqualTo("Test Author"));
            Assert.That(updatedAuthor.Biography, Is.EqualTo(updateDto.Biography));
            Assert.That(updatedAuthor.BirthYear, Is.EqualTo(updateDto.BirthYear));
            Assert.That(updatedAuthor.DeathYear, Is.EqualTo(updateDto.DeathYear));
        });
    }

    [Test]
    public async Task Update_ReturnsBadRequest_WhenNoFieldIsProvided()
    {
        var updateDto = new AuthorUpdateDTO {};

        var result = (await _controller.Update("asimov", updateDto)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

    [Test]
    public void Update_ReturnsDbUpdateConcurrencyException_WhenProvidedIdIsInvalid()
    {
        var updateDto = new AuthorUpdateDTO { Name = "Random Name" };

        Assert.ThrowsAsync<DbUpdateConcurrencyException>(async () =>
        {
            await _controller.Update("random-id", updateDto);
        });
    }

#endregion

#region DELETE

    [Test, Order(4)]
    public async Task Delete_ReturnsOk_WhenAuthorIsDeleted()
    {
        var result = await _controller.Delete(_createdAuthorId!);

        Assert.That(((NoContentResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));
    }

    [Test]
    public void Delete_ReturnsBadRequest_WhenIdIsInvalid()
    {
        Assert.ThrowsAsync<DbUpdateConcurrencyException>(async () =>
        {
            await _controller.Delete("random-id");
        });
    }

    [Test]
    public async Task Delete_RemovesAuthorAndTheirBooks()
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

        Assert.That(((NoContentResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));

        // author is deleted
        Assert.That(context.Authors.Any(a => a.Id == author.Id), Is.False);

        // BookAuthor relations are removed
        Assert.That(context.BookAuthors.Any(ba => ba.AuthorId == author.Id), Is.False);

        // books that end up without authors are also deleted
        Assert.That(context.Books.Any(b => b.Id == "book1"), Is.False);
        Assert.That(context.Books.Any(b => b.Id == "book2"), Is.False);
    }

#endregion

#region GET-CONSTRAINED

    [Test]
    public async Task GetConstrained_ReturnsWantedPageIndexAndPageSize()
    {
        var result = (await _controller.GetConstrained(pageIndex: 2, pageSize: 2)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = ((OkObjectResult)result!).Value as Page<AuthorLinkDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(page.PageIndex, Is.EqualTo(2));
            Assert.That(page.Items, Has.Count.EqualTo(2));
            Assert.That(page.HasPreviousPage, Is.True);
            Assert.That(page.HasNextPage, Is.True);
        });
    }

    [Test]
    public async Task GetConstrained_ReturnsOnlyFilteredItems()
    {
        var filters = new Dictionary<string, string>
        {
            ["Name~="] = "Alan"
        };
        var result = (await _controller.GetConstrained(pageIndex: 1, pageSize: 10, filters: filters)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = ((OkObjectResult)result!).Value as Page<AuthorLinkDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.That(page.Items, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(page.PageIndex, Is.EqualTo(1));
            Assert.That(page.Items, Has.Count.GreaterThan(0));
            Assert.That(page.Items, Has.Count.LessThanOrEqualTo(10));
            Assert.That(page.HasPreviousPage, Is.False);
            Assert.That(page.HasNextPage, Is.False);

            Assert.That(
                page.Items.Any(i => i.Name == "Alan Moore"),
                Is.True,
                "Expected at least one item with Name == 'Alan Moore'"
            );
        });
    }

    [Test]
    public void GetConstrained_ThrowsArgumentOutOfRangeException_WhenIndexIsOutOfRange()
    {
        Assert.ThrowsAsync<ArgumentOutOfRangeException>(async () =>
        {
            await _controller.GetConstrained(pageIndex: 67, pageSize: 911);
        });
    }

#endregion

#region GET-AUTHOR-SUGGESTIONS

    [Test]
    public async Task GetAuthorSuggestions_ReturnsMatchingAuthors()
    {
        var searchTerm = "George";
        var count = 5;

        var result = (await _controller.GetAuthorSuggestions(searchTerm: searchTerm, count: count)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));
        var suggestions = ((OkObjectResult)result!).Value as List<AuthorLinkDTO>;

        Assert.That(suggestions, Is.Not.Null);
        Assert.That(suggestions.All(a => a.Name.Contains("George")), Is.True);
    }

    [Test]
    public async Task GetAuthorSuggestions_ReturnsOnlyNotSkippedIds()
    {
        var searchTerm = "George";
        var skipIds = new List<string> { "martin", "eliot" };
        var count = 5;

        var result = (await _controller.GetAuthorSuggestions(searchTerm: searchTerm, skipIds: skipIds, count: count)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));
        var suggestions = ((OkObjectResult)result!).Value as List<AuthorLinkDTO>;

        Assert.That(suggestions, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(suggestions.All(a => a.Name.Contains(searchTerm)), Is.True);
            Assert.That(suggestions!.All(a => !skipIds.Contains(a.Id)), Is.True);
        });
    }

    [Test]
    public async Task GetAuthorSuggestions_ReturnsWantedCount()
    {
        var searchTerm = "a";
        var count = 5;

        var result = (await _controller.GetAuthorSuggestions(searchTerm: searchTerm, count: count)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));
        var suggestions = ((OkObjectResult)result!).Value as List<AuthorLinkDTO>;

        Assert.That(suggestions, Is.Not.Null);
        Assert.That(suggestions, Has.Count.EqualTo(count));
        Assert.That(suggestions.All(a => a.Name.Contains(searchTerm)), Is.True);
    }

#endregion

}
