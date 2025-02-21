using System.ComponentModel.DataAnnotations;

namespace BookMark.backend.DTOs;

public class BookDTO : BaseDTO
{
    [MaxLength(255)]
    public string? Title { get; set; }

    public List<string>? Authors { get; set; }

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