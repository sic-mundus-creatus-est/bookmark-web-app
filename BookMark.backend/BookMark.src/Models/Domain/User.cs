using Microsoft.AspNetCore.Identity;

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

}
