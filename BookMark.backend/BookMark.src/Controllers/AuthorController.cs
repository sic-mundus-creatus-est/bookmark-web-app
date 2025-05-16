using Microsoft.AspNetCore.Mvc;

using BookMark.DTOs;
using BookMark.Models.Domain;
using BookMark.Services.Repositories;

namespace BookMark.Controllers;

[ApiController]
[Route("api/authors")]
public class AuthorController : BaseController<Author, AuthorCreateDTO, AuthorUpdateDTO, AuthorResponseDTO>
{
    public AuthorController(AuthorRepository repository) : base(repository) { }

}