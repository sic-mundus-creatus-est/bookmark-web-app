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


    public async Task<ICollection<BookAuthor>> AssembleBookAuthors(Book book, List<string> authorIds)
    {
        var bookAuthors = new Collection<BookAuthor>();

        authorIds = [.. authorIds.Distinct()];
        foreach (var a in authorIds)
        {
            var author = await _authorRepository.GetTrackedByIdAsync(a);
            if (author == null)
                throw new ArgumentException($"Author with ID '{a}' not found!" +
                    " Cannot proceed with the operation unless all specified authors exist.");

            bookAuthors.Add(new BookAuthor
            {
                Book = book,
                BookId = book.Id,
                Author = author,
                AuthorId = author.Id,
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
