using System.ComponentModel.DataAnnotations;
using BookMark.backend.Models.Relationships;
using Swashbuckle.AspNetCore.Annotations;

namespace BookMark.backend.DTOs;

public class BookCreateDTO
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = "";

    [Required]
    [MaxLength(16)]
    [SwaggerSchema("Array input with [FromForm] doesn't work in Swagger, test with Postman.")]
    public List<BookAuthorDTO> AuthorsWithRoles { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string OriginalLanguage {get; set; } = "";

    [Required]
    [Range(0, int.MaxValue)]
    public int PageCount { get; set; } = 0;

    [Range(0, int.MaxValue)]
    public int PublicationYear { get; set; } = 0;

    [MaxLength(255)]
    public string? Genre { get; set; } // TODO: Turn into an array of type Genre to correctly store in the db...

    [MaxLength(4000)]
    public string? Description { get; set; }

    public IFormFile? CoverImageFile { get; set; }
}

public class BookUpdateDTO
{
    [MaxLength(255)]
    public string? Title { get; set; }

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
}

public class BookAuthorDTO
{
    [Required]
    public string AuthorId { get; set; } = null!;
    [Required]
    public BookAuthorRole Role { get; set; }
}
