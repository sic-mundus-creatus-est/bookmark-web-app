using System.ComponentModel.DataAnnotations;

namespace BookMark.DTOs;

public class AuthorCreateDTO
{
    [Required]
    [MaxLength(255)]
    public string FirstName { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string LastName { get; set; } = null!;

    [MaxLength(4000)]
    public string? Career { get; set; }
}

public class AuthorUpdateDTO
{
    [MaxLength(255)]
    public string? FirstName { get; set; }

    [MaxLength(255)]
    public string? LastName { get; set; }

    [MaxLength(4000)]
    public string? Career { get; set; }
}

public class AuthorResponseDTO
{
    public string Id { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Career { get; set; }
}
