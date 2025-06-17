using System.ComponentModel.DataAnnotations;

namespace BookMark.Models.DTOs;

public class UserCreateDTO
{
    [Required]
    [Length(1, 32)]
    public string Username { get; set; } = null!;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;

    [Required]
    [Compare(nameof(Password), ErrorMessage = "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string DisplayName { get; set; } = null!;

    [MaxLength(64)]
    public string? Country { get; set; }
}

public class UserLoginDTO
{
    [Required]
    public string UsernameOrEmail { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}

public class UserUpdateDTO
{
    [MaxLength(64)]
    public string? DisplayName { get; set; }

    [MaxLength(64)]
    public string? Country { get; set; }
}

public class UserResponseDTO
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? Country { get; set; }
}
