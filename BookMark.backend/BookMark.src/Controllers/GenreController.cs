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

    [HttpGet("by/{authorId}")]
    public async Task<ActionResult<List<BookGenreResponseDTO>>> GetGenresByAuthor([FromRoute] string authorId)
    {
        var response = await ((GenreRepository)_repository).GetGenresByAuthorAsync(authorId);

        return Ok(response);
    }

}
