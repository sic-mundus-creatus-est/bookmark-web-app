using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using BookMark.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Models;

public class Book : IBaseModel
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
    [JsonIgnore]
    public DateTime CreatedAt { get; private set; }
    [JsonIgnore]
    public DateTime UpdatedAt { get; set; }
// --------------------------------------------------------
// --------------------------------------------------------
    [JsonIgnore]
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
        }
    }
}
