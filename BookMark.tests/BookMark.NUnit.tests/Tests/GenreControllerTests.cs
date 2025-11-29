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
public class GenreControllerTests
{
    private IServiceScope _scope;
    private GenreController _controller;

    private static string? _createdGenreId;
    
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

#region CREATE

    [Test, Order(1)]
    public async Task Create_CreatesAndReturnsNewGenre_WhenValidCreateDataProvided()
    {
        var createDto = new GenreCreateDTO
        {
            Name = "Test Genre"
        };

        var createResult = (await _controller.Create(createDto)).Result;

        Assert.That(((ObjectResult)createResult!).StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var author = ((ObjectResult)createResult!).Value as GenreResponseDTO;
        Assert.That(author, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(author.Id, Is.Not.Null.Or.Empty);
            Assert.That(author.Name, Is.EqualTo(createDto.Name));
        });

        _createdGenreId = author.Id;
    }

#endregion

#region GET

    [Test, Order(2)]
    public async Task Get_ReturnsGenre_WhenIdIsValid()
    {
        var result = (await _controller.Get(_createdGenreId!)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var dto = ((OkObjectResult)result!).Value as GenreResponseDTO;
        Assert.That(dto, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(dto!.Id, Is.EqualTo(_createdGenreId));
            Assert.That(dto!.Name, Is.EqualTo("Test Genre"));
        });
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsInvalid()
    {
        var result = (await _controller.Get("this-genre-does-not-exist")).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsEmpty()
    {
        var result = (await _controller.Get(string.Empty)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status404NotFound));
    }

#endregion

#region UPDATE

    [Test, Order(3)]
    public async Task Update_ReturnsUpdatedGenre_WhenValidUpdateFieldsAreProvided()
    {
        var updateDto = new GenreUpdateDTO
        {
            Name = "Edited Test Genre",
            Description = "Just Testing..."
        };

        var result = (await _controller.Update(_createdGenreId!, updateDto)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var updatedAuthor = ((OkObjectResult)result!).Value as GenreResponseDTO;
        Assert.That(updatedAuthor, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(updatedAuthor.Name, Is.EqualTo(updateDto.Name));
            Assert.That(updatedAuthor.Description, Is.EqualTo(updateDto.Description));
        });
    }

    [Test]
    public async Task Update_ReturnsBadRequest_WhenNoFieldIsProvided()
    {
        var updateDto = new GenreUpdateDTO {};

        var result = (await _controller.Update("id-doesn't-matter-here", updateDto)).Result;
        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));

        var problem = ((ObjectResult)result).Value as ProblemDetails;
        Assert.That(problem, Is.Not.Null);
        Assert.That(problem.Detail, Is.EqualTo("Update data is empty. Nothing to update."));
    }

    [Test]
    public void Update_ReturnsDbUpdateConcurrencyException_WhenProvidedIdIsInvalid()
    {
        var updateDto = new GenreUpdateDTO { Name = "Not going to be updated" };

        Assert.ThrowsAsync<DbUpdateConcurrencyException>(async () =>
        {
            await _controller.Update("this-genre-does-not-exist", updateDto);
        });
    }

#endregion

#region DELETE

    [Test, Order(4)]
    public async Task Delete_ReturnsOk_WhenAuthorIsDeleted()
    {
        var result = await _controller.Delete(_createdGenreId!);

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

#endregion

#region GET-CONSTRAINED

    [Test]
    public async Task GetConstrained_ReturnsWantedPageIndexAndPageSize()
    {
        var result = (await _controller.GetConstrained(pageIndex: 2, pageSize: 2)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = ((OkObjectResult)result!).Value as Page<GenreLinkDTO>;
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
    public void GetConstrained_asfoihoihas()
    {
        var filters = new Dictionary<string, string> { ["NotAPropertYouCanDoFilteringOn=="] = "nope"};

        Assert.ThrowsAsync<KeyNotFoundException>(async () =>
        {
            await _controller.GetConstrained(pageIndex: 67, pageSize: 67, filters: filters);
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

#region GET-GENRES-BY-AUTHOR

    [Test]
    public async Task GetGenresByAuthor_ReturnsGenresAuthorHasWrittenIn()
    {
        const string authorId = "tolkien";

        var result = (await _controller.GetGenresByAuthor(authorId)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var genres = ((OkObjectResult)result).Value as List<GenreLinkDTO>;
        Assert.That(genres, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(genres, Is.Not.Empty); // we are sure there are some tolkien books in the test db
            Assert.That(genres.Any(g => g.Id == "fantasy"), Is.True); // Tolkien wrote LOTR books -> all are Fantasy
            Assert.That(genres.Select(g => g.Id).Distinct().Count(), Is.EqualTo(genres.Count)); // endpoint should only return distinct genres, no need for duplicates
        });
    }

    [Test]
    public async Task GetGenresByAuthor_ReturnsEmpty_WhenAuthorDoesNotHaveAnyBooks()
    {
        const string authorId = "eliot";

        var result = (await _controller.GetGenresByAuthor(authorId)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var genres = ((OkObjectResult)result!).Value as List<GenreLinkDTO>;
        Assert.That(genres, Is.Empty);
    }

    [Test]
    public async Task GetGenresByAuthor_ReturnsBadRequest_WhenAuthorDoesNotExist()
    {
        const string authorId = "this-author-does-not-exist";

        var result = (await _controller.GetGenresByAuthor(authorId)).Result;

        Assert.That(((ObjectResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

#endregion

}
