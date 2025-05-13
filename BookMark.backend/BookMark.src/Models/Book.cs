using System.ComponentModel.DataAnnotations;
using BookMark.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Models;

public class Book : IModel
{
    [Key]
    public string Id { get; private set; }

    public string Title { get; set; } = null!;

    public string OriginalLanguage { get; set; } = null!;

    public int PageCount { get; set; } = 0;

    public int PublicationYear { get; set; } = 0;

    public string? Genre { get; set; }

    public string? Description { get; set; }

    public string? CoverImage { get; set; }

// --------------------------------------------------------
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }
// --------------------------------------------------------
// --------------------------------------------------------
    public IList<BookAuthor>? BookAuthors { get; set; }
// --------------------------------------------------------

    public Book()
    {
        Id = Guid.NewGuid().ToString();
        CreatedAt = DateTime.Now;
    }

    public void MapFrom(object source)
    {
        if (source is BookCreateDTO creationData)
        {
            Title = creationData.Title;
            OriginalLanguage = creationData.OriginalLanguage;
            PageCount = creationData.PageCount;
            PublicationYear = creationData.PublicationYear;
            Genre = creationData.Genre;
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
            response.Genre = Genre;
            response.Description = Description;
            response.CoverImage = CoverImage;

            if (BookAuthors != null)
            {
                response.Authors ??= [];

                foreach (var bookAuthor in BookAuthors)
                {
                    var author = bookAuthor.Author;
                    if (author != null)
                    {
                        response.Authors.Add(new BookAuthorResponseDTO
                                            {
                                                Id = author.Id,
                                                FirstName = author.FirstName,
                                                LastName = author.LastName
                                            });
                    }
                    else throw new InvalidOperationException($"Book (ID: {Id}) contains a BookAuthor entry with a null Author. This may indicate corrupt or incomplete data.");
                }
            }
        }
    }
}
