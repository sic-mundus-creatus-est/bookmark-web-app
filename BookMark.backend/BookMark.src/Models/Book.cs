using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using BookMark.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Models;

public class Book : BaseModel
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = "";

    [Required]
    [MaxLength(255)]
    public string OriginalLanguage {get; set; } = "";

    [Range(0, int.MaxValue)]
    public int PublicationYear { get; set; } = 0;

    [Required]
    [Range(0, int.MaxValue)]
    public int PageCount { get; set; }

    [MaxLength(255)]
    public string? Genre { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }

    public string? CoverImage { get; set; }

    [JsonIgnore]
    public IList<BookAuthor>? BookAuthors { get; set; }

    public override void MapFrom(object source)
    {
        if (source is BookCreateDTO bookCreateDTO)
        {
            Title = bookCreateDTO.Title;
            OriginalLanguage = bookCreateDTO.OriginalLanguage;
            PublicationYear = bookCreateDTO.PublicationYear;
            PageCount = bookCreateDTO.PageCount;
            Genre = bookCreateDTO.Genre;
            Description = bookCreateDTO.Description;
        }
    }
}
