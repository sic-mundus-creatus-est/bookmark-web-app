using Microsoft.AspNetCore.Mvc;

using BookMark.Models.DTOs;
using BookMark.Services.Core;
using BookMark.Models.Domain;
using BookMark.Services.Domain;
using BookMark.Data.Repositories;

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
    public const int MAX_GENRES = 16;

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

        bookToCreate.BookAuthors = await _bookService.AssembleBookAuthors(bookToCreate, creationData.AuthorsWithRoles);
        bookToCreate.BookGenres = await _bookService.AssembleBookGenres(bookToCreate, creationData.GenreIds);

        if (creationData.CoverImageFile != null)
            bookToCreate.CoverImage = await _fileService.SaveFileAsync(creationData.CoverImageFile,
                                            AllowedCoverImageExtensions, COVER_IMAGE_MAX_SIZE_MB);

        var createdBook = await _repository.CreateAsync(bookToCreate);

        var response = new BookResponseDTO();
        createdBook!.MapTo(response);

        return CreatedAtAction(nameof(Get), new { id = createdBook.Id }, response);
    }


    [HttpPut("{id}/replace-authors")]
    public async Task<IActionResult> ReplaceAuthors([FromRoute] string id, [FromBody] List<BookAuthorDTO> authorsWithRoles)
    {
        var book = await _repository.GetTrackedByIdAsync(id);
        if (book == null)
            return Problem(title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound);

        if (authorsWithRoles.Count == 0)
            return Problem(title: "Bad Request",
                            detail: "At least one author ID with a role must be provided.",
                            statusCode: StatusCodes.Status400BadRequest);

        var bookAuthors = await _bookService.AssembleBookAuthors(book, authorsWithRoles);

        if (_repository is BookRepository bookRepo)
            await bookRepo.ReplaceBookAuthorsAsync(book.Id, bookAuthors);

        return Ok();
    }


    [HttpPost("{id}/add-authors")]
    public async Task<IActionResult> AddAuthors([FromRoute] string id, [FromBody] List<BookAuthorDTO> authorsWithRoles)
    {
        var book = await _repository.GetTrackedByIdAsync(id);
        if (book == null)
            return Problem( title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound );
        
        if (authorsWithRoles.Count == 0)
            return Problem( title: "Bad Request",
                            detail: "At least one author ID with a role must be provided.",
                            statusCode: StatusCodes.Status400BadRequest );

        var bookAuthors = await _bookService.AssembleBookAuthors(book, authorsWithRoles);

        if (_repository is BookRepository bookRepo)
            await bookRepo.AddBookAuthorsAsync(bookAuthors);

        return Ok();

    }


    [HttpDelete("{id}/remove-authors")]
    public async Task<IActionResult> RemoveAuthors([FromRoute] string id, [FromBody] List<string> authorIds)
    {
        var book = await _repository.GetByIdAsync(id);
        if (book == null)
            return Problem( title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound );

        if (authorIds.Count == 0)
            return Problem( title: "Bad Request",
                            detail: "At least one author ID is required for removal.",
                            statusCode: StatusCodes.Status400BadRequest );

        authorIds = [.. authorIds.Distinct()];

        if(_repository is BookRepository bookRepo)
            await bookRepo.RemoveBookAuthorsAsync(id, authorIds);

        return NoContent();
    }


    [HttpPut("{id}/replace-genres")]
    public async Task<IActionResult> ReplaceGenres([FromRoute] string id, [FromBody] List<string> genreIds)
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

        var bookGenres = await _bookService.AssembleBookGenres(book, genreIds);


        if (_repository is BookRepository bookRepo)
            await bookRepo.ReplaceBookGenresAsync(book.Id, bookGenres);

        return Ok();
    }


    [HttpPatch("{id}/update-cover-image")]
    public async Task<IActionResult> UpdateCoverImage([FromRoute] string id, IFormFile newCover)
    {
        Book? bookToUpdate = await _repository.GetTrackedByIdAsync(id);
        if (bookToUpdate == null)
            return Problem( title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound );

        string? oldCover = bookToUpdate.CoverImage;
        
        var newCoverProp = new { CoverImage = await _fileService.SaveFileAsync(newCover!, AllowedCoverImageExtensions, COVER_IMAGE_MAX_SIZE_MB) };

        await _repository.UpdateAsync(bookToUpdate, newCoverProp);

        if (!string.IsNullOrEmpty(oldCover))
            _fileService.DeleteFile(oldCover);

        return Ok();
    }


    [HttpDelete("{id}/remove-cover-image")]
    public async Task<IActionResult> RemoveCoverImage([FromRoute] string id)
    {
        var bookToUpdate = await _repository.GetTrackedByIdAsync(id);
        if (bookToUpdate == null)
            return Problem( title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound );
        
        if (bookToUpdate.CoverImage != null)
            _fileService.DeleteFile(bookToUpdate.CoverImage);
        
        var noCoverProp = new { CoverImage = "" };

        await _repository.UpdateAsync(bookToUpdate, noCoverProp);
        return NoContent();
    }


    [HttpDelete("delete/{id}")]
    public override async Task<ActionResult> Delete([FromRoute] string id)
    {
        var bookToDelete = await _repository.GetByIdAsync(id);

        if (bookToDelete == null)
            return Problem( title: "Book Not Found",
                            detail: $"No Book with ID '{id}' was found. It may have already been deleted or never existed.",
                            statusCode: StatusCodes.Status404NotFound );

        if (!string.IsNullOrEmpty(bookToDelete.CoverImage))
            _fileService.DeleteFile(bookToDelete.CoverImage);

        await _repository.DeleteAsync(bookToDelete);
        return NoContent(); // 204
    }

}
