using BookMark.backend.Data;
using BookMark.backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookMark.backend.Controllers;

[ApiController]
public class BaseController<TModel> : ControllerBase where TModel : BaseModel
{
    protected readonly DataContext _context;
    protected DbSet<TModel> _dbSet { get; set; }
    public BaseController(DataContext context) 
    { 
        _context = context;
        _dbSet = _context.Set<TModel>();
    }

    [HttpGet("get-all", Name = "GetAll")]
    public virtual async Task<ActionResult<IEnumerable<TModel>>> GetAllAsync()
    {
        var entities = await _dbSet.ToListAsync();
        return Ok(entities); // 200 OK
    }

    [HttpGet("get-by-id/{id}", Name = "GetById")]
    public virtual async Task<ActionResult<TModel>> GetByIdAsync([FromRoute] string id)
    {           
        var entity = await _dbSet.Where(e => e.Id == id).FirstOrDefaultAsync();
        if (entity == null)
        {
            return NotFound(); // 404 Not Found
        }

        return Ok(entity); // 200 OK
    }

    [HttpPost("create", Name = "Create")]
    public virtual async Task<ActionResult<TModel>> CreateAsync(TModel entity)
    {           
        if (entity == null)
        {
            return BadRequest(); // 400 Bad Request
        }

        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return CreatedAtAction("GetById", new { id = entity.Id }, entity); // 201 Created
    }

    [HttpPost("update", Name = "Update")]
    public virtual async Task<ActionResult<TModel>> UpdateAsync(TModel entity)
    {           
        if (entity == null)
        {
            return BadRequest(); // 400 Bad Request
        }

        var existingEntity = await _dbSet.Where(e => e.Id == entity.Id).FirstOrDefaultAsync();
        if (existingEntity == null)
        {
            return NotFound(); // 404 Not Found
        }

        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
        return Ok(entity); // 200 OK
    }

    [HttpDelete("delete-by-id/{id}", Name = "DeleteById")]
    public virtual async Task<ActionResult> DeleteByIdAsync(string id)
    {           
        var entity = await _dbSet.Where(e => e.Id == id).FirstOrDefaultAsync();
        if (entity == null)
        {
            return NotFound(); // 404 Not Found
        }

        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent(); // 204 No Content
    }
}
