using AutoMapper;
using AutoMapper.QueryableExtensions;
using BookMark.Models.Domain;
using BookMark.Models.DTOs;
using BookMark.Models.Relationships;
using Microsoft.EntityFrameworkCore;

namespace BookMark.Data.Repositories;

public class AuthorRepository : BaseRepository<Author>
{
    protected DbSet<BookAuthor> _bookAuthorDbSet { get; set; }
    protected DbSet<Book> _bookDbSet { get; set; }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Author.Name),
                                                                            nameof(Author.Biography),
                                                                            nameof(Author.BirthYear),
                                                                            nameof(Author.DeathYear)
                                                                        };

    public AuthorRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
        _bookAuthorDbSet = context.Set<BookAuthor>();
        _bookDbSet = context.Set<Book>();
    }

    public async Task<List<AuthorLinkDTO>> GetAuthorSuggestionsAsync(string searchTerm, List<string>? skipIds, int count)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return [];

        var query = _dbSet.AsQueryable();


        query = query.Where(a => a.Name.Contains(searchTerm));

        query = query.OrderByDescending(a => a.Name.StartsWith(searchTerm))
                .ThenBy(a => a.Name.IndexOf(searchTerm))
                .ThenBy(a => a.Name);


        if (skipIds != null && skipIds.Count > 0)
            query = query.Where(a => !skipIds.Contains(a.Id.ToString()));

        return await query.Take(count)
                          .ProjectTo<AuthorLinkDTO>(_mapper.ConfigurationProvider)
                          .ToListAsync();
    }

    public override async Task DeleteAsync(string authorId)
    {
        var bookIds = await _bookAuthorDbSet.Where(ba => ba.AuthorId == authorId)
                                            .Select(ba => ba.BookId)
                                            .ToListAsync();

        var authorToDelete = new Author { Id = authorId };
        _dbSet.Attach(authorToDelete);
        _dbSet.Remove(authorToDelete);

        // (Cascade delete will remove all BookAuthor rows for this author on SaveChanges)

        foreach (var bookId in bookIds)
        {
            bool hasOtherAuthors = await _bookAuthorDbSet.AnyAsync(ba => ba.BookId == bookId && ba.AuthorId != authorId);

            if (!hasOtherAuthors)
            {// removing books that end up with 0 authors
                var book = new Book { Id = bookId };
                _bookDbSet.Attach(book);
                _bookDbSet.Remove(book);
            }
        }

        await _context.SaveChangesAsync();
    }

}
