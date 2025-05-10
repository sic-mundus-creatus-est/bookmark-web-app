using System.ComponentModel.DataAnnotations;
using BookMark.Models.Relationships;
using Swashbuckle.AspNetCore.Annotations;

namespace BookMark.DTOs;

public class BookCreateDTO
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = "";

    [Required]
    [Length(1, Controllers.BookController.MAX_BOOK_AUTHORS)]
    [SwaggerSchema("Array input with [FromForm] doesn't work in Swagger, test with Postman.")]
    public List<BookAddAuthorsDTO> AuthorsWithRoles { get; set; } = null!;

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

public class BookAddAuthorsDTO
{
    [Required]
    public string AuthorId { get; set; } = null!;
    [Required]
    public BookAuthorRole Role { get; set; }
}

public class BookResponseDTO
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string OriginalLanguage {get; set; } = null!;
    public int PageCount { get; set; }
    public int PublicationYear { get; set; } 
    public string? Genre { get; set; }
    public string? Description { get; set; }
    public string? CoverImage { get; set; }
}
