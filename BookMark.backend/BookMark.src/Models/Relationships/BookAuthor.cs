using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookMark.Models.Domain;

namespace BookMark.Models.Relationships;
public class BookAuthor
{
    [Required]
    public string BookId { get; set; } = default!;
    [ForeignKey("BookId")]
    public Book Book { get; set; } = default!;

    [Required]
    public string AuthorId { get; set; } = default!;
    [ForeignKey("AuthorId")]
    public Author Author { get; set; } = default!;
}
