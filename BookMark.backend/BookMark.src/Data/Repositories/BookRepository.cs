using Microsoft.EntityFrameworkCore;

using BookMark.Models.Domain;
using BookMark.Models.Relationships;
using BookMark.Models;
using AutoMapper;
using BookMark.Models.DTOs;
using AutoMapper.QueryableExtensions;

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

    public BookRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
        _bookAuthorDbSet = context.Set<BookAuthor>();
        _bookGenreDbSet = context.Set<BookGenre>();
    }


    public override async Task CreateAsync(Book bookToCreate)
    {        
        await _dbSet.AddAsync(bookToCreate);

        await _bookAuthorDbSet.AddRangeAsync(bookToCreate.BookAuthors);

        await _bookGenreDbSet.AddRangeAsync(bookToCreate.BookGenres);

        await _context.SaveChangesAsync();
    }


    public async Task<Page<BookLinkDTO>> GetConstrainedBooksAsync<BookLinkDTO>(int pageIndex,
                                                            int pageSize,
                                                            bool sortDescending = false,
                                                            string? sortBy = null,
                                                            Dictionary<string, string>? bookFilters = null,
                                                            List<string>? bookTypeIds = null,
                                                            List<string>? bookAuthorIds = null,
                                                            List<string>? bookGenreIds = null) {
        var query = _dbSet.AsNoTracking()
                          .Include(b => b.BookType)
                          .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                          .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                          .AsQueryable();

        if (bookTypeIds?.Count > 0)
            query = query.Where(b => bookTypeIds.Any(bt => b.BookType.Name.Contains(bt)));

        if (bookAuthorIds?.Count > 0)
            query = query.Where(b => b.BookAuthors.Any(ba => bookAuthorIds.Any(a => ba.Author.Name.Contains(a))));

        if (bookGenreIds?.Count > 0)
            query = query.Where(b => b.BookGenres.Any(bg => bookGenreIds.Any(g => bg.Genre.Name.Contains(g))));

        return await GetConstrainedAsync<BookLinkDTO>(pageIndex, pageSize, sortDescending, sortBy, bookFilters, query);
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


    public async Task<List<BookLinkDTO>> GetBooksByAuthorAsync(string authorId, int count)
    {
        return await _dbSet.Where(b => b.BookAuthors.Any(ba => ba.AuthorId == authorId))
                           .AsNoTracking()
                           .Take(count)
                           .ProjectTo<BookLinkDTO>(_mapper.ConfigurationProvider)
                           .ToListAsync();
    }
    

    public async Task<List<BookLinkDTO>> GetBooksInGenreAsync(string genreId, int count)
    {
        return await _dbSet.Where(b => b.BookGenres.Any(bg => bg.GenreId == genreId))
                           .AsNoTracking()
                           .Take(count)
                           .ProjectTo<BookLinkDTO>(_mapper.ConfigurationProvider)
                           .ToListAsync();
    }

}
