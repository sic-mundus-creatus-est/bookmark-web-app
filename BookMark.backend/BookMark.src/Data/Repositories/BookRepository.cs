using Microsoft.EntityFrameworkCore;

using BookMark.Models.Domain;
using BookMark.Models.Relationships;
using BookMark.Models;

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

        await _bookAuthorDbSet.AddRangeAsync(newBook.BookAuthors);

        await _bookGenreDbSet.AddRangeAsync(newBook.BookGenres);

        await _context.SaveChangesAsync();

        return newBook;
    }


    public override async Task<Book?> GetByIdAsync(string id, bool changeTracking = false)
    {
        IQueryable<Book> query = _dbSet;

        if (!changeTracking)
            query = query.AsNoTracking();

        return await query.Include(b => b.BookType)
                          .Include(b => b.BookAuthors).ThenInclude(b => b.Author)
                          .Include(b => b.BookGenres).ThenInclude(b => b.Genre)
                          .FirstOrDefaultAsync(b => b.Id == id);
    }


    public override async Task<List<Book>> GetAllAsync()
    {
        return await _dbSet.AsNoTracking().Include(b => b.BookType)
                                          .Include(b => b.BookAuthors).ThenInclude(b => b.Author)
                                          .Include(b => b.BookGenres).ThenInclude(b => b.Genre)
                                          .ToListAsync();
    }


    public async Task<Page<Book>> GetConstrainedBooksAsync(int pageIndex,
                                                            int pageSize,
                                                            bool sortDescending = false,
                                                            string? sortBy = null,
                                                            Dictionary<string, string>? bookFilters = null,
                                                            List<string>? bookTypes = null,
                                                            List<string>? bookAuthors = null,
                                                            List<string>? bookGenres = null) {
        var query = _dbSet.AsNoTracking()
                          .Include(b => b.BookType)
                          .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                          .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                          .AsQueryable();

        if (bookTypes?.Count > 0)
            query = query.Where(b => bookTypes.Any(bt => b.BookType.Name.Contains(bt)));

        if (bookAuthors?.Count > 0)
            query = query.Where(b => b.BookAuthors.Any(ba => bookAuthors.Any(a => ba.Author.Name.Contains(a))));

        if (bookGenres?.Count > 0)
            query = query.Where(b => b.BookGenres.Any(bg => bookGenres.Any(g => bg.Genre.Name.Contains(g))));

        return await GetConstrainedAsync(pageIndex, pageSize, sortDescending, sortBy, bookFilters, query);
    }


    public async Task ReplaceBookAuthorsAsync(string bookId, ICollection<BookAuthor> updatedAuthors)
    {
        var existingAuthors = await _bookAuthorDbSet
            .Where(ba => ba.BookId == bookId)
            .ToListAsync();

        _bookAuthorDbSet.RemoveRange(existingAuthors);

        await _bookAuthorDbSet.AddRangeAsync(updatedAuthors);

        await _context.SaveChangesAsync();
    }


    public async Task ReplaceBookGenresAsync(string bookId, ICollection<BookGenre> updatedGenres)
    {
        var existingGenres = await _bookGenreDbSet
            .Where(ba => ba.BookId == bookId)
            .ToListAsync();

        _bookGenreDbSet.RemoveRange(existingGenres);

        await _bookGenreDbSet.AddRangeAsync(updatedGenres);

        await _context.SaveChangesAsync();
    }


    public async Task<List<Book>> GetBooksByAuthorAsync(string authorId, int count)
    {
        return await _dbSet.Include(b => b.BookType)
                           .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                           .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                           .Where(b => b.BookAuthors.Any(ba => ba.AuthorId == authorId))
                           .AsNoTracking()
                           .Take(count)
                           .ToListAsync();
    }
    

    public async Task<List<Book>> GetBooksInGenreAsync(string genreId, int count)
    {
        return await _dbSet.Include(b => b.BookType)
                           .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                           .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                           .Where(b => b.BookGenres.Any(bg => bg.GenreId == genreId))
                           .AsNoTracking()
                           .Take(count)
                           .ToListAsync();
    }

}
