using AutoMapper;
using BookMark.Models.Relationships;

namespace BookMark.Data.Repositories;

public class BookTypeRepository : BaseRepository<BookType>
{
    public BookTypeRepository(AppDbContext context, IMapper mapper) : base(context, mapper) { }

    protected override IReadOnlySet<string> AllowedFilterProps { get; } = new HashSet<string>()
                                                                        {
                                                                            nameof(BookType.Name),
                                                                        };
}
