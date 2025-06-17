using BookMark.Models.Domain;

namespace BookMark.Data.Repositories;

public class AuthorRepository : BaseRepository<Author>
{
    public AuthorRepository(AppDbContext context) : base(context) { }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Author.Name),
                                                                            nameof(Author.Biography),
                                                                            nameof(Author.BirthDate),
                                                                            nameof(Author.DeathDate)
                                                                        };
}
