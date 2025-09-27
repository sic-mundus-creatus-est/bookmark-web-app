using System.ComponentModel.DataAnnotations;

using BookMark.Models.Relationships;

namespace BookMark.Models.Domain;
public class Genre : IModel
{
    [Key]//_______________________________________________________________
    public string Id { get; set; } = Guid.NewGuid().ToString();
    //____________________________________________________________________

    //MAIN_DATA___________________________________________________________
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    //____________________________________________________________________

    //AUDIT_INFO__________________________________________________________
    public DateTime CreatedAt { get; init; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; }
    //____________________________________________________________________

    //RELATIONSHIPS_______________________________________________________
    public ICollection<BookGenre> BookGenres { get; set; } = default!;
    //____________________________________________________________________

}
