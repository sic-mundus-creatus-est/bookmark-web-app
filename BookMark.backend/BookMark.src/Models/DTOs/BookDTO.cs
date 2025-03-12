using System.ComponentModel.DataAnnotations;
using BookMark.backend.Models.Relationships;

namespace BookMark.backend.DTOs;

public class BookCreateDTO
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = "";

    [Required]
    [MinLength(1)]
    [MaxLength(16)]
    public Dictionary<string, BookAuthorRole> AuthorsWithRoles { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string OriginalLanguage {get; set; } = "";

    [Range(0, int.MaxValue)]
    public int PublicationYear { get; set; } = 0;

    [Required]
    [Range(0, int.MaxValue)]
    public int PageCount { get; set; } = 0;

    [MaxLength(255)]
    public string? Genre { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }

    public string? ImageFile { get; set; }
}

public class BookUpdateDTO
{
    [MaxLength(255)]
    public string? Title { get; set; }

    [MaxLength(16)]
    public Dictionary<string, BookAuthorRole>? AuthorsWithRoles { get; set; }

    [MaxLength(255)]
    public string? OriginalLanguage {get; set; }

    [Range(0, int.MaxValue)]
    public int? PublicationYear { get; set; }

    [Range(0, int.MaxValue)]
    public int? PageCount { get; set; }

    [MaxLength(255)]
    public string? Genre { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }

    public string? CoverImage { get; set; }
}

public class BookAuthorDTO
{
    [Required]
    public string AuthorId { get; set; } = null!;
    [Required]
    public BookAuthorRole Role { get; set; }
}
