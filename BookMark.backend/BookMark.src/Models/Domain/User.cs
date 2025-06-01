using Microsoft.AspNetCore.Identity;

using BookMark.Models.DTOs;

namespace BookMark.Models.Domain;

public class User : IdentityUser, IModel
{
    [PersonalData]
    public string FirstName { get; set; } = null!;
    
    [PersonalData]
    public string LastName { get; set; } = null!;

    [PersonalData]
    public string? Country { get; set; }

// --------------------------------------------------------
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }
// --------------------------------------------------------

    public User() : base()
    {
        CreatedAt = DateTime.Now;
    }

#region MAPPING

    public void MapFrom(object source)
    {
        if(source is UserCreateDTO creationData)
        {
            UserName = creationData.Username;
            Email = creationData.Email;
            FirstName = creationData.FirstName;
            LastName = creationData.LastName;
            Country = creationData.Country;
            SecurityStamp = Guid.NewGuid().ToString();
        }
    }

    public void MapTo(object dest)
    {
        if(dest is UserResponseDTO response)
        {
            response.Id = Id;
            response.Username = UserName!;
            response.Email = Email!;
            response.FirstName = FirstName;
            response.LastName = LastName;
            response.Country = Country;
        }
    }

#endregion

}
