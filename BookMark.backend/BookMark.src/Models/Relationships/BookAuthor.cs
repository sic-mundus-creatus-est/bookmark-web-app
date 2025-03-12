using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;

namespace BookMark.backend.Models.Relationships;

public enum BookAuthorRole
{
    [EnumMember(Value = "Author")]
    FullStackAuthor, // Someone who did everything
    [EnumMember(Value = "Writer")]
    Writer,
    [EnumMember(Value = "Penciler")]
    Penciler,
    [EnumMember(Value = "Inker")]
    Inker,
    [EnumMember(Value = "Colorist")]
    Colorist
}

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

    [Required]
    public BookAuthorRole Role { get; set; }
}
