using System.Reflection;
using System.Linq.Dynamic.Core;
using System.Text.RegularExpressions;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using BookMark.Models;
using BookMark.Models.Domain;

namespace BookMark.Data.Repositories;

public interface IBaseRepository<TModel>
{
    Task<TModel> CreateAsync(TModel entityToCreate);
    Task<TModel?> GetByIdAsync(string id);
    Task<TModel?> GetTrackedByIdAsync(string id);
    Task<IEnumerable<TModel>> GetAllAsync();
    Task<Page<TModel>> GetConstrainedAsync( int pageIndex,
                                            int pageSize,
                                            bool sortDescending = false,
                                            string? sortBy = null,
                                            Dictionary<string, string>? filters = null );
    Task<TModel?> UpdateAsync(TModel entityToUpdate, object updateData);
    Task DeleteAsync(TModel entity);
}

public abstract class BaseRepository<TModel> : IBaseRepository<TModel> where TModel : class, IModel
{
    protected readonly AppDbContext _context;
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

        

    public BaseRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<TModel>();
    }


    public virtual async Task<TModel> CreateAsync(TModel entityToCreate)
    {
        await _dbSet.AddAsync(entityToCreate);
        await SaveChangesAsync();

        return entityToCreate;
    }

    public virtual async Task<TModel?> GetByIdAsync(string id)
    {
        return await _dbSet.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id);
    }

    public virtual async Task<TModel?> GetTrackedByIdAsync(string id)
    {
        return await _dbSet.FirstOrDefaultAsync(b => b.Id == id);
    }

    public virtual async Task<IEnumerable<TModel>> GetAllAsync()
    {
        return await _dbSet.AsNoTracking().ToListAsync();
    }


    public async Task<Page<TModel>> GetConstrainedAsync(int pageIndex,
                                                        int pageSize,
                                                        bool sortDescending = false,
                                                        string? sortBy = null,
                                                        Dictionary<string, string>? filters = null) {
        if(pageSize<=0)
            throw new ArgumentException("Page size must be greater than zero.", nameof(pageSize));

        var query = _dbSet.AsNoTracking().AsQueryable();

        if (!filters.IsNullOrEmpty())
        foreach (var filter in filters!)
        {
            string key = filter.Key;
            string value = filter.Value;

            var match = Regex.Match(key, @"^([a-zA-Z]+)(==|>=|<=|>|<|~=)$");
            if (!match.Success)
                throw new ArgumentException($"Invalid filter key '{key}'. Keys must end with a comparison operator (==, >=, <=, >, <, ~=).", nameof(filters));

            string propName = match.Groups[1].Value;
            string op = match.Groups[2].Value;

            if (!FilterPropTypes.ContainsKey(propName))
                throw new ArgumentException($"Invalid filter key '{key}'. Allowed keys are: {string.Join(", ", FilterPropTypes.Keys)}.", nameof(filters));

            object typedValue;
            try
            {
                typedValue = Convert.ChangeType(value, FilterPropTypes[propName]);
            }
            catch (Exception ex) when (ex is InvalidCastException || ex is FormatException || ex is OverflowException)
            {
                throw new FormatException($"Invalid filter value format for key '{key}'. Expected a value in the format of type '{FilterPropTypes[propName].Name}'.");
            }

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

        var direction = sortDescending ? "descending" : "ascending";
        if(string.IsNullOrEmpty(sortBy))
            query = query.OrderBy( $"Id {direction}" );
        else if (FilterPropTypes.ContainsKey(sortBy))
            query = query.OrderBy( $"{sortBy} {direction}" );
        else
            throw new ArgumentException($"Invalid sorting parameter '{sortBy}'. Valid options are: {string.Join(", ", FilterPropTypes.Keys)}.", nameof(sortBy));

        var count = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(count / (double)pageSize);

        
        if (pageIndex < 1 || (totalPages > 0 && pageIndex > totalPages) || totalPages==0)
        {
            throw new ArgumentException($"You requested page {pageIndex}, but there are only {totalPages} page(s) available with the given constraints.", nameof(pageIndex));
        }

        var entities = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();


        return new Page<TModel>(entities, pageIndex, totalPages);
    }


    public virtual async Task<TModel?> UpdateAsync(TModel entityToUpdate, object updateData)
    {
        var entry = _context.Entry(entityToUpdate);
        var keyProperty = _context.Model.FindEntityType(typeof(TModel))?.FindPrimaryKey()?.Properties.FirstOrDefault()?.Name;

        foreach (var property in updateData.GetType().GetProperties())
        {
            if (property.Name == keyProperty) continue; // Skips the primary key (Id)

            var newValue = property.GetValue(updateData);
            if (newValue != null)
            {
                entry.Property(property.Name).CurrentValue = newValue;
                entry.Property(property.Name).IsModified = true;
            }
        }

        await SaveChangesAsync();
        return entityToUpdate;
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
            throw;
        }
    }

}
