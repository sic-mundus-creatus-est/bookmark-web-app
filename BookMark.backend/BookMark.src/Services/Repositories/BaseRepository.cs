using BookMark.backend.Data;
using BookMark.backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Linq.Dynamic.Core;
using System.Reflection;
using System.Text.RegularExpressions;

namespace BookMark.backend.Services.Repositories;

public interface IBaseRepository<TModel>
{
    Task<TModel?> GetByIdAsync(string id);
    Task<IEnumerable<TModel>> GetAllAsync();
    Task<PaginatedList<TModel>> GetConstrainedAsync(int pageIndex,
                                                        int pageSize,
                                                        bool sortDescending = false,
                                                        string? sortBy = null,
                                                        Dictionary<string, string>? filters = null);
    Task<TModel> CreateAsync(TModel entityData);
    Task<TModel?> UpdateAsync(TModel existingEntity, object entityData);
    Task DeleteAsync(TModel entity);
}

public abstract class BaseRepository<TModel> : IBaseRepository<TModel> where TModel : BaseModel
{
    protected readonly DataContext _context;
    protected DbSet<TModel> _dbSet { get; set; }

    protected abstract IReadOnlySet<string> AllowedFilterProps { get; }

    private static readonly IReadOnlyDictionary<string, Type> _allTModelProps = typeof(TModel)
                                                                                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                                                                                .ToDictionary(
                                                                                    p => p.Name,
                                                                                    p => p.PropertyType
                                                                                );

    protected IReadOnlyDictionary<string, Type> FilterPropTypes => _allTModelProps.Where(kv => AllowedFilterProps.Contains(kv.Key))
                                                                                  .ToDictionary(kv => kv.Key, kv => kv.Value);

        

    public BaseRepository(DataContext context)
    {
        _context = context;
        _dbSet = context.Set<TModel>();
    }


    public virtual async Task<TModel?> GetByIdAsync(string id)
    {
        var entity = await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return entity;
    }

    public virtual async Task<IEnumerable<TModel>> GetAllAsync()
    {
        return await _dbSet.AsNoTracking().ToListAsync();
    }


    public async Task<PaginatedList<TModel>> GetConstrainedAsync( int pageIndex,
                                                                    int pageSize,
                                                                    bool sortDescending = false,
                                                                    string? sortBy = null,
                                                                    Dictionary<string, string>? filters = null ) {
        var query = _dbSet.AsNoTracking().AsQueryable();

        if (!filters.IsNullOrEmpty())
        foreach (var filter in filters!)
        {
            string key = filter.Key;
            string value = filter.Value;

            var match = Regex.Match(key, @"^([a-zA-Z]+)(==|>=|<=|>|<|~=)$");
            if (!match.Success)
                return new PaginatedList<TModel>([], pageIndex, -1);

            string propName = match.Groups[1].Value;
            string op = match.Groups[2].Value;

            if (!FilterPropTypes.ContainsKey(propName))
                return new PaginatedList<TModel>([], pageIndex, -1);

            try
            {
                object typedValue = Convert.ChangeType(value, FilterPropTypes[propName]);

                string predicate;
                object[] values;

                if (op == "~=" && FilterPropTypes[propName] == typeof(string))
                {
                    predicate = $"{propName}.Contains(@0)";
                    values = [typedValue];
                }
                else
                {
                    predicate = $"{propName} {op} @0";
                    values = [typedValue];
                }

                query = query.Where(predicate, values);
            }
            catch
            {
                return new PaginatedList<TModel>([], pageIndex, -5);
            }
        }

        var direction = sortDescending ? "descending" : "ascending";
        if(string.IsNullOrEmpty(sortBy))
            query = query.OrderBy( $"Id {direction}" );
        else if (FilterPropTypes.ContainsKey(sortBy))
            query = query.OrderBy( $"{sortBy} {direction}" );
        else
            return new PaginatedList<TModel>([], pageIndex, -1);
        

        var count = await query.CountAsync();
        var entities = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(count / (double)pageSize);
        return new PaginatedList<TModel>(entities, pageIndex, totalPages);
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
