using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

using BookMark.Models.Relationships;

namespace BookMark.Models.DTOs;

public class BookCreateDTO
{
    [Required]
    [MaxLength(256)]
    public string Title { get; set; } = null!;

    [Required]
    [Length(1, Controllers.BookController.MAX_BOOK_AUTHORS)]
    [SwaggerSchema("Array input with [FromForm] doesn't work in Swagger, test with Postman.")]
    public List<BookAddAuthorsDTO> AuthorsWithRoles { get; set; } = null!;

    [Required]
    [Length(1, Controllers.BookController.MAX_GENRES)]
    public List<string> GenreIds { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string OriginalLanguage {get; set; } = null!;

    [Required]
    [Range(0, int.MaxValue)]
    public int PageCount { get; set; } = 0;

    [Range(0, int.MaxValue)]
    public int PublicationYear { get; set; } = 0;

    [MaxLength(4000)]
    public string? Description { get; set; }

    public IFormFile? CoverImageFile { get; set; }
}

public class BookUpdateDTO
{
    [MaxLength(256)]
    public string? Title { get; set; }

    [MaxLength(64)]
    public string? OriginalLanguage {get; set; }

    [Range(0, int.MaxValue)]
    public int? PublicationYear { get; set; }

    [Range(0, int.MaxValue)]
    public int? PageCount { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }
}

public class BookAddAuthorsDTO
{
    [Required]
    public string AuthorId { get; set; } = null!;
    [Required]
    public BookAuthorRole Role { get; set; }
}

public class BookAutoIncludesDTO
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class BookResponseDTO
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string OriginalLanguage { get; set; } = null!;
    public int PageCount { get; set; }
    public int PublicationYear { get; set; }
    public string? Description { get; set; }
    public string? CoverImage { get; set; }
    public List<BookAutoIncludesDTO> Authors { get; set; } = null!;
    public List<BookAutoIncludesDTO> Genres { get; set; } = null!;
}
