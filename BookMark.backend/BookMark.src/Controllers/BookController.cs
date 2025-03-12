using Microsoft.AspNetCore.Mvc;

using BookMark.backend.DTOs;
using BookMark.backend.Models;
using BookMark.backend.Services.Repositories;
using BookMark.backend.Models.Relationships;

namespace BookMark.backend.Controllers;

[ApiController]
[Route("api/books")]
public class BookController : BaseController<Book, BookCreateDTO, BookUpdateDTO>
{
    protected readonly AuthorRepository _authorRepository;

    public BookController(BookRepository repository, AuthorRepository authorRepository) : base(repository)
    {
        _authorRepository = authorRepository;
    }


    public override async Task<ActionResult<Book>> Create([FromBody] BookCreateDTO dto)
    {
        var authorsWithRoles = new List<(Author Author, BookAuthorRole Role)>();

        var distinctAuthors = dto.AuthorsWithRoles
        .GroupBy(x => x.Key)
        .Select(group => group.First())
        .ToList();

        foreach (var authorPair in distinctAuthors)
        {
            var authorId = authorPair.Key;
            var authorRole = authorPair.Value;

            var author = await _authorRepository.GetByIdAsync(authorId);
            if (author == null)
            {
                return BadRequest(new { message = $"Author with ID {authorId} not found. Unable to add the book." });
            }

            authorsWithRoles.Add((author, authorRole));
        }

        Book entity = new Book();
        entity.MapFrom(dto);

        List<BookAuthor> bookAuthors = new List<BookAuthor>();

        foreach (var authorWithRole in authorsWithRoles)
        {
            var bookAuthor = new BookAuthor
            {
                Book = entity,
                BookId = entity.Id,
                Author = authorWithRole.Author,
                AuthorId = authorWithRole.Author.Id,
                Role = authorWithRole.Role
            };

            bookAuthors.Add(bookAuthor);
        }

        entity.BookAuthors = bookAuthors;
        
        var createdEntity = await _repository.CreateAsync(entity);


        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new { message = "Book created successfully.", data = createdEntity });
    }


    [HttpPost("add-authors-to/{bookId}")]
    public async Task<IActionResult> AddBookAuthors([FromRoute] string bookId, [FromBody] List<BookAuthorDTO> authorsWithRoles)
    {
        var book = await _repository.GetByIdAsync(bookId);
        if (book == null)
        {
            return NotFound(new { message = "Book not found." });
        }

        var validAuthors = new List<BookAuthorDTO>();

        foreach (var ba in authorsWithRoles)
        {
            var author = await _authorRepository.GetByIdAsync(ba.AuthorId);
            if (author == null)
            {
                return BadRequest(new { message = $"Author with ID {ba.AuthorId} not found." });
            }
            validAuthors.Add(ba);
        }

        if (_repository is BookRepository bookRepo)
        {
            await bookRepo.AddBookAuthorsAsync(book, validAuthors);
        }

        return Ok(new { message = "Author/s successfully added to the book." });
    }


    [HttpDelete("remove-authors-from/{bookId}")]
    public async Task<IActionResult> RemoveBookAuthors([FromRoute] string bookId, [FromBody] List<string> authorIds)
    {
        if (authorIds?.Any() != true)
        {
            return BadRequest(new { message = "Author IDs are required." });
        }

        bool success = false;
        if(_repository is BookRepository bookRepo)
        {
            success = await bookRepo.RemoveBookAuthorsAsync(bookId, authorIds);
        }

        if (success)
            return Ok(new { message = "Author/s removed successfully from the book." });
        else
            return NotFound(new { message = "No matching author/s found for the specified book." });
    }

}
