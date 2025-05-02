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
    protected readonly IFileService _fileService;

    public const int COVER_IMAGE_MAX_SIZE_MB = 10;
    public const long COVER_IMAGE_MAX_SIZE_BYTES = COVER_IMAGE_MAX_SIZE_MB * 1024L * 1024;
    private static readonly string[] AllowedCoverImageExtensions = { ".jpg", ".jpeg", ".png" };

    public BookController(BookRepository repository, AuthorRepository authorRepository, IFileService fileService) : base(repository)
    {
        _authorRepository = authorRepository;
        _fileService = fileService;
    }


    [HttpPost("create")]
    public override async Task<ActionResult<Book>> Create([FromForm] BookCreateDTO bookData)
    {
        if (bookData == null)
            return BadRequest("Book creation data cannot be null!");

        if(bookData.AuthorsWithRoles.Count() == 0)
            return BadRequest("A Book has to have at least one author! Add an author and try again.");
        
        if(bookData.CoverImageFile != null && !_fileService.ValidateFileSize(bookData.CoverImageFile, COVER_IMAGE_MAX_SIZE_BYTES))
                return BadRequest($"The uploaded file is empty or it is exceeding the max size of {COVER_IMAGE_MAX_SIZE_MB}MB!");

        var bookToCreate = new Book();
        bookToCreate.MapFrom(bookData);

        var (bookAuthors, actionResult) = await ProcessAuthors(bookToCreate, bookData.AuthorsWithRoles);
        if (actionResult != null) 
            return actionResult;

        bookToCreate.BookAuthors = bookAuthors;

        if(bookData.CoverImageFile != null)
        {
            bookToCreate.CoverImage = await _fileService.SaveFileAsync(bookData.CoverImageFile!, AllowedCoverImageExtensions);
        }
        
        var createdBook = await _repository.CreateAsync(bookToCreate);
        return CreatedAtAction(nameof(GetById), new { id = bookToCreate.Id }, new { message = "Book created successfully!", data = createdBook });
    }


    [HttpPost("add-authors-to/{bookId}")]
    public async Task<IActionResult> AddBookAuthors([FromRoute] string bookId, [FromBody] List<BookAuthorDTO> authorsWithRoles)
    {
        var book = await _repository.GetByIdAsync(bookId);
        if (book == null)
            return NotFound(new { message = "Book not found." });

        var validAuthors = new List<BookAuthorDTO>();

        foreach (var ba in authorsWithRoles)
        {
            var author = await _authorRepository.GetByIdAsync(ba.AuthorId);
            if (author == null)
                return BadRequest(new { message = $"Author with ID {ba.AuthorId} not found." });

            validAuthors.Add(ba);
        }

        if (_repository is BookRepository bookRepo)
            await bookRepo.AddBookAuthorsAsync(book, validAuthors);

        return Ok(new { message = "Author/s successfully added to the book." });
    }


    [HttpPatch("update-cover-by-id/{bookId}")]
    public async Task<IActionResult> UpdateBookCover([FromRoute] string bookId, IFormFile newCover)
    {
        if(!_fileService.ValidateFileSize(newCover, COVER_IMAGE_MAX_SIZE_BYTES))
            return BadRequest($"The uploaded file is empty or it is exceeding the max size of {COVER_IMAGE_MAX_SIZE_MB}MB!");

        Book? bookToUpdate = await _repository.GetByIdAsync(bookId);
        if (bookToUpdate == null)
            return NotFound($"Book with ID '{bookId}' not found.");

        string? oldCover = bookToUpdate.CoverImage;
        
        var newCoverProp = new {CoverImage = await _fileService.SaveFileAsync(newCover!, AllowedCoverImageExtensions) };

        var updatedBook = await _repository.UpdateAsync(bookToUpdate, newCoverProp);

        if (!string.IsNullOrEmpty(oldCover) && newCoverProp.CoverImage != null)
            _fileService.DeleteFile(oldCover);

        return Ok(updatedBook!.CoverImage);
    }

    [HttpDelete("remove-cover-from/{bookId}")]
    public async Task<IActionResult> RemoveBookCover([FromRoute] string bookId)
    {
        var bookToRemoveCover = await _repository.GetByIdAsync(bookId);
        if (bookToRemoveCover == null)
            return NotFound();
        
        if (bookToRemoveCover.CoverImage != null)
            _fileService.DeleteFile(bookToRemoveCover.CoverImage);
        
        var noCoverProp = new { CoverImage = "" };

        await _repository.UpdateAsync(bookToRemoveCover, noCoverProp);
        return Ok();
    }


    [HttpDelete("remove-authors-from/{bookId}")]
    public async Task<IActionResult> RemoveBookAuthors([FromRoute] string bookId, [FromBody] List<string> authorIds)
    {
        if (authorIds.Count == 0)
            return BadRequest(new { message = "Author IDs have to be specified to attempt their removal!" });

        bool success = false;
        if(_repository is BookRepository bookRepo)
        {
            success = await bookRepo.RemoveBookAuthorsAsync(bookId, authorIds);
        }

        if (success)
            return Ok(new { message = "Author/s removed successfully from the book." });
        else
            return BadRequest(new { message = "No matching author/s found for the specified book!" });
    }


    [HttpDelete("delete-by-id/{bookId}")]
    public override async Task<ActionResult> DeleteById([FromRoute] string bookId)
    {
        var bookToDelete = await _repository.GetByIdAsync(bookId);

        if (bookToDelete == null)
            return NotFound(); // 404

        if (!string.IsNullOrEmpty(bookToDelete.CoverImage))
            _fileService.DeleteFile(bookToDelete.CoverImage);

        await _repository.DeleteAsync(bookToDelete);
        return NoContent(); // 204
    }

    #region Helpers

        private async Task<(List<BookAuthor>?, ActionResult?)> ProcessAuthors( Book newBook, List<BookAuthorDTO> authors )
        {// used during creation
            var uniqueAuthors = authors.DistinctBy(x => x.AuthorId);

            if(!uniqueAuthors.Any())
                return (null, BadRequest($"Not able to find any authors! Check if the authors are being submitted in the right format."));

            var bookAuthors = new List<BookAuthor>();

            foreach (var author in uniqueAuthors)
            {
                var authorEntity = await _authorRepository.GetByIdAsync(author.AuthorId);
                if (authorEntity == null)
                    return (null, BadRequest($"Author with ID '{author.AuthorId}' not found! Unable to continue with book creation."));

                if (!Enum.IsDefined(typeof(BookAuthorRole), author.Role))
                    return (null, BadRequest($"Invalid role '{author.Role}' for author ID '{author.AuthorId}'. Unable to continue with book creation."));

                bookAuthors.Add(new BookAuthor
                {
                    Book = newBook,
                    BookId = newBook.Id,
                    Author = authorEntity,
                    AuthorId = authorEntity.Id,
                    Role = author.Role
                });
            }

            return (bookAuthors, null);
        }

    #endregion

}
