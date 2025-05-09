using BookMark.Models;
using BookMark.Services.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BookMark.Controllers;

[ApiController]
public class BaseController<TModel, TCreateDTO, TUpdateDTO> : ControllerBase where TModel : BaseModel
{
    protected readonly IBaseRepository<TModel> _repository;
    public BaseController(IBaseRepository<TModel> repository) 
    {
        _repository = repository;
    }


    [HttpPost("create")]
    public virtual async Task<ActionResult<TModel>> Create([FromBody] TCreateDTO creationData)
    {
        TModel entityToCreate = Activator.CreateInstance<TModel>();
        entityToCreate.MapFrom(creationData!);

        var createdEntity = await _repository.CreateAsync(entityToCreate);
        return CreatedAtAction(nameof(Get), new { id = entityToCreate.Id }, createdEntity); // 201
    }


    [HttpGet("get/{id}")]
    public virtual async Task<ActionResult<TModel>> Get([FromRoute] string id)
    {           
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return Problem( title: "Not Found",
                            detail: $"No {typeof(TModel).Name} with ID '{id}' was found.",
                            statusCode: StatusCodes.Status404NotFound );

        return Ok(entity); // 200
    }


    [HttpGet("get-all")]
    public virtual async Task<ActionResult<IEnumerable<TModel>>> GetAll()
    {
        var entities = await _repository.GetAllAsync();
        return Ok(entities); // 200
    }


    [HttpGet("get-constrained")]
    public async Task<IActionResult> GetConstrained(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool sortDescending = false,
        [FromQuery] string? sortBy = null,
        [FromQuery(Name="filters")] Dictionary<string, string>? filters = null)
    {
        var result = await _repository.GetConstrainedAsync(
            pageIndex, pageSize, sortDescending, sortBy, filters);

        return Ok(result);
    }


    [HttpPatch("update/{id}")]
    public virtual async Task<ActionResult<TModel>> Update([FromRoute] string id, [FromBody] TUpdateDTO updateData)
    {
        TModel? entityToUpdate = await _repository.GetByIdAsync(id);
        if (entityToUpdate == null)
            return Problem( title: "Not Found",
                            detail: $"No {nameof(TModel)} with ID '{id}' was found. Nothing to update.",
                            statusCode: StatusCodes.Status404NotFound );

        var updatedEntity = await _repository.UpdateAsync(entityToUpdate, updateData!);
        return Ok(updatedEntity); // 200
    }


    [HttpDelete("delete/{id}")]
    public virtual async Task<ActionResult> Delete([FromRoute] string id)
    {           
        var entity = await _repository.GetTrackedByIdAsync(id);
        if (entity == null)
            return Problem( title: "Not Found",
                            detail: $"No {nameof(TModel)} with ID '{id}' was found. It may have been deleted or never existed.",
                            statusCode: StatusCodes.Status404NotFound );

        await _repository.DeleteAsync(entity);
        return NoContent(); // 204
    }

}
