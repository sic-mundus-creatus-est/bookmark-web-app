using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace BookMark.Models.DTOs;
public record BookCreateDTO
{
    [Required]
    public required string BookTypeId { get; init; }

    [Required]
    [MaxLength(256)]
    public required string Title { get; init; }

    [Required]
    [Length(1, Controllers.BookController.MAX_BOOK_AUTHORS)]
    [SwaggerSchema("Array input with [FromForm] doesn't work in Swagger, test with Postman.")]
    public required List<string> AuthorIds { get; init; }

    [Required]
    [Length(1, Controllers.BookController.MAX_BOOK_GENRES)]
    public required List<string> GenreIds { get; init; }

    [Required]
    [MaxLength(64)]
    public required string OriginalLanguage { get; init; }

    [Required]
    [Range(1, int.MaxValue)]
    public required int PageCount { get; init; }

    [Range(1, int.MaxValue)]
    public required int PublicationYear { get; init; }

    [MaxLength(4000)]
    public string? Description { get; init; }

    public IFormFile? CoverImageFile { get; init; }
}

public record BookUpdateDTO
{
    public string? BookTypeId { get; init; }

    [MaxLength(256)]
    public string? Title { get; init; }

    [MaxLength(64)]
    public string? OriginalLanguage { get; init; }

    [Range(0, int.MaxValue)]
    public int? PublicationYear { get; init; }

    [Range(0, int.MaxValue)]
    public int? PageCount { get; init; }

    [MaxLength(4000)]
    public string? Description { get; init; }
}

public record BookResponseDTO
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string OriginalLanguage { get; init; }
    public required int PageCount { get; init; }
    public required int PublicationYear { get; init; }
    public string? Description { get; init; }
    public string? CoverImageUrl { get; init; }
    public required BookTypeResponseDTO BookType { get; init; }
    public required List<BookAuthorResponseDTO> Authors { get; init; }
    public required List<BookGenreResponseDTO> Genres { get; init; }
}


public record BookLinkDTO
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public string? CoverImageUrl { get; init; }
    public required List<BookAuthorResponseDTO> Authors { get; init; }
}


public record BookTypeCreateUpdateDTO
{
    [Required]
    public required string Name { get; init; }
}

public record BookTypeResponseDTO
{
    public required string Id { get; init; }
    public required string Name { get; init; }
}

public record BookGenreResponseDTO
{
    public required string Id { get; init; }
    public required string Name { get; init; }
}

public record BookAuthorResponseDTO
{
    public required string Id { get; init; }
    public required string Name { get; init; }
}
