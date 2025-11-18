using Microsoft.AspNetCore.Mvc;
using AutoMapper;

using BookMark.Data.Repositories;
using BookMark.Models.Domain;
using BookMark.Models.DTOs;

namespace BookMark.Controllers;

[ApiController]
[Route("api/genres")]
public class GenreController : BaseController<Genre, GenreCreateDTO, GenreUpdateDTO, GenreResponseDTO, GenreLinkDTO>
{
    public GenreController(IBaseRepository<Genre> repository, IMapper mapper) : base(repository, mapper) { }

    [HttpGet("by/{authorId}")]
    public async Task<ActionResult<List<BookGenreResponseDTO>>> GetGenresByAuthor([FromRoute] string authorId)
    {
        var response = await ((GenreRepository)_repository).GetGenresByAuthorAsync(authorId);

        return Ok(response);
    }

}
