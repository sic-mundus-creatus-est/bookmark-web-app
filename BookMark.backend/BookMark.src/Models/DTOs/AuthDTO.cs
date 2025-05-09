using System.ComponentModel.DataAnnotations;

namespace BookMark.DTOs.Auth;

public class RegisterUserDTO
{
    [Required]
    public string Username { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";

    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; } = "";

    [Required]
    [DataType(DataType.Text)]
    public string FirstName { get; set; } = "";

    [Required]
    [DataType(DataType.Text)]
    public string LastName { get; set; } = "";

    [DataType(DataType.Text)]
    public string Country { get; set; } = "N/A";
}

public class LoginUserDTO
{
    [Required]
    public string UsernameOrEmail { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}
