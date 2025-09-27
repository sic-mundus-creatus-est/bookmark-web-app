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

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Author.Name),
                                                                            nameof(Author.Biography),
                                                                            nameof(Author.BirthYear),
                                                                            nameof(Author.DeathYear)
                                                                        };

    public AuthorRepository(AppDbContext context, IMapper mapper) : base(context, mapper) { _bookAuthorDbSet = context.Set<BookAuthor>(); }

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
                          .ProjectTo<AuthorLinkDTO>(_mapper.ConfigurationProvider).ToListAsync();
    }

}
