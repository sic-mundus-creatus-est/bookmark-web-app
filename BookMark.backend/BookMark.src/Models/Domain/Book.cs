using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using BookMark.Models.Relationships;

namespace BookMark.Models.Domain;
public class Book : IModel
{
    [Key]//______________________________________________________________
    public string Id { get; set; } = Guid.NewGuid().ToString();
    //___________________________________________________________________

    //MAIN_DATA__________________________________________________________
    public string Title { get; set; } = default!;
    public string OriginalLanguage { get; set; } = default!;
    public int PageCount { get; set; } = default!;
    public int PublicationYear { get; set; }  = default!;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    //____________________________________________________________________

    //AUDIT_INFO__________________________________________________________
    public DateTime CreatedAt { get; init; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; }
    //____________________________________________________________________

    //RELATIONSHIPS_______________________________________________________
    [ForeignKey("BookTypeId")] // <--
    public string BookTypeId { get; set; } = default!;
    public BookType BookType { get; set; } = default!;
    public ICollection<BookAuthor> BookAuthors { get; set; } = default!;
    public ICollection<BookGenre> BookGenres { get; set; } = default!;
    //____________________________________________________________________

}
