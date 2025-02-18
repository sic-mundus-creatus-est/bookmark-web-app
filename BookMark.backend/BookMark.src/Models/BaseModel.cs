using System.ComponentModel.DataAnnotations;

namespace BookMark.backend.Models;

public class BaseModel
{
    [Key]
    public string Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public BaseModel()
    {
        Id = Guid.NewGuid().ToString();
    }
}
