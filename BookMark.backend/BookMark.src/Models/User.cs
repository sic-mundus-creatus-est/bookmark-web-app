using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace BookMark.Models;
public class User : IdentityUser
{
    [Required]
    [PersonalData]
    public string FirstName { get; set; } = "";
    
    [Required]
    [PersonalData]
    public string LastName { get; set; } = "";

    [PersonalData]
    public string Country { get; set; } = "";
}
