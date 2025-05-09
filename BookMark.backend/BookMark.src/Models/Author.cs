using System.Text.Json.Serialization;
using BookMark.DTOs;
using BookMark.Models.Relationships;

namespace BookMark.Models;

public class Author : BaseModel
{
    public string FirstName { get; set; } = "";

    public string LastName { get; set; } = "";

    public string? Career { get; set; }

    [JsonIgnore]
    public IList<BookAuthor>? BookAuthors { get; set; }

    public override void MapFrom(object source)
    {
        if(source is AuthorCreateDTO author)
        {
            FirstName = author.FirstName;
            LastName = author.LastName;
            Career = author.Career;
        }
    }
}
