using BookMark.backend.DTOs;
using BookMark.backend.Models;
using BookMark.backend.Services.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BookMark.backend.Controllers;

[ApiController]
public class BaseController<TModel, TDTO> : ControllerBase where TModel : BaseModel where TDTO : BaseDTO
{
    protected readonly IBaseRepository<TModel, TDTO> _repository;
    public BaseController(IBaseRepository<TModel, TDTO> repository) 
    { 
        _repository = repository;
    }

    [HttpGet("get-all", Name = "GetAll")]
    public virtual async Task<ActionResult<IEnumerable<TModel>>> GetAll()
    {
        var entities = await _repository.GetAllAsync();
        return Ok(entities); // 200 OK
    }

    [HttpGet("get-by-id/{id}", Name = "GetById")]
    public virtual async Task<ActionResult<TModel>> GetById([FromRoute] string id)
    {           
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
        {
            return NotFound(); // 404 Not Found
        }

        return Ok(entity); // 200 OK
    }

    [HttpPost("create", Name = "Create")]
    public virtual async Task<ActionResult<TModel>> Create([FromBody] TModel entity)
    {           
        if (entity == null)
        {
            return BadRequest(); // 400 Bad Request
        }

        var createdEntity = await _repository.CreateAsync(entity);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, createdEntity); // 201 Created
    }

    [HttpPost("update", Name = "Update")]
    public virtual async Task<ActionResult<TModel>> Update([FromBody] TDTO entity)
    {           
        if (entity == null)
        {
            return BadRequest(); // 400 Bad Request
        }

        var existingEntity = await _repository.GetByIdAsync(entity.Id);
        if (existingEntity == null)
        {
            return NotFound(); // 404 Not Found
        }

        var updatedEntity = await _repository.UpdateAsync(existingEntity, entity);
        return Ok(updatedEntity); // 200 OK
    }

    [HttpDelete("delete-by-id/{id}", Name = "DeleteById")]
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
