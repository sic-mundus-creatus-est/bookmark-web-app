using BookMark.Models.DTOs;
using BookMark.Models.Domain;
using BookMark.Models.Relationships;
using BookMark.Data.Repositories;
using System.Collections.ObjectModel;

namespace BookMark.Services.Domain;

public class BookService
{
    protected readonly IBaseRepository<Book> _repository;
    protected readonly IBaseRepository<BookType> _bookTypeRepository;
    protected readonly IBaseRepository<Author> _authorRepository;
    protected readonly IBaseRepository<Genre> _genreRepository;


    public BookService(BookRepository repository, AuthorRepository authorRepository, GenreRepository genreRepository, BookTypeRepository btRepository)
    {
        _repository = repository;
        _authorRepository = authorRepository;
        _genreRepository = genreRepository;
        _bookTypeRepository = btRepository;
    }


    public async Task<BookType> RetrieveBookType(string bookTypeId)
    {
        var bookType = await _bookTypeRepository.GetByIdAsync(bookTypeId, changeTracking: true);

        if (bookType == null)
            throw new ArgumentException($"BookType not found.");

        return bookType;
    }


    public async Task<ICollection<BookAuthor>> AssembleBookAuthors(Book book, List<string> authorIds)
    {

        authorIds = [.. authorIds.Distinct()];

        var authors = await _authorRepository.GetMultipleByIdsAsync(authorIds, changeTracking: true);

        var missingIds = authorIds.Except(authors.Select(a => a.Id)).ToList();

        if (missingIds.Any())
            throw new ArgumentException($"Not all authors found: {string.Join(", ", missingIds)}");

        var bookAuthors = authors.Select(author => new BookAuthor
        {
            Book = book,
            BookId = book.Id,
            Author = author,
            AuthorId = author.Id
        }).ToList();

        if (bookAuthors.Count == 0)
            throw new FormatException("No valid authors found.");

        return bookAuthors;
    }


    public async Task<ICollection<BookGenre>> AssembleBookGenres(Book book, List<string> genreIds)
    {
        genreIds = [.. genreIds.Distinct()];

        var genres = await _genreRepository.GetMultipleByIdsAsync(genreIds, changeTracking: true);

        var missingIds = genreIds.Except(genres.Select(a => a.Id)).ToList();

        if (missingIds.Any())
            throw new ArgumentException($"Not all genres found: {string.Join(", ", missingIds)}");

        var bookGenres = genres.Select(genre => new BookGenre
        {
            Book = book,
            BookId = book.Id,
            Genre = genre,
            GenreId = genre.Id
        }).ToList();

        if (bookGenres.Count == 0)
            throw new FormatException("No valid genres found.");

        return bookGenres;
    }
    
}
