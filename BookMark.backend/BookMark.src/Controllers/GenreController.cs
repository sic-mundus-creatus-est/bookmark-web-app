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
    private readonly IBaseRepository<Author> _authorRepository;
    public GenreController(IBaseRepository<Genre> repository, IMapper mapper, IBaseRepository<Author> authorRepo) : base(repository, mapper)
    {
        _authorRepository = authorRepo;
    }

    [HttpGet("by/{authorId}")]
    public async Task<ActionResult<List<GenreLinkDTO>>> GetGenresByAuthor([FromRoute] string authorId)
    {
        var response = await ((GenreRepository)_repository).GetGenresByAuthorAsync(authorId);

        if(response.Count == 0 && !await _authorRepository.ExistsAsync(authorId))
            return Problem(title: "Bad Request",
                            detail: $"Author with ID '{authorId}' does not exist.",
                            statusCode: StatusCodes.Status400BadRequest);
        else
            return Ok(response);
    }

}
