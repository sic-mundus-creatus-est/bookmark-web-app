using System.ComponentModel.DataAnnotations;
using BookMark.Models.Domain;
using BookMark.Models.DTOs;

namespace BookMark.Models.Relationships;

public class BookType : IModel
{
    [Key]
    public string Id { get; private set; }
    public string Name { get; set; } = null!;

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Book> Books { get; set; } = [];

    public BookType()
    {
        Id = Guid.NewGuid().ToString();
        CreatedAt = DateTime.Now;
    }

#region MAPPING

    public void MapFrom(object source)
    {
        if (source is BookTypeDTO creationData)
        {
            Name = creationData.Name;
        }
    }

    public void MapTo(object dest)
    {
        if (dest is BookTypeResponseDTO response)
        {
            response.Id = Id;
            response.Name = Name;
        }
    }

#endregion

}
