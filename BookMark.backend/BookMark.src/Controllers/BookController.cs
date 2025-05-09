using Microsoft.AspNetCore.Mvc;

using BookMark.Models;
using BookMark.Services.Repositories;
using BookMark.Controllers.Utils;
using BookMark.DTOs;

namespace BookMark.Controllers;

[ApiController]
[Route("api/books")]
public class BookController : BaseController<Book, BookCreateDTO, BookUpdateDTO>
{
    protected readonly AuthorRepository _authorRepository;
    protected readonly IFileService _fileService;

    private const int COVER_IMAGE_MAX_SIZE_MB = 10;
    private static readonly string[] AllowedCoverImageExtensions = { ".jpg", ".jpeg", ".png" };
    public const int MAX_BOOK_AUTHORS = 16;

    public BookController(BookRepository repository, AuthorRepository authorRepository, IFileService fileService) : base(repository)
    {
        _authorRepository = authorRepository;
        _fileService = fileService;
    }


    [HttpPost("create")]
    public override async Task<ActionResult<Book>> Create([FromForm] BookCreateDTO creationData)
    {
        var bookToCreate = new Book();
        bookToCreate.MapFrom(creationData);

        bookToCreate.BookAuthors = await BookUtils.AssembleBookAuthors(bookToCreate, creationData.AuthorsWithRoles, _authorRepository);

        if(creationData.CoverImageFile != null)
        {
            bookToCreate.CoverImage = await _fileService.SaveFileAsync(creationData.CoverImageFile!, AllowedCoverImageExtensions, COVER_IMAGE_MAX_SIZE_MB);
        }
        
        var createdBook = await _repository.CreateAsync(bookToCreate);
        return CreatedAtAction(nameof(Get), new { id = bookToCreate.Id }, createdBook);
    }


    [HttpPost("{id}/add-authors")]
    public async Task<IActionResult> AddAuthors([FromRoute] string id, [FromBody] List<AuthorWithRoleDTO> authorsWithRoles)
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

        var bookAuthors = await BookUtils.AssembleBookAuthors(book, authorsWithRoles, _authorRepository);

        if (_repository is BookRepository bookRepo)
            await bookRepo.AddBookAuthorsAsync(bookAuthors);

        return Ok("Specified author(s) were successfully associated with the book.");

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

        return Ok("The book's cover image was successfully updated.");
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
