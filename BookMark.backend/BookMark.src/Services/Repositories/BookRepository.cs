using BookMark.backend.Data;
using BookMark.backend.DTOs;
using BookMark.backend.Models;
using BookMark.backend.Models.Relationships;
using Microsoft.EntityFrameworkCore;

namespace BookMark.backend.Services.Repositories;

public class BookRepository : BaseRepository<Book>
{
    protected DbSet<BookAuthor> _bookAuthorDbSet { get; set; }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Book.Title), 
                                                                            nameof(Book.OriginalLanguage), 
                                                                            nameof(Book.PublicationYear),
                                                                            nameof(Book.PageCount),
                                                                            nameof(Book.Genre),
                                                                            nameof(Book.Description)
                                                                        };
    
    public BookRepository(DataContext context) : base(context)
    {
        _bookAuthorDbSet = context.Set<BookAuthor>();
    }


    public override async Task<Book> CreateAsync(Book newBook)
    {
        await _dbSet.AddAsync(newBook);

        if (newBook.BookAuthors?.Any() == true)
            await _bookAuthorDbSet.AddRangeAsync(newBook.BookAuthors);

        await SaveChangesAsync();

        return newBook;
    }


    public async Task AddBookAuthorsAsync(Book book, List<BookAuthorDTO> authorsWithRoles)
    {
        var existingBookAuthors = await _bookAuthorDbSet
        .Where(ba => ba.BookId == book.Id)
        .Select(ba => ba.AuthorId)
        .ToListAsync();

        var newBookAuthors = authorsWithRoles
            .GroupBy(ba => ba.AuthorId)
            .Select(g => g.First())
            .Where(ba => !existingBookAuthors.Contains(ba.AuthorId))
            .Select(ba => new BookAuthor
            {
                Book = book,
                BookId = book.Id,
                AuthorId = ba.AuthorId,
                Role = ba.Role
            })
            .ToList();

        if (newBookAuthors.Any())
        {
            _bookAuthorDbSet.AddRange(newBookAuthors);
            await SaveChangesAsync();
        }
    }


    public async Task<bool> RemoveBookAuthorsAsync(string bookId, List<string> authorIds)
    {
        var bookAuthorsToRemove = await _bookAuthorDbSet
            .Where(ba => ba.BookId == bookId && authorIds.Contains(ba.AuthorId))
            .ToListAsync();

        if (bookAuthorsToRemove.Any())
        {
            _bookAuthorDbSet.RemoveRange(bookAuthorsToRemove);
            await SaveChangesAsync();
            return true;
        }

        return false; // No relationships found
    }

}
