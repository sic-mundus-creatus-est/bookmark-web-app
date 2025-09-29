using System.ComponentModel.DataAnnotations.Schema;

using BookMark.Models.Domain;

namespace BookMark.Models.Relationships;
public class BookReview
{
    public int? Rating { get; set; }
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public string UserId { get; set; } = default!;
    [ForeignKey("UserId")]
    public User User { get; set; } = default!;

    public string BookId { get; set; } = default!;
    [ForeignKey("BookId")]
    public Book Book { get; set; } = default!;
    
}
