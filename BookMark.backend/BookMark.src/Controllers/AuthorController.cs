using BookMark.backend.Controllers;
using BookMark.backend.Models;
using BookMark.backend.Services.Repositories;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/authors")]
public class AuthorController : BaseController<Author, AuthorCreateDTO, AuthorUpdateDTO>
{
    public AuthorController(AuthorRepository repository) : base(repository) { }

}