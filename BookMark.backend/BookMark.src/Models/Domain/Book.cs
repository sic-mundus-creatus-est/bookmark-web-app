using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookMark.Models.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Models.Domain;

public class Book : IModel
{
    [Key]
    public string Id { get; private set; }

    public string Title { get; set; } = null!;

    public string OriginalLanguage { get; set; } = null!;

    public int PageCount { get; set; }

    public int PublicationYear { get; set; }

    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

// --------------------------------------------------------
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }
    // --------------------------------------------------------
    // --------------------------------------------------------
    [ForeignKey("BookTypeId")] // <--
    public string BookTypeId { get; set; } = null!;
    public BookType BookType { get; set; } = null!;
    // --------------------------------------------------------
    // --------------------------------------------------------
    public ICollection<BookAuthor> BookAuthors { get; set; } = [];
    public ICollection<BookGenre> BookGenres { get; set; } = [];
// --------------------------------------------------------

    public Book()
    {
        Id = Guid.NewGuid().ToString();
        CreatedAt = DateTime.Now;
    }

#region MAPPING

    public void MapFrom(object source)
    {
        if (source is BookCreateDTO creationData)
        {
            BookTypeId = creationData.BookTypeId;
            Title = creationData.Title;
            OriginalLanguage = creationData.OriginalLanguage;
            PageCount = creationData.PageCount;
            PublicationYear = creationData.PublicationYear;
            Description = creationData.Description;
        }
    }

    public void MapTo(object dest)
    {
        if (dest is BookResponseDTO response)
        {
            response.Id = Id;
            response.Title = Title;
            response.OriginalLanguage = OriginalLanguage;
            response.PageCount = PageCount;
            response.PublicationYear = PublicationYear;
            response.Description = Description;
            response.CoverImageUrl = CoverImageUrl;

            response.BookType = new BookTypeResponseDTO
            {
                Id = BookType.Id,
                Name = BookType.Name
            };

            foreach (var bookAuthor in BookAuthors)
            {
                response.Authors.Add(new BookAuthorResponseDTO
                {
                    Id = bookAuthor.Author.Id,
                    Name = bookAuthor.Author.Name,
                });
            }

            foreach (var bookGenre in BookGenres)
            {
                response.Genres.Add(new BookGenreResponseDTO
                {
                    Id = bookGenre.Genre.Id,
                    Name = bookGenre.Genre.Name
                });
            }
        }
    }

#endregion

}
