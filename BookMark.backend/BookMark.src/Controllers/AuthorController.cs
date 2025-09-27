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
    public AuthorController(AuthorRepository repository, IMapper mapper) : base(repository, mapper) { }

    [HttpGet("get-author-suggestions")]
    public async Task<ActionResult<AuthorLinkDTO[]>> GetAuthorSuggestions([FromQuery] string searchTerm, [FromQuery] List<string>? skipIds, [FromQuery] int count = 5)
    {
        var authors = await ((AuthorRepository)_repository).GetAuthorSuggestionsAsync(searchTerm, skipIds, count);

        return Ok(authors);
    }

}
