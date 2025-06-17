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

    public DateOnly? BirthDate { get; set; }
    public DateOnly? DeathDate { get; set; }

// --------------------------------------------------------
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }
// --------------------------------------------------------
// --------------------------------------------------------
    public ICollection<BookAuthor>? BookAuthors { get; set; }
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
            BirthDate = creationData.BirthDate;
            DeathDate = creationData.DeathDate;
        }
    }

    public void MapTo(object dest)
    {
        if (dest is AuthorResponseDTO response)
        {
            response.Id = Id;
            response.Name = Name;
            response.Biography = Biography;
            response.BirthDate = BirthDate;
            response.DeathDate = DeathDate;
        }
    }

#endregion

}
