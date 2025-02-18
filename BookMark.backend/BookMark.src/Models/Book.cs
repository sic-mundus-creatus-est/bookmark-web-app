using System.ComponentModel.DataAnnotations;

namespace BookMark.backend.Models;

public class Book : BaseModel
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = "";

    [Required]
    [MinLength(1)]
    public List<string> Authors { get; set; } = new List<string>();

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
}
