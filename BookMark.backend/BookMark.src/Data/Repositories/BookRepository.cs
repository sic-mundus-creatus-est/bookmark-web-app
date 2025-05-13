using BookMark.Data;
using BookMark.Models;
using BookMark.Models.Relationships;
using Microsoft.EntityFrameworkCore;
using static BookMark.Controllers.BookController;

namespace BookMark.Services.Repositories;

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
    
    public BookRepository(AppDbContext context) : base(context)
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


    public async Task AddBookAuthorsAsync(List<BookAuthor> bookAuthors)
    {
        var bookId = bookAuthors.First().BookId;

        int existingBookAuthorsCount = await _bookAuthorDbSet.CountAsync(ba => ba.BookId == bookId);

        var newBookAuthors = new List<BookAuthor>();
        foreach (var ba in bookAuthors)
        {
            bool exists = await _bookAuthorDbSet
                                .AnyAsync( existing => 
                        existing.BookId == ba.BookId && 
                    existing.AuthorId == ba.AuthorId );

            if (!exists)
                newBookAuthors.Add(ba);
        }

        if (newBookAuthors.Count == 0)
            throw new InvalidOperationException("All specified authors are already associated with this book.");

        if (newBookAuthors.Count + existingBookAuthorsCount > MAX_BOOK_AUTHORS)
            throw new ArgumentException($"A book cannot have more than {MAX_BOOK_AUTHORS} authors." +
                                                    " The provided author(s) would exceed this limit.");

        _bookAuthorDbSet.AddRange(newBookAuthors);
        await SaveChangesAsync();
    }


    public async Task RemoveBookAuthorsAsync(string bookId, List<string> authorIds)
    {
        var totalBookAuthors = await _bookAuthorDbSet.CountAsync(ba => ba.BookId == bookId);

        if (totalBookAuthors - authorIds.Count < 1)
            throw new ArgumentException("Too many authors provided. A book must retain at least one associated author. " +
                                        $"Currently, it has {totalBookAuthors} authors, so only {totalBookAuthors - 1} can be removed.", nameof(authorIds));

        var authorsToRemove = await _bookAuthorDbSet.AsNoTracking()
                                    .Where(ba => ba.BookId == bookId && authorIds.Contains(ba.AuthorId))
                                    .ToListAsync();

        if (authorsToRemove.Count == 0)
            throw new InvalidOperationException("No matching authors found to remove, or they have already been removed from this book.");
        
        if (authorsToRemove.Count != authorIds.Count)
            throw new ArgumentException("One or more of the provided author IDs are not associated with this book." +
                                                        " Please verify that all IDs are valid.", nameof(authorIds));

        _bookAuthorDbSet.RemoveRange(authorsToRemove);
        await _context.SaveChangesAsync();
    }

}
