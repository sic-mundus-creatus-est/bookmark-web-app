using System.ComponentModel.DataAnnotations;

namespace BookMark.Models.DTOs;
public record UserCreateDTO
{
    [Required]
    [Length(1, 32)]
    public required string Username { get; init; }

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public required string Email { get; init; }

    [Required]
    public required string Password { get; init; }

    [Required]
    [Compare(nameof(Password), ErrorMessage = "The password and confirmation password do not match.")]
    public required string ConfirmPassword { get; init; }

    [Required]
    [MaxLength(64)]
    public required string DisplayName { get; init; }
}

public record UserCredentialsDTO
{
    [Required]
    public required string UsernameOrEmail { get; init; }

    [Required]
    public required string Password { get; init; }
}

public record UserUpdateDTO
{
    [MaxLength(64)]
    public string? DisplayName { get; init; }
    [MaxLength(4000)]
    public string? AboutMe { get; init; }
}

public record UserResponseDTO
{
    public required string Id { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public string? AboutMe { get; init; }
}

public record UserLinkDTO
{
    public required string Id { get; init; }
    public required string Username { get; init; }
    public required string DisplayName { get; init; }
}
