using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookMark.backend.Models;

public class BaseModel
{
    [Key]
    public string Id { get; private set; }
    [JsonIgnore]
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    [JsonIgnore]
    public DateTime UpdatedAt { get; set; }

    public BaseModel()
    {
        Id = Guid.NewGuid().ToString();
    }
}
