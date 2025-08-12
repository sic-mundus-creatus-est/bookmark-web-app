using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace BookMark.Models.DTOs;

public class BookCreateDTO
{
    [Required]
    public string BookTypeId { get; set; } = null!;

    [Required]
    [MaxLength(256)]
    public string Title { get; set; } = null!;

    [Required]
    [Length(1, Controllers.BookController.MAX_BOOK_AUTHORS)]
    [SwaggerSchema("Array input with [FromForm] doesn't work in Swagger, test with Postman.")]
    public List<string> AuthorIds { get; set; } = null!;

    [Required]
    [Length(1, Controllers.BookController.MAX_BOOK_GENRES)]
    public List<string> GenreIds { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string OriginalLanguage { get; set; } = null!;

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
    public string? BookTypeId { get; set; }

    [MaxLength(256)]
    public string? Title { get; set; }

    [MaxLength(64)]
    public string? OriginalLanguage { get; set; }

    [Range(0, int.MaxValue)]
    public int? PublicationYear { get; set; }

    [Range(0, int.MaxValue)]
    public int? PageCount { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }
}

public class BookTypeDTO
{
    [Required]
    public string Name { get; set; } = null!;
}

public class BookTypeResponseDTO
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class BookGenreResponseDTO
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class BookAuthorResponseDTO
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
    public string? CoverImageUrl { get; set; }
    public BookTypeResponseDTO BookType { get; set; } = null!;
    public List<BookAuthorResponseDTO> Authors { get; set; } = [];
    public List<BookGenreResponseDTO> Genres { get; set; } = [];
}
