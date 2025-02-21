using Microsoft.AspNetCore.Mvc;

using BookMark.backend.DTOs;
using BookMark.backend.Models;
using BookMark.backend.Services.Repositories;

namespace BookMark.backend.Controllers;

[ApiController]
[Route("api/books")]
public class BookController : BaseController<Book, BookDTO>
{
    public BookController(BookRepository repository) : base(repository) { }

}
