using System.ComponentModel.DataAnnotations;

namespace BookMark.Models.DTOs;

public class AuthorCreateDTO
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = null!;

    [MaxLength(4000)]
    public string? Biography { get; set; }

    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
}

public class AuthorUpdateDTO
{
    [MaxLength(255)]
    public string? Name { get; set; }

    [MaxLength(4000)]
    public string? Biography { get; set; }

    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
}

public class AuthorResponseDTO
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Biography { get; set; }
    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
}
