using BookMark.backend.Data;
using BookMark.backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMark.backend.Controllers;

[ApiController]
[Route("api/books")]
public class BookController : BaseController<Book>
{
    public BookController(DataContext context) : base(context) { }

}
