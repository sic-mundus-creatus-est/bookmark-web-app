using BookMark.Models.Domain;
using BookMark.Models.Relationships;
using Microsoft.EntityFrameworkCore;

namespace BookMark.Data.Repositories;

public class GenreRepository : BaseRepository<Genre>
{
    protected DbSet<BookGenre> _bookGenreDbSet { get; set; }
    public GenreRepository(AppDbContext context) : base(context) { _bookGenreDbSet = context.Set<BookGenre>(); }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Genre.Name),
                                                                            nameof(Genre.Description)
                                                                        };


    public async Task<List<Book>> GetBooksWithGenreAsync(string genreId, int count)
    {
        return await _bookGenreDbSet
            .Where(bg => bg.GenreId == genreId)
            .Select(bg => bg.Book)
            .Distinct()
            .Take(count)
            .ToListAsync();
    }
}
