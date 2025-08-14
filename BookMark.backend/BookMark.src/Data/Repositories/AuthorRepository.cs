using BookMark.Models.Domain;
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
                                                                            nameof(Author.BirthDate),
                                                                            nameof(Author.DeathDate)
                                                                        };

    public AuthorRepository(AppDbContext context) : base(context) { _bookAuthorDbSet = context.Set<BookAuthor>(); }

}
