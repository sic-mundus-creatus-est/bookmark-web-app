using System.ComponentModel.DataAnnotations;

namespace BookMark.Models.DTOs;

public class GenreCreateDTO
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = null!;

    [MaxLength(4000)]
    public string? Description { get; set; }

}

public class GenreUpdateDTO
{
    [MaxLength(255)]
    public string? Name { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }

}

public class GenreResponseDTO
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    
}
