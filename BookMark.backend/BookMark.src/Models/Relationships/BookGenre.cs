using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookMark.Models.Domain;

namespace BookMark.Models.Relationships;
public class BookGenre
{
    [Required]
    public string BookId { get; set; } = default!;
    [ForeignKey("BookId")]
    public Book Book { get; set; } = default!;

    [Required]
    public string GenreId { get; set; } = default!;
    [ForeignKey("GenreId")]
    public Genre Genre { get; set; } = default!;
}
