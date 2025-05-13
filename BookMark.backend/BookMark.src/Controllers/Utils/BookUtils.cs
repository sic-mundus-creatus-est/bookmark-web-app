
using BookMark.DTOs;
using BookMark.Models;
using BookMark.Models.Relationships;
using BookMark.Services.Repositories;

namespace BookMark.Controllers.Utils;

public static class BookUtils
{
    public static async Task<List<BookAuthor>> AssembleBookAuthors(Book book, List<BookAddAuthorsDTO> authorsWithRoles, IBaseRepository<Author> authorRepository)
    {
        var bookAuthors = new List<BookAuthor>();
        
        authorsWithRoles = [.. authorsWithRoles.DistinctBy(x => x.AuthorId)];
        foreach (var aWr in authorsWithRoles)
        {
            var author = await authorRepository.GetTrackedByIdAsync(aWr.AuthorId);
            if (author == null)
                throw new ArgumentException($"Author with ID '{aWr.AuthorId}' not found! Cannot proceed with the operation unless all specified authors exist.");

            if (!Enum.IsDefined(typeof(BookAuthorRole), aWr.Role))
                throw new ArgumentOutOfRangeException(nameof(aWr.Role), aWr.Role, $"Invalid role '{aWr.Role}' for author ID '{aWr.AuthorId}'. All authors must have an existing role.");

            bookAuthors.Add(new BookAuthor
            {
                Book = book,
                BookId = book.Id,
                Author = author,
                AuthorId = author.Id,
                Role = aWr.Role
            });
        }

        if(bookAuthors.Count == 0)
            throw new FormatException("No valid authors found. Please ensure the authors are being submitted in the correct format.");

        return bookAuthors;
    }

}