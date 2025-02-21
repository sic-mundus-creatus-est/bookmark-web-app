using System.ComponentModel.DataAnnotations;

namespace BookMark.backend.DTOs;

public class BaseDTO
{
    [Required]
    public required string Id {get; set;}
}