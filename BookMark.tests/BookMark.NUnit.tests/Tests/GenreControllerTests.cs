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

    private static GenreResponseDTO? _genreCreatedFromTest;
    
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
        var creationData = new GenreCreateDTO
        {
            Name = "Test Genre"
        };

        var result = (await _controller.Create(creationData)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var genre = result.Value as GenreResponseDTO;
        Assert.That(genre, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(genre.Id, Is.Not.Null.Or.Empty);
            Assert.That(genre.Name, Is.EqualTo(creationData.Name));
        });

        _genreCreatedFromTest = genre;
    }

#endregion

#region GET

    [Test, Order(2)]
    public async Task Get_ReturnsGenre_WhenIdIsValid()
    {
        var result = (await _controller.Get(_genreCreatedFromTest!.Id)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var genre = result.Value as GenreResponseDTO;
        Assert.That(genre, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(genre!.Id, Is.EqualTo(_genreCreatedFromTest.Id));
            Assert.That(genre!.Name, Is.EqualTo(_genreCreatedFromTest.Name));
        });
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenIdIsInvalid()
    {
        var result = (await _controller.Get(id: "this-genre-does-not-exist")).Result as ObjectResult;
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
        var update = new GenreUpdateDTO
        {
            Name = "Edited Test Genre",
            Description = "Just Testing..."
        };

        var result = (await _controller.Update(_genreCreatedFromTest!.Id, update)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var updatedGenre = result.Value as GenreResponseDTO;
        Assert.That(updatedGenre, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(updatedGenre.Name, Is.EqualTo(update.Name));
            Assert.That(updatedGenre.Description, Is.EqualTo(update.Description));
        });
    }

    [Test]
    public async Task Update_ReturnsBadRequest_WhenNoFieldIsProvided()
    {
        var update = new GenreUpdateDTO {};

        var result = (await _controller.Update(id: "id-doesn't-matter-here", update)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));

        var problem = result.Value as ProblemDetails;
        Assert.That(problem, Is.Not.Null);
        Assert.That(problem.Detail, Is.EqualTo("Update data is empty. Nothing to update."));
    }

    [Test]
    public void Update_ReturnsDbUpdateConcurrencyException_WhenProvidedIdIsInvalid()
    {
        var update = new GenreUpdateDTO { Description = "Not going to be updated" };

        Assert.ThrowsAsync<DbUpdateConcurrencyException>(async () =>
        {
            await _controller.Update(id: "this-genre-does-not-exist", update);
        });
    }

#endregion

#region DELETE

    [Test, Order(4)]
    public async Task Delete_ReturnsNoContent_WhenGenreIsDeleted()
    {
        var result = await _controller.Delete(_genreCreatedFromTest!.Id);

        Assert.That(((NoContentResult)result!).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));
    }

    [Test]
    public void Delete_ThrowsDbUpdateConcurrencyException_WhenIdIsInvalid()
    {
        Assert.ThrowsAsync<DbUpdateConcurrencyException>(async () =>
        {
            await _controller.Delete("this-genre-is-not-real");
        });
    }

#endregion

#region GET-CONSTRAINED

    [Test]
    public async Task GetConstrained_ReturnsWantedPageIndexAndPageSize()
    {
        var wantedPageIndex = 2;
        var wantedPageSize = 2;
        
        var result = (await _controller.GetConstrained(wantedPageIndex, wantedPageSize)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = result.Value as Page<GenreLinkDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(page.PageIndex, Is.EqualTo(wantedPageIndex));
            Assert.That(page.Items, Has.Count.EqualTo(wantedPageSize));
            Assert.That(page.HasPreviousPage, Is.True);
            Assert.That(page.HasNextPage, Is.True);
        });
    }

    [Test]
    public void GetConstrained_ThrowsKeyNotFoundException_WhenNotAllowedPropertyKeyIsPassed()
    {
        var filters = new Dictionary<string, string> { ["notApropertyYouCanDoFilteringOn=="] = "nope"};

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

        var result = (await _controller.GetGenresByAuthor(authorId)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var genres = result.Value as List<GenreLinkDTO>;
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
        var result = (await _controller.GetGenresByAuthor(authorId: "eliot" /* seeded in db */)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var genres = result.Value as List<GenreLinkDTO>;
        Assert.That(genres, Is.Empty);
    }

    [Test]
    public async Task GetGenresByAuthor_ReturnsBadRequest_WhenAuthorDoesNotExist()
    {
        var result = (await _controller.GetGenresByAuthor(authorId: "this-author-does-not-exist")).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

#endregion

}
