namespace BookMark.Models.Domain;

public interface IModel
{
    string Id { get; }
    DateTime CreatedAt { get; }
    DateTime UpdatedAt { get; set; }

    #region MAPPING

    void MapFrom(object source);
    void MapTo(object dest);

#endregion

}
