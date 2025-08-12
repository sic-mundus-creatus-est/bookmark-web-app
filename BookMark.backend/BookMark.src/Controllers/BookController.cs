using Microsoft.AspNetCore.Mvc;

using BookMark.Models.DTOs;
using BookMark.Services.Core;
using BookMark.Models.Domain;
using BookMark.Services.Domain;
using BookMark.Data.Repositories;
using BookMark.Models;
using BookMark.Models.Relationships;

namespace BookMark.Controllers;

[ApiController]
[Route("api/books")]
public class BookController : BaseController<Book, BookCreateDTO, BookUpdateDTO, BookResponseDTO>
{
    protected readonly BookService _bookService;
    protected readonly IFileService _fileService;

    private const int COVER_IMAGE_MAX_SIZE_MB = 10;
    private static readonly string[] AllowedCoverImageExtensions = { ".jpg", ".jpeg", ".png" };
    public const int MAX_BOOK_AUTHORS = 16;
    public const int MAX_BOOK_GENRES = 16;

    public BookController(BookRepository repository, BookService bookService, IFileService fileService) : base(repository)
    {
        _bookService = bookService;
        _fileService = fileService;
    }


    [HttpPost("create")]
    public override async Task<ActionResult<BookResponseDTO>> Create([FromForm] BookCreateDTO creationData)
    {
        var bookToCreate = new Book();
        bookToCreate.MapFrom(creationData);
        
        bookToCreate.BookAuthors = await _bookService.AssembleBookAuthors(bookToCreate, creationData.AuthorIds);
        bookToCreate.BookGenres = await _bookService.AssembleBookGenres(bookToCreate, creationData.GenreIds);

        if (creationData.CoverImageFile != null)
            bookToCreate.CoverImageUrl = await _fileService.SaveFileAsync(creationData.CoverImageFile,
                                            AllowedCoverImageExtensions, COVER_IMAGE_MAX_SIZE_MB);

        var createdBook = await ((BookRepository)_repository).CreateAsync(bookToCreate);

        var response = new BookResponseDTO();
        createdBook.MapTo(response);

        return CreatedAtAction(nameof(Get), new { id = createdBook.Id }, response);
    }


    [HttpGet("get-constrained-books")]
    public async Task<ActionResult<Page<BookResponseDTO>>> GetConstrainedBooks([FromQuery] int pageIndex = 1,
                                                                                [FromQuery] int pageSize = 10,
                                                                                [FromQuery] bool sortDescending = false,
                                                                                [FromQuery] string? sortBy = null,
                                                                                [FromQuery(Name = "filters")] Dictionary<string, string>? filters = null,
                                                                                [FromQuery] List<string>? bookTypes = null,
                                                                                [FromQuery] List<string>? bookAuthors = null,
                                                                                [FromQuery] List<string>? bookGenres = null) {
        var page = await ((BookRepository)_repository).GetConstrainedBooksAsync(
            pageIndex, pageSize, sortDescending, sortBy, filters, bookTypes, bookAuthors, bookGenres);

        var itemDtos = page.Items!.Select(entity =>
        {
            var dto = Activator.CreateInstance<BookResponseDTO>();
            entity.MapTo(dto!);
            return dto;
        }).ToList();

        var response = new Page<BookResponseDTO>(
            itemDtos, page.PageIndex, page.TotalPages);

        return Ok(response);
    }


    [HttpPut("{id}/replace-authors")]
    public async Task<ActionResult> ReplaceAuthors([FromRoute] string id, [FromBody] List<string> authorIds)
    {
        var book = await _repository.GetTrackedByIdAsync(id);
        if (book == null)
            return Problem(title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound);

        if (authorIds.Count == 0)
            return Problem(title: "Bad Request",
                            detail: "At least one author ID must be provided.",
                            statusCode: StatusCodes.Status400BadRequest);
        
        if (authorIds.Count > 16)
             return Problem(title: "Bad Request",
                            detail: $"A book cannot have more than {MAX_BOOK_AUTHORS} authors.",
                            statusCode: StatusCodes.Status400BadRequest);


        var bookAuthors = await _bookService.AssembleBookAuthors(book, authorIds);

        await ((BookRepository)_repository).ReplaceBookAuthorsAsync(book.Id, bookAuthors);

        return Ok();
    }


    [HttpPut("{id}/replace-genres")]
    public async Task<ActionResult> ReplaceGenres([FromRoute] string id, [FromBody] List<string> genreIds)
    {
        var book = await _repository.GetTrackedByIdAsync(id);
        if (book == null)
            return Problem(title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound);

        if (genreIds.Count == 0)
            return Problem(title: "Bad Request",
                            detail: "At least one genre ID must be provided.",
                            statusCode: StatusCodes.Status400BadRequest);
        
        if (genreIds.Count > 16)
             return Problem(title: "Bad Request",
                            detail: $"A book cannot have more than {MAX_BOOK_GENRES} genres.",
                            statusCode: StatusCodes.Status400BadRequest);


        var bookGenres = await _bookService.AssembleBookGenres(book, genreIds);

        await ((BookRepository)_repository).ReplaceBookGenresAsync(book.Id, bookGenres);

        return Ok();
    }


    [HttpPatch("{id}/update-cover-image")]
    public async Task<ActionResult> UpdateCoverImage([FromRoute] string id, IFormFile? newCover)
    {
        Book? bookToUpdate = await _repository.GetTrackedByIdAsync(id);
        if (bookToUpdate == null)
            return Problem( title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound );

        string? oldCover = bookToUpdate.CoverImageUrl;

        if (newCover == null)
        {// => [ remove cover ]
            await _repository.UpdateAsync(bookToUpdate, new { CoverImageUrl = "" });

            if (!string.IsNullOrEmpty(oldCover))
                _fileService.DeleteFile(oldCover);

            return NoContent();
        }

        // => [ add/replace cover ]
        var newCoverProp = new { CoverImage = await _fileService.SaveFileAsync(newCover!, AllowedCoverImageExtensions, COVER_IMAGE_MAX_SIZE_MB) };

        await _repository.UpdateAsync(bookToUpdate, newCoverProp);

        if (!string.IsNullOrEmpty(oldCover))
            _fileService.DeleteFile(oldCover);

        return Ok();
    }


    [HttpDelete("delete/{id}")]
    public override async Task<ActionResult> Delete([FromRoute] string id)
    {
        var bookToDelete = await _repository.GetByIdAsync(id);

        if (bookToDelete == null)
            return Problem( title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found. It may have already been deleted or never existed.",
                            statusCode: StatusCodes.Status404NotFound );

        if (!string.IsNullOrEmpty(bookToDelete.CoverImageUrl))
            _fileService.DeleteFile(bookToDelete.CoverImageUrl);

        await _repository.DeleteAsync(bookToDelete);
        return NoContent(); // 204
    }

}
