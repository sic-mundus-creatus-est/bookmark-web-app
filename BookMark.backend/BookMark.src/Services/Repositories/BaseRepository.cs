using BookMark.backend.Data;
using BookMark.backend.DTOs;
using BookMark.backend.Models;
using Microsoft.EntityFrameworkCore;

namespace BookMark.backend.Services.Repositories;

public interface IBaseRepository<TModel, TDTO>
{
    // TODO: make TDTO's exclusive to functions that need them, not the entire interface
    Task<IEnumerable<TModel>> GetAllAsync();
    Task<TModel?> GetByIdAsync(string id);
    Task<TModel> CreateAsync(TModel entityData);
    Task<TModel?> UpdateAsync(TModel existingEntity, TDTO entityData);
    Task DeleteAsync(TModel entity);
}

public class BaseRepository<TModel, TDTO> : IBaseRepository<TModel, TDTO> where TModel : BaseModel where TDTO : BaseDTO
{
    protected readonly DataContext _context;
    protected DbSet<TModel> _dbSet { get; set; }

    public BaseRepository(DataContext context)
    {
        _context = context;
        _dbSet = context.Set<TModel>();
    }

    public virtual async Task<IEnumerable<TModel>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<TModel?> GetByIdAsync(string id)
    {
        var entity = await _dbSet.FirstOrDefaultAsync(e => e.Id == id);
        return entity;
    }

    public virtual async Task<TModel> CreateAsync(TModel entityData)
    {
        await _dbSet.AddAsync(entityData);
        await SaveChangesAsync();

        return entityData;
    }

    public virtual async Task<TModel?> UpdateAsync(TModel existingEntity, TDTO entityData)
    {
        var entry = _context.Entry(existingEntity);
        var keyProperty = _context.Model.FindEntityType(typeof(TModel))?.FindPrimaryKey()?.Properties.FirstOrDefault()?.Name;

        foreach (var property in typeof(TDTO).GetProperties())
        {
            if (property.Name == keyProperty) continue; // Skips the primary key (Id)

            var newValue = property.GetValue(entityData);
            if (newValue != null)
            {
                entry.Property(property.Name).CurrentValue = newValue;
                entry.Property(property.Name).IsModified = true;
            }
        }

        await SaveChangesAsync();
        return existingEntity;
    }

    public virtual async Task DeleteAsync(TModel entity)
    {
        _dbSet.Remove(entity);
        await SaveChangesAsync();
    }

    protected async Task SaveChangesAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }
}
