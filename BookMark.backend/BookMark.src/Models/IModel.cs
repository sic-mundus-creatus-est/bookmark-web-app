namespace BookMark.Models;

public interface IModel
{
    string Id { get; }
    DateTime CreatedAt { get; }
    DateTime UpdatedAt { get; set; }

    void MapFrom(object source);
    void MapTo(object dest);
}
