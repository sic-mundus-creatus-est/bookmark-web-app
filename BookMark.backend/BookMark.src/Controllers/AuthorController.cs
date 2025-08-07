using Microsoft.AspNetCore.Mvc;

using BookMark.Models.DTOs;
using BookMark.Models.Domain;
using BookMark.Data.Repositories;

namespace BookMark.Controllers;

[ApiController]
[Route("api/authors")]
public class AuthorController : BaseController<Author, AuthorCreateDTO, AuthorUpdateDTO, AuthorResponseDTO>
{
    public AuthorController(AuthorRepository repository) : base(repository) { }

    [HttpGet("{id}/books/genres")]
    public async Task<ActionResult<List<BookGenreResponseDTO>>> GetAuthorBookGenres([FromRoute] string id)
    {
        var author = await _repository.GetByIdAsync(id);
        if (author == null)
            return Problem(title: "Author Not Found",
                            detail: $"No Author with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound);

        var response = new List<BookGenreResponseDTO>();

        if (_repository is AuthorRepository authorRepo)
            response = await authorRepo.GetAuthorBookGenresAsync(id);

        return Ok(response);
    }

    [HttpGet("{id}/books")]
    public async Task<ActionResult<List<BookResponseDTO>>> GetBooksByAuthor(
        [FromRoute] string id,
        [FromQuery] int count = 10)
    {
        var author = await _repository.GetByIdAsync(id);
        if (author == null)
            return Problem(title: "Author Not Found",
                            detail: $"No Author with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound);

        var response = new List<BookResponseDTO>();

        if (_repository is AuthorRepository authorRepo)
        {
            var books = await authorRepo.GetBooksByAuthorAsync(id, count);

            response = books.Select(entity =>
            {
                var dto = Activator.CreateInstance<BookResponseDTO>();
                entity.MapTo(dto!);
                return dto;
            }).ToList();
        }

        return Ok(response);
    }

}
