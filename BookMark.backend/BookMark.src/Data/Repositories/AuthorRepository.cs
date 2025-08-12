using BookMark.Models.Domain;
using BookMark.Models.DTOs;
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

    public async Task<List<BookGenreResponseDTO>> GetAuthorBookGenresAsync(string authorId)
    {
        var genres = await _bookAuthorDbSet
            .Where(ba => ba.AuthorId == authorId)
            .SelectMany(ba => ba.Book.BookGenres.Select(bg => bg.Genre))
            .Distinct()
            .Select(g => new BookGenreResponseDTO
            {
                Id = g.Id,
                Name = g.Name
            })
            .ToListAsync();

        return genres;
    }

    public async Task<List<Book>> GetAuthorBooksAsync(string authorId, int count)
    {
        var books = await _bookAuthorDbSet
            .Where(ba => ba.AuthorId == authorId)
            .Select(ba => ba.Book)
            .Distinct()
            .Take(count)
            .ToListAsync();

        return books;
    }
    
}
