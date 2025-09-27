using System.ComponentModel.DataAnnotations;

namespace BookMark.Models.Domain;

public interface IModel
{
    [Key]//_______________________________________________________________
    string Id { get; set; }
    //____________________________________________________________________

    //AUDIT_INFO__________________________________________________________
    DateTime CreatedAt { get; init; }
    DateTime UpdatedAt { get; set; }
    //____________________________________________________________________

}
