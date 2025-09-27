using AutoMapper;
using BookMark.Models.Domain;

namespace BookMark.Data.Repositories;

public class UserRepository : BaseRepository<User>
{
    public UserRepository(AppDbContext context, IMapper mapper) : base(context, mapper) { }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(User.DisplayName), 
                                                                        };
}
