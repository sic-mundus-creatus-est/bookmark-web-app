using Microsoft.EntityFrameworkCore;

using BookMark.Models.Domain;
using BookMark.Models.Relationships;
using static BookMark.Controllers.BookController;

namespace BookMark.Data.Repositories;

public class BookRepository : BaseRepository<Book>
{
    protected DbSet<BookAuthor> _bookAuthorDbSet { get; set; }
    protected DbSet<BookGenre> _bookGenreDbSet { get; set; }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Book.Title),
                                                                            nameof(Book.OriginalLanguage),
                                                                            nameof(Book.PublicationYear),
                                                                            nameof(Book.PageCount),
                                                                            nameof(Book.Description)
                                                                        };

    public BookRepository(AppDbContext context) : base(context)
    {
        _bookAuthorDbSet = context.Set<BookAuthor>();
        _bookGenreDbSet = context.Set<BookGenre>();
    }


    public override async Task<Book> CreateAsync(Book newBook)
    {
        await _dbSet.AddAsync(newBook);

        if (newBook.BookAuthors?.Any() == true)
            await _bookAuthorDbSet.AddRangeAsync(newBook.BookAuthors);

        if (newBook.BookGenres?.Any() == true)
            await _bookGenreDbSet.AddRangeAsync(newBook.BookGenres);

        await SaveChangesAsync();

        return newBook;
    }


    public async Task AddBookAuthorsAsync(ICollection<BookAuthor> bookAuthors)
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
            throw new ArgumentException("All specified authors are already associated with this book.");

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
            throw new ArgumentException("No matching authors found to remove, or they have already been removed from this book.");

        if (authorsToRemove.Count != authorIds.Count)
            throw new ArgumentException("One or more of the provided author IDs are not associated with this book." +
                                                        " Please verify that all IDs are valid.", nameof(authorIds));

        _bookAuthorDbSet.RemoveRange(authorsToRemove);
        await _context.SaveChangesAsync();
    }

    public async Task ReplaceBookAuthorsAsync(string bookId, ICollection<BookAuthor> newBookAuthors)
    {
        if (string.IsNullOrWhiteSpace(bookId))
            throw new ArgumentException("Book ID must be provided.", nameof(bookId));

        if (newBookAuthors == null || newBookAuthors.Count == 0)
            throw new ArgumentException("At least one author must be provided for replacement.", nameof(newBookAuthors));

        if (newBookAuthors.Count > MAX_BOOK_AUTHORS)
            throw new ArgumentException($"A book cannot have more than {MAX_BOOK_AUTHORS} authors.");

        var existingAuthors = await _bookAuthorDbSet
            .Where(ba => ba.BookId == bookId)
            .ToListAsync();

        _bookAuthorDbSet.RemoveRange(existingAuthors);

        _bookAuthorDbSet.AddRange(newBookAuthors);

        await _context.SaveChangesAsync();
    }
    

    public async Task ReplaceBookGenresAsync(string bookId, ICollection<BookGenre> genres)
    {
        if (string.IsNullOrWhiteSpace(bookId))
            throw new ArgumentException("Book ID must be provided.", nameof(bookId));

        if (genres == null || genres.Count == 0)
            throw new ArgumentException("At least one genre must be provided for replacement.", nameof(genres));

        if (genres.Count > MAX_GENRES)
            throw new ArgumentException($"A book cannot have more than {MAX_GENRES} genres.");

        var existingGenres = await _bookGenreDbSet
            .Where(ba => ba.BookId == bookId)
            .ToListAsync();

        _bookGenreDbSet.RemoveRange(existingGenres);

        _bookGenreDbSet.AddRange(genres);

        await _context.SaveChangesAsync();
    }


}
