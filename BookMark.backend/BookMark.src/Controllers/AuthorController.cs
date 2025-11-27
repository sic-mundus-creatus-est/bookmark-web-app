using Microsoft.AspNetCore.Mvc;
using AutoMapper;

using BookMark.Models.DTOs;
using BookMark.Models.Domain;
using BookMark.Data.Repositories;

namespace BookMark.Controllers;

[ApiController]
[Route("api/authors")]
public class AuthorController : BaseController<Author, AuthorCreateDTO, AuthorUpdateDTO, AuthorResponseDTO, AuthorLinkDTO>
{
    public AuthorController(IBaseRepository<Author> repository, IMapper mapper) : base(repository, mapper) { }

    public override async Task<ActionResult<AuthorResponseDTO>> Create(AuthorCreateDTO createDto)
    {
        if(createDto.BirthYear > createDto.DeathYear)
            return Problem(title: "Bad Request",
                            detail: "Birth Year must come before Death Year.",
                            statusCode: StatusCodes.Status400BadRequest);
        
        return await base.Create(createDto);
    }

    [HttpGet("get-author-suggestions")]
    public async Task<ActionResult<List<AuthorLinkDTO>>> GetAuthorSuggestions([FromQuery] string searchTerm, [FromQuery] List<string>? skipIds = null, [FromQuery] int count = 5)
    {
        var authors = await ((AuthorRepository)_repository).GetAuthorSuggestionsAsync(searchTerm, skipIds, count);

        return Ok(authors);
    }

}
