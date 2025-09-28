using Microsoft.AspNetCore.Identity;

using BookMark.Models.Relationships;

namespace BookMark.Models.Domain;

public class User : IdentityUser, IModel
{
    //MAIN_DATA___________________________________________________________
    [PersonalData]
    public string DisplayName { get; set; } = default!;
    [PersonalData]
    public string? AboutMe { get; set; }
    //____________________________________________________________________

    //AUDIT_INFO__________________________________________________________
    public DateTime CreatedAt { get; init; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; }
    //____________________________________________________________________

    //RELATIONSHIPS_______________________________________________________
    public ICollection<BookReview> Reviews { get; set; } = default!;
    //____________________________________________________________________

}
