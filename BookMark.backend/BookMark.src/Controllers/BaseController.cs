using Microsoft.AspNetCore.Mvc;

using BookMark.Models;
using BookMark.Models.Domain;
using BookMark.Data.Repositories;

namespace BookMark.Controllers;

[ApiController]
public class BaseController<TModel, TCreateDTO, TUpdateDTO, TResponseDTO> : ControllerBase where TModel : IModel
{
    protected readonly IBaseRepository<TModel> _repository;
    public BaseController(IBaseRepository<TModel> repository) 
    {
        _repository = repository;
    }


    [HttpPost("create")]
    public virtual async Task<ActionResult<TResponseDTO>> Create([FromBody] TCreateDTO creationData)
    {
        TModel entityToCreate = Activator.CreateInstance<TModel>();
        entityToCreate.MapFrom(creationData!);

        var createdEntity = await _repository.CreateAsync(entityToCreate);

        var response = Activator.CreateInstance<TResponseDTO>();
        createdEntity.MapTo(response!);

        return CreatedAtAction(nameof(Get), new { id = entityToCreate.Id }, response);
    }


    [HttpGet("get/{id}")]
    public virtual async Task<ActionResult<TResponseDTO>> Get([FromRoute] string id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return Problem( title: "Not Found",
                            detail: $"No {typeof(TModel).Name} with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound );
        
        var response = Activator.CreateInstance<TResponseDTO>();
        entity.MapTo(response!);

        return Ok(response);
    }


    [HttpGet("get-all")]
    public virtual async Task<ActionResult<IEnumerable<TResponseDTO>>> GetAll()
    {
        var entities = await _repository.GetAllAsync();
        var response = entities.Select( entity =>
                                        {
                                            var dto = Activator.CreateInstance<TResponseDTO>();
                                            entity.MapTo(dto!);
                                            return dto;
                                        } );
        return Ok(response);
    }


    [HttpGet("get-constrained")]
    public async Task<ActionResult<Page<TResponseDTO>>> GetConstrained(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool sortDescending = false,
        [FromQuery] string? sortBy = null,
        [FromQuery(Name="filters")] Dictionary<string, string>? filters = null)
    {
        var page = await _repository.GetConstrainedAsync(
            pageIndex, pageSize, sortDescending, sortBy, filters
        );

        var itemDtos = page.Items!.Select(entity =>
        {
            var dto = Activator.CreateInstance<TResponseDTO>();
            entity.MapTo(dto!);
            return dto;
        }).ToList();

        var response = new Page<TResponseDTO>(
            itemDtos, page.PageIndex, page.TotalPages);

        return Ok(response);
    }


    [HttpPatch("update/{id}")]
    public virtual async Task<ActionResult<TResponseDTO>> Update([FromRoute] string id, [FromBody] TUpdateDTO updateData)
    {
        TModel? entityToUpdate = await _repository.GetByIdAsync(id);
        if (entityToUpdate == null)
            return Problem( title: "Not Found",
                            detail: $"No {nameof(TModel)} with ID '{id}' was found. Nothing to update.",
                            statusCode: StatusCodes.Status404NotFound );

        if (updateData == null)
            return Problem( title: "No Changes Sent",
                            detail: $"Nothing to update.",
                            statusCode: StatusCodes.Status400BadRequest );

        await _repository.UpdateAsync(entityToUpdate, updateData);

        return Ok();
    }


    [HttpDelete("delete/{id}")]
    public virtual async Task<ActionResult> Delete([FromRoute] string id)
    {           
        var entityToDelete = await _repository.GetByIdAsync(id, changeTracking: true);
        if (entityToDelete == null)
            return Problem( title: "Not Found",
                            detail: $"No {nameof(TModel)} with ID '{id}' was found. It may have been previously deleted or never existed.",
                            statusCode: StatusCodes.Status404NotFound );

        await _repository.DeleteAsync(entityToDelete);
        
        return NoContent();
    }

}
