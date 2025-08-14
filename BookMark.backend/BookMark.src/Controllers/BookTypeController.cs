using BookMark.Data.Repositories;
using BookMark.Models.DTOs;
using BookMark.Models.Relationships;
using Microsoft.AspNetCore.Mvc;

namespace BookMark.Controllers;

[ApiController]
[Route("api/book-types")]
public class BookTypeController : BaseController<BookType, BookTypeDTO, BookTypeDTO, BookTypeResponseDTO>
{
    public BookTypeController(BookTypeRepository repository) : base(repository) { }

}
