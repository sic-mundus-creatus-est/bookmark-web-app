using Microsoft.AspNetCore.Mvc;
using AutoMapper;

using BookMark.Models.DTOs;
using BookMark.Services.Core;
using BookMark.Models.Domain;
using BookMark.Services.Domain;
using BookMark.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using BookMark.Models.Roles;

namespace BookMark.Controllers;

[ApiController]
[Route("api/books")]
public class BookController : BaseController<Book, BookCreateDTO, BookUpdateDTO, BookResponseDTO, BookLinkDTO>
{
    protected readonly IBookService _bookService;
    protected readonly IFileService _fileService;

    private const int MAX_COVER_IMAGE_SIZE_MB = 10;
    private static readonly string[] AllowedCoverImageExtensions = { ".jpg", ".jpeg", ".png" };
    public const int MAX_BOOK_AUTHORS = 16;
    public const int MAX_BOOK_GENRES = 16;

    public BookController(IBaseRepository<Book> repository, IMapper mapper, IBookService bookService, IFileService fileService) : base(repository, mapper)
    {
        _bookService = bookService;
        _fileService = fileService;
    }


    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost("create")]
    public override async Task<ActionResult<BookResponseDTO>> Create([FromForm] BookCreateDTO creationData)
    {
        var bookToCreate = _mapper.Map<Book>(creationData);

        bookToCreate.Authors = _bookService.AssembleBookAuthors(bookToCreate.Id, creationData.AuthorIds);
        bookToCreate.Genres = _bookService.AssembleBookGenres(bookToCreate.Id, creationData.GenreIds);

        if (creationData.CoverImageFile != null)
            bookToCreate.CoverImageUrl = await _fileService.SaveFileAsync(creationData.CoverImageFile,
                                            AllowedCoverImageExtensions, MAX_COVER_IMAGE_SIZE_MB);

        await ((BookRepository)_repository).CreateAsync(bookToCreate);

        var createdBook = await _repository.GetByIdAsync<BookResponseDTO>(bookToCreate.Id);
        return CreatedAtAction(nameof(Get), new { id = bookToCreate.Id }, createdBook);
    }


    [Authorize(Roles = UserRoles.Admin)]
    [HttpPut("{bookId}/replace-authors")]
    public async Task<ActionResult> ReplaceAuthors([FromRoute] string bookId, [FromBody] List<string> authorIds)
    {
        if (authorIds.Count == 0)
            return Problem(title: "Bad Request",
                            detail: "At least one author ID must be provided.",
                            statusCode: StatusCodes.Status400BadRequest);

        if (authorIds.Count > MAX_BOOK_AUTHORS)
            return Problem(title: "Bad Request",
                           detail: $"A book cannot have more than {MAX_BOOK_AUTHORS} authors.",
                           statusCode: StatusCodes.Status400BadRequest);


        var bookAuthors = _bookService.AssembleBookAuthors(bookId, authorIds);

        await ((BookRepository)_repository).ReplaceBookAuthorsAsync(bookId, bookAuthors);

        return Ok();
    }


    [Authorize(Roles = UserRoles.Admin)]
    [HttpPut("{bookId}/replace-genres")]
    public async Task<ActionResult> ReplaceGenres([FromRoute] string bookId, [FromBody] List<string> genreIds)
    {
        if (genreIds.Count == 0)
            return Problem(title: "Bad Request",
                            detail: "At least one genre ID must be provided.",
                            statusCode: StatusCodes.Status400BadRequest);

        if (genreIds.Count > MAX_BOOK_GENRES)
            return Problem(title: "Bad Request",
                           detail: $"A book cannot have more than {MAX_BOOK_GENRES} genres.",
                           statusCode: StatusCodes.Status400BadRequest);


        var bookGenres = _bookService.AssembleBookGenres(bookId, genreIds);

        await ((BookRepository)_repository).ReplaceBookGenresAsync(bookId, bookGenres);

        return Ok();
    }


    [Authorize(Roles = UserRoles.Admin)]
    [HttpPatch("{bookId}/update-cover-image")]
    public async Task<ActionResult> UpdateCoverImage([FromRoute] string bookId, IFormFile? newCover)
    {
        var bookToUpdate = await _repository.GetByIdAsync<BookLinkDTO>(bookId);
        if (bookToUpdate == null)
            return Problem(title: "Bad Request",
                            detail: $"No Book with ID '{bookId}' found. Unable to update the cover.",
                            statusCode: StatusCodes.Status400BadRequest);

        string? oldCover = bookToUpdate.CoverImageUrl;

        if (newCover == null)
        {// => [ remove cover ]
            await _repository.UpdateAsync(bookId, new { CoverImageUrl = "" });

            if (!string.IsNullOrEmpty(oldCover))
                _fileService.DeleteFile(oldCover);

            return NoContent();
        }

        // => [ add/replace cover ]
        var newCoverProp = new { CoverImageUrl = await _fileService.SaveFileAsync(newCover!, AllowedCoverImageExtensions, MAX_COVER_IMAGE_SIZE_MB) };

        await _repository.UpdateAsync(bookId, newCoverProp);

        if (!string.IsNullOrEmpty(oldCover))
            _fileService.DeleteFile(oldCover);

        return Ok();
    }


    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("delete/{id}")]
    public override async Task<ActionResult> Delete([FromRoute] string id)
    {
        var bookToDelete = await _repository.GetByIdAsync<BookLinkDTO>(id);

        if (bookToDelete == null)
            return Problem(title: "Bad Request",
                            detail: $"No Book with ID '{id}' found. It may have already been deleted or never existed.",
                            statusCode: StatusCodes.Status400BadRequest);

        if (!string.IsNullOrEmpty(bookToDelete.CoverImageUrl))
            _fileService.DeleteFile(bookToDelete.CoverImageUrl);

        await _repository.DeleteAsync(id);
        return NoContent();
    }

}
