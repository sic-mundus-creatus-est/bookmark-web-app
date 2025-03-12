using BookMark.backend.Data;
using BookMark.backend.Models;
using Microsoft.EntityFrameworkCore;

namespace BookMark.backend.Services.Repositories;

public interface IBaseRepository<TModel>
{
    Task<IEnumerable<TModel>> GetAllAsync();
    Task<TModel?> GetByIdAsync(string id);
    Task<TModel> CreateAsync(TModel entityData);
    Task<TModel?> UpdateAsync(TModel existingEntity, object entityData);
    Task DeleteAsync(TModel entity);
}

public class BaseRepository<TModel> : IBaseRepository<TModel> where TModel : BaseModel
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

    public virtual async Task<TModel> CreateAsync(TModel newEntity)
    {
        await _dbSet.AddAsync(newEntity);
        await SaveChangesAsync();

        return newEntity;
    }

    public virtual async Task<TModel?> UpdateAsync(TModel dbEntity, object newEntityData)
    {
        var entry = _context.Entry(dbEntity);
        var keyProperty = _context.Model.FindEntityType(typeof(TModel))?.FindPrimaryKey()?.Properties.FirstOrDefault()?.Name;

        foreach (var property in newEntityData.GetType().GetProperties())
        {
            if (property.Name == keyProperty) continue; // Skips the primary key (Id)

            var newValue = property.GetValue(newEntityData);
            if (newValue != null)
            {
                entry.Property(property.Name).CurrentValue = newValue;
                entry.Property(property.Name).IsModified = true;
            }
        }

        await SaveChangesAsync();
        return dbEntity;
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
