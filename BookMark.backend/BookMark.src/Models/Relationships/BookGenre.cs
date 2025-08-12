using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookMark.Models.Domain;

namespace BookMark.Models.Relationships;

public class BookGenre
{
    [Required]
    public string BookId { get; set; } = null!;
    [ForeignKey("BookId")]
    public Book Book { get; set; } = null!;

    [Required]
    public string GenreId { get; set; } = null!;
    [ForeignKey("GenreId")]
    public Genre Genre { get; set; } = null!;
}
