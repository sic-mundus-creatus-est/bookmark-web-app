using BookMark.backend.Models;
using BookMark.backend.Services.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BookMark.backend.Controllers;

[ApiController]
public class BaseController<TModel, TCreateDTO, TUpdateDTO> : ControllerBase where TModel : BaseModel
{
    protected readonly IBaseRepository<TModel> _repository;
    public BaseController(IBaseRepository<TModel> repository) 
    { 
        _repository = repository;
    }


    [HttpGet("get-by-id/{id}")]
    public virtual async Task<ActionResult<TModel>> GetById([FromRoute] string id)
    {           
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return NotFound(); // 404

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
        
        if(result.TotalPages == -1)
            return BadRequest();
        else if(result.TotalPages == -5)
            return StatusCode(StatusCodes.Status500InternalServerError);

        return Ok(result);
    }


    [HttpPost("create")]
    public virtual async Task<ActionResult<TModel>> Create([FromBody] TCreateDTO dto)
    {           
        if (dto == null)
            return BadRequest(); // 400

        TModel entity = Activator.CreateInstance<TModel>();
        entity.MapFrom(dto);
        
        var createdEntity = await _repository.CreateAsync(entity);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new { message = "Book created successfully.", data = createdEntity }); // 201
    }


    [HttpPatch("update-by-id/{id}")]
    public virtual async Task<ActionResult<TModel>> Update([FromRoute] string id, [FromBody] TUpdateDTO updatedData)
    {           
        if (updatedData == null)
            return BadRequest(); // 400

        TModel? entityToUpdate = await _repository.GetByIdAsync(id);
        if (entityToUpdate == null)
            return NotFound(); // 404

        var updatedEntity = await _repository.UpdateAsync(entityToUpdate, updatedData);
        return Ok(updatedEntity); // 200
    }


    [HttpDelete("delete-by-id/{id}")]
    public virtual async Task<ActionResult> DeleteById([FromRoute] string id)
    {           
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return NotFound(); // 404

        await _repository.DeleteAsync(entity);
        return NoContent(); // 204
    }

}
