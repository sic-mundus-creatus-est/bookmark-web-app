using BookMark.Data;
using BookMark.Models;

namespace BookMark.Services.Repositories;

public class UserRepository : BaseRepository<User>
{
    public UserRepository(AppDbContext context) : base(context) { }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(User.FirstName), 
                                                                            nameof(User.LastName), 
                                                                            nameof(User.Country)
                                                                        };
}
