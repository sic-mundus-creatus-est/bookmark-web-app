using System.ComponentModel.DataAnnotations;
using BookMark.Models.Domain;

namespace BookMark.Models.Relationships;
public class BookType : IModel
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = default!;

    public DateTime CreatedAt { get; init; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; }

    public ICollection<Book> Books { get; set; } = default!;

}
