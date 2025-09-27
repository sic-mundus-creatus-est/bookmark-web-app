using System.ComponentModel.DataAnnotations;

namespace BookMark.Models.DTOs;
public record AuthorCreateDTO
{
    [Required]
    [MaxLength(255)]
    public required string Name { get; init; }

    [MaxLength(4000)]
    public string? Biography { get; init; }

    public int? BirthYear { get; init; }
    public int? DeathYear { get; init; }
}

public record AuthorUpdateDTO
{
    [MaxLength(255)]
    public string? Name { get; init; }

    [MaxLength(4000)]
    public string? Biography { get; init; }

    public int? BirthYear { get; init; }
    public int? DeathYear { get; init; }
}

public record AuthorResponseDTO
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public string? Biography { get; init; }
    public int? BirthYear { get; init; }
    public int? DeathYear { get; init; }
}

public record AuthorLinkDTO
{
    public required string Id { get; init; }
    public required string Name { get; init; }
}
