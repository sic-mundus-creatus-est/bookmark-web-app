using BookMark.Models.Relationships;

namespace BookMark.Services.Domain;

public class BookService
{
    public BookService() { }

    private static ICollection<TJoin> AssembleJoins<TJoin>(string bookId, List<string> relatedEntityIds, Func<string, string, TJoin> factory)
    {
        relatedEntityIds = [.. relatedEntityIds.Distinct()];

        return relatedEntityIds.Select(id => factory(bookId, id)).ToList();
    }


    public ICollection<BookAuthor> AssembleBookAuthors(string bookId, List<string> authorIds) =>
        AssembleJoins(bookId, authorIds, (bId, aId) => new BookAuthor { BookId = bId, AuthorId = aId });

    public ICollection<BookGenre> AssembleBookGenres(string bookId, List<string> genreIds) =>
        AssembleJoins(bookId, genreIds, (bId, gId) => new BookGenre { BookId = bId, GenreId = gId });

}
