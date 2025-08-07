using Microsoft.AspNetCore.Mvc;

using BookMark.Data.Repositories;
using BookMark.Models.Domain;
using BookMark.Models.DTOs;

namespace BookMark.Controllers;

[ApiController]
[Route("api/genres")]
public class GenreController : BaseController<Genre, GenreCreateDTO, GenreUpdateDTO, GenreResponseDTO>
{
    public GenreController(GenreRepository repository) : base(repository) { }

    [HttpGet("{id}/books")]
    public async Task<ActionResult<List<BookResponseDTO>>> GetBooksWithGenre(
        [FromRoute] string id,
        [FromQuery] int count = 10)
    {
        var genre = await _repository.GetByIdAsync(id);
        if (genre == null)
            return Problem(title: "Genre Not Found",
                            detail: $"No Genre with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound);

        var response = new List<BookResponseDTO>();

        if (_repository is GenreRepository genreRepo)
        {
            var books = await genreRepo.GetBooksWithGenreAsync(id, count);

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
