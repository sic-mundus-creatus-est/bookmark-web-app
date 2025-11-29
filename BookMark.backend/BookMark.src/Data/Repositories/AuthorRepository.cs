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
        // Query 1: Getting all books connected to this author
        var bookIds = await _bookAuthorDbSet.Where(ba => ba.AuthorId == authorId)
                                            .Select(ba => ba.BookId)
                                            .ToListAsync();

        // Delete the author (BookAuthor join rows will cascade-delete)
        _dbSet.Remove(new Author { Id = authorId });

        if (bookIds.Count > 0)
        {
            // Query 2: Books that still have other authors
            var booksWithOtherAuthors = await _bookAuthorDbSet
                .Where(ba => bookIds.Contains(ba.BookId) && ba.AuthorId != authorId)
                .Select(ba => ba.BookId)
                .Distinct()
                .ToListAsync();

            // Books that became orphaned = no remaining authors
            var orphanedBookIds = bookIds
                .Except(booksWithOtherAuthors)
                .ToList();

            // deleting orphaned books
            foreach (var bookId in orphanedBookIds)
            {
                _bookDbSet.Remove(new Book { Id = bookId });
            }
        }

        await _context.SaveChangesAsync();
    }

}
