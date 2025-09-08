using System.ComponentModel.DataAnnotations;

using BookMark.Models.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Models.Domain;

public class Author : IModel
{
    [Key]
    public string Id { get; private set; }

    public string Name { get; set; } = null!;

    public string? Biography { get; set; }

    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }

// --------------------------------------------------------
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }
    // --------------------------------------------------------
    // --------------------------------------------------------
    public ICollection<BookAuthor> BookAuthors { get; set; } = [];
// --------------------------------------------------------

    public Author()
    {
        Id = Guid.NewGuid().ToString();
        CreatedAt = DateTime.Now;
    }

#region MAPPING

    public void MapFrom(object source)
    {
        if (source is AuthorCreateDTO creationData)
        {
            Name = creationData.Name;
            Biography = creationData.Biography;
            BirthYear = creationData.BirthYear;
            DeathYear = creationData.DeathYear;
        }
    }

    public void MapTo(object dest)
    {
        if (dest is AuthorResponseDTO response)
        {
            response.Id = Id;
            response.Name = Name;
            response.Biography = Biography;
            response.BirthYear = BirthYear;
            response.DeathYear = DeathYear;
        }
    }

#endregion

}
