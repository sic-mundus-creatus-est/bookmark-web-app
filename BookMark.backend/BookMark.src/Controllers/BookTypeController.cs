using Microsoft.AspNetCore.Mvc;
using AutoMapper;

using BookMark.Data.Repositories;
using BookMark.Models.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Controllers;

[ApiController]
[Route("api/book-types")]
public class BookTypeController : BaseController<BookType, BookTypeCreateUpdateDTO, BookTypeCreateUpdateDTO, BookTypeResponseDTO, BookTypeResponseDTO>
{
    public BookTypeController(BookTypeRepository repository, IMapper mapper) : base(repository, mapper) { }

}
