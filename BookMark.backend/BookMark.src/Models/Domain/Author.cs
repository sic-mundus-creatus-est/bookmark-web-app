using System.ComponentModel.DataAnnotations;

using BookMark.Models.Relationships;

namespace BookMark.Models.Domain;

public class Author : IModel
{
    [Key]//______________________________________________________________
    public string Id { get; set; } = Guid.NewGuid().ToString();
    //___________________________________________________________________

    //MAIN_DATA__________________________________________________________
    public string Name { get; set; } = default!;
    public string? Biography { get; set; }
    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
    //____________________________________________________________________

    //AUDIT_INFO__________________________________________________________
    public DateTime CreatedAt { get; init; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; }
    //____________________________________________________________________

    //RELATIONSHIPS_______________________________________________________
    public ICollection<BookAuthor> Books { get; set; } = default!;
    //____________________________________________________________________

}
