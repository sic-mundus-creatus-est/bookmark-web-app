using System.Text.Json.Serialization;
using BookMark.DTOs;
using Microsoft.AspNetCore.Identity;

namespace BookMark.Models;
public class User : IdentityUser, IBaseModel
{
    [PersonalData]
    public string FirstName { get; set; } = null!;
    
    [PersonalData]
    public string LastName { get; set; } = null!;

    [PersonalData]
    public string? Country { get; set; }

// --------------------------------------------------------
    [JsonIgnore]
    public DateTime CreatedAt { get; private set; }
    [JsonIgnore]
    public DateTime UpdatedAt { get; set; }
// --------------------------------------------------------

    public User() : base()
    {
        CreatedAt = DateTime.Now;
    }

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
}
