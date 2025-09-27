using Microsoft.AspNetCore.Mvc;
using AutoMapper;

using BookMark.Models;
using BookMark.Models.Domain;
using BookMark.Data.Repositories;

namespace BookMark.Controllers;

[ApiController]
public class BaseController<TModel, TCreateDTO, TUpdateDTO, TResponseDTO, TLinkDTO> : ControllerBase where TModel : IModel
{
    protected readonly IBaseRepository<TModel> _repository;
    protected readonly IMapper _mapper;
    public BaseController(IBaseRepository<TModel> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }


    [HttpPost("create")]
    public virtual async Task<ActionResult<TResponseDTO>> Create([FromBody] TCreateDTO creationData)
    {
        TModel entityToCreate = _mapper.Map<TModel>(creationData);

        await _repository.CreateAsync(entityToCreate);

        var createdEntity = await _repository.GetByIdAsync<TResponseDTO>(entityToCreate.Id);
        return CreatedAtAction(nameof(Get), new { id = entityToCreate.Id }, createdEntity);
    }


    [HttpGet("get/{id}")]
    public virtual async Task<ActionResult<TResponseDTO>> Get([FromRoute] string id)
    {
        var entity = await _repository.GetByIdAsync<TResponseDTO>(id);
        if (entity == null)
            return Problem( title: "Not Found",
                            detail: $"No {typeof(TModel).Name} with ID '{id}' found.",
                            statusCode: StatusCodes.Status404NotFound );

        return Ok(entity);
    }


    [HttpGet("get-all")]
    public virtual async Task<ActionResult<List<TLinkDTO>>> GetAll()
    {
        var entities = await _repository.GetAllAsync<TLinkDTO>();
        
        return Ok(entities);
    }


    [HttpGet("get-constrained")]
    public async Task<ActionResult<Page<TResponseDTO>>> GetConstrained(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool sortDescending = false,
        [FromQuery] string? sortBy = null,
        [FromQuery(Name="filters")] Dictionary<string, string>? filters = null)
    {
        var page = await _repository.GetConstrainedAsync<TLinkDTO>(
            pageIndex, pageSize, sortDescending, sortBy, filters
        );

        return Ok(page);
    }


    [HttpPatch("update/{id}")]
    public virtual async Task<ActionResult<TResponseDTO>> Update([FromRoute] string id, [FromBody] TUpdateDTO updateData)
    {
        if (updateData == null)
            return Problem( title: "Bad Request",
                            detail: $"Update data is empty. Nothing to update.",
                            statusCode: StatusCodes.Status400BadRequest );

        await _repository.UpdateAsync(id, updateData!);

        return Ok();
    }


    [HttpDelete("delete/{id}")]
    public virtual async Task<ActionResult> Delete([FromRoute] string id)
    {           
        await _repository.DeleteAsync(id);
        
        return NoContent();
    }

}
