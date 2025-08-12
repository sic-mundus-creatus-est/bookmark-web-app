using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookMark.Models.Domain;

namespace BookMark.Models.Relationships;

public class BookAuthor
{
    [Required]
    public string BookId { get; set; } = null!;
    [ForeignKey("BookId")]
    public Book Book { get; set; } = null!;

    [Required]
    public string AuthorId { get; set; } = null!;
    [ForeignKey("AuthorId")]
    public Author Author { get; set; } = null!;
}
