using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookMark.Models;

public abstract class BaseModel
{
    [Key]
    public string Id { get; private set; }
    [JsonIgnore]
    public DateTime CreatedAt { get; private set; }
    [JsonIgnore]
    public DateTime UpdatedAt { get; set; }

    public BaseModel()
    {
        Id = Guid.NewGuid().ToString();
        CreatedAt = DateTime.Now;
    }

    public abstract void MapFrom(object source);
}
