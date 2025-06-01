using System.ComponentModel.DataAnnotations;
using BookMark.Models.DTOs;

namespace BookMark.Models.Domain;

public class Genre : IModel
{
    [Key]
    public string Id { get; private set; }

    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

// --------------------------------------------------------
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }
// --------------------------------------------------------
// --------------------------------------------------------
    public ICollection<BookGenre>? BookGenres { get; set; }
// --------------------------------------------------------

    public Genre()
    {
        Id = Guid.NewGuid().ToString();
        CreatedAt = DateTime.Now;
    }

#region MAPPING

    public void MapFrom(object source)
    {
        if(source is GenreCreateDTO creationData)
        {
            Name = creationData.Name;
            Description = creationData.Description;
        }
    }

    public void MapTo(object dest)
    {
        if(dest is GenreResponseDTO response)
        {
            response.Id = Id;
            response.Name = Name;
            response.Description = Description;
        }
    }

#endregion

}
