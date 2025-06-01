using BookMark.Models.Domain;

namespace BookMark.Data.Repositories;

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
