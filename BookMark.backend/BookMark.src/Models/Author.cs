using System.ComponentModel.DataAnnotations;
using BookMark.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Models;

public class Author : IModel
{
    [Key]
    public string Id { get; private set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? Career { get; set; }

// --------------------------------------------------------
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }
// --------------------------------------------------------
// --------------------------------------------------------
    public IList<BookAuthor>? BookAuthors { get; set; }
// --------------------------------------------------------

    public Author()
    {
        Id = Guid.NewGuid().ToString();
        CreatedAt = DateTime.Now;
    }

    public void MapFrom(object source)
    {
        if(source is AuthorCreateDTO creationData)
        {
            FirstName = creationData.FirstName;
            LastName = creationData.LastName;
            Career = creationData.Career;
        }
    }

    public void MapTo(object dest)
    {
        if(dest is AuthorResponseDTO response)
        {
            response.Id = Id;
            response.FirstName = FirstName;
            response.LastName = LastName;
            response.Career = Career;
        }
    }
}
