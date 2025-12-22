using System.ComponentModel.DataAnnotations;

namespace BookMark.Models.DTOs;
public record GenreCreateDTO
{
    [Required]
    [MaxLength(255)]
    public required string Name { get; init; }

    [MaxLength(4000)]
    public string? Description { get; init; }

}

public record GenreUpdateDTO
{
    [MaxLength(255)]
    public string? Name { get; init; }

    [MaxLength(4000)]
    public string? Description { get; init; }

}

public record GenreResponseDTO
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
}

public record GenreLinkDTO
{
    public required string Id { get; init; }
    public required string Name { get; init; }
}
