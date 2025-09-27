using AutoMapper;
using BookMark.Models.Domain;
using BookMark.Models.Relationships;
using Microsoft.EntityFrameworkCore;

namespace BookMark.Data.Repositories;

public class GenreRepository : BaseRepository<Genre>
{
    protected DbSet<BookAuthor> _bookAuthorDbSet { get; set; }
    public GenreRepository(AppDbContext context, IMapper mapper) : base(context, mapper)
    {
        _bookAuthorDbSet = context.Set<BookAuthor>();
    }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Genre.Name),
                                                                            nameof(Genre.Description)
                                                                        };


    public async Task<List<Genre>> GetGenresByAuthorAsync(string authorId)
    {
        return await _bookAuthorDbSet.Where(ba => ba.AuthorId == authorId)
                                     .SelectMany(ba => ba.Book.BookGenres.Select(bg => bg.Genre))
                                     .Distinct()
                                     .ToListAsync();
    }
    
}
