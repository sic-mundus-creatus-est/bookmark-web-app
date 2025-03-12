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


    [HttpGet("get-all")]
    public virtual async Task<ActionResult<IEnumerable<TModel>>> GetAll()
    {
        var entities = await _repository.GetAllAsync();
        return Ok(entities); // 200 OK
    }


    [HttpGet("get-by-id/{id}")]
    public virtual async Task<ActionResult<TModel>> GetById([FromRoute] string id)
    {           
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
        {
            return NotFound(); // 404 Not Found
        }

        return Ok(entity); // 200 OK
    }


    [HttpPost("create")]
    public virtual async Task<ActionResult<TModel>> Create([FromBody] TCreateDTO dto)
    {           
        if (dto == null)
        {
            return BadRequest(); // 400 Bad Request
        }
        TModel entity = Activator.CreateInstance<TModel>();
        entity.MapFrom(dto);
        
        var createdEntity = await _repository.CreateAsync(entity);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new { message = "Book created successfully.", data = createdEntity }); // 201 Created
    }


    [HttpPost("update-by-id/{id}")]
    public virtual async Task<ActionResult<TModel>> Update([FromRoute] string id, [FromBody] TUpdateDTO newEntityData)
    {           
        if (newEntityData == null)
        {
            return BadRequest(); // 400 Bad Request
        }

        TModel? existingEntityData = await _repository.GetByIdAsync(id);
        if (existingEntityData == null)
        {
            return NotFound(); // 404 Not Found
        }

        var updatedEntity = await _repository.UpdateAsync(existingEntityData, newEntityData);
        return Ok(updatedEntity); // 200 OK
    }


    [HttpDelete("delete-by-id/{id}")]
    public virtual async Task<ActionResult> DeleteById([FromRoute] string id)
    {           
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
        {
            return NotFound(); // 404 Not Found
        }

        await _repository.DeleteAsync(entity);
        return NoContent(); // 204 No Content
    }

}
