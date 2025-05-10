using BookMark.Models;
using BookMark.Services.Repositories;
using Microsoft.AspNetCore.Mvc;
using BookMark.DTOs;

namespace BookMark.Controllers;

[ApiController]
[Route("api/authors")]
public class AuthorController : BaseController<Author, AuthorCreateDTO, AuthorUpdateDTO, AuthorResponseDTO>
{
    public AuthorController(AuthorRepository repository) : base(repository) { }

}