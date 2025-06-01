using BookMark.Models.DTOs;
using BookMark.Models.Domain;
using BookMark.Models.Relationships;
using BookMark.Data.Repositories;
using System.Collections.ObjectModel;

namespace BookMark.Services.Domain;

public class BookService
{
    protected readonly IBaseRepository<Book> _repository;
    protected readonly IBaseRepository<Author> _authorRepository;
    protected readonly IBaseRepository<Genre> _genreRepository;


    public BookService(BookRepository repository, AuthorRepository authorRepository, GenreRepository genreRepository)
    {
        _repository = repository;
        _authorRepository = authorRepository;
        _genreRepository = genreRepository;
    }


    public async Task<ICollection<BookAuthor>> AssembleBookAuthors(Book book, List<BookAddAuthorsDTO> authorsWithRoles)
    {
        var bookAuthors = new Collection<BookAuthor>();

        authorsWithRoles = [.. authorsWithRoles.DistinctBy(x => x.AuthorId)];
        foreach (var aWr in authorsWithRoles)
        {
            var author = await _authorRepository.GetTrackedByIdAsync(aWr.AuthorId);
            if (author == null)
                throw new ArgumentException($"Author with ID '{aWr.AuthorId}' not found!" +
                    " Cannot proceed with the operation unless all specified authors exist.");

            if (!Enum.IsDefined(typeof(BookAuthorRole), aWr.Role))
                throw new ArgumentOutOfRangeException(nameof(aWr.Role), aWr.Role, $"Invalid role '{aWr.Role}' for author ID '{aWr.AuthorId}'." +
                                                                                                    " All authors must have an existing role.");

            bookAuthors.Add(new BookAuthor
            {
                Book = book,
                BookId = book.Id,
                Author = author,
                AuthorId = author.Id,
                Role = aWr.Role
            });
        }

        if (bookAuthors.Count == 0)
            throw new FormatException("No valid authors found. Please ensure the authors are being submitted in the correct format.");

        return bookAuthors;
    }

    public async Task<ICollection<BookGenre>> AssembleBookGenres(Book book, List<string> genreIds)
    {
        var bookGenres = new Collection<BookGenre>();

        genreIds = [.. genreIds.Distinct()];

        foreach (var g in genreIds)
        {
            var genre = await _genreRepository.GetTrackedByIdAsync(g);
            if (genre == null)
                throw new ArgumentException($"Genre with ID '{g}' not found!" +
                    " Cannot proceed with the operation unless all specified genres exist.");

            bookGenres.Add(new BookGenre
            {
                Book = book,
                BookId = book.Id,
                Genre = genre,
                GenreId = genre.Id
            });
        }

        if (bookGenres.Count == 0)
                throw new FormatException("No valid genres found. Unable to continue.");

        return bookGenres;
    }
    
}
