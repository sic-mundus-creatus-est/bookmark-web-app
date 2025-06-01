using BookMark.Models.Domain;

namespace BookMark.Data.Repositories;

public class GenreRepository : BaseRepository<Genre>
{
    public GenreRepository(AppDbContext context) : base(context) { }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Genre.Name),
                                                                            nameof(Genre.Description)
                                                                        };
}