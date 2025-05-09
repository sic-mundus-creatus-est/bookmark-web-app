using BookMark.Data;
using BookMark.Models;

namespace BookMark.Services.Repositories;

public class AuthorRepository : BaseRepository<Author>
{
    public AuthorRepository(AppDbContext context) : base(context) { }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Author.FirstName), 
                                                                            nameof(Author.LastName), 
                                                                            nameof(Author.Career)
                                                                        };
}
