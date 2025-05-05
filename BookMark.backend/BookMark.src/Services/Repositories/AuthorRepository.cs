using BookMark.backend.Data;
using BookMark.backend.Models;

namespace BookMark.backend.Services.Repositories;

public class AuthorRepository : BaseRepository<Author>
{
    public AuthorRepository(DataContext context) : base(context) { }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(Author.FirstName), 
                                                                            nameof(Author.LastName), 
                                                                            nameof(Author.Career)
                                                                        };
}
