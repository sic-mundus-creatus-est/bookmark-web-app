using System.Reflection;
using System.Linq.Dynamic.Core;
using System.Text.RegularExpressions;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using BookMark.Models;
using BookMark.Models.Domain;
using System.Data;

namespace BookMark.Data.Repositories;

public interface IBaseRepository<TModel>
{
    Task<TModel> CreateAsync(TModel entityToCreate);
    Task<bool> ExistsAsync(string id);
    Task<TModel?> GetByIdAsync(string id);
    Task<TModel?> GetTrackedByIdAsync(string id);
    Task<IEnumerable<TModel>> GetAllAsync();
    Task<Page<TModel>> GetConstrainedAsync( int pageIndex,
                                            int pageSize,
                                            bool sortDescending = false,
                                            string? sortBy = null,
                                            Dictionary<string, string>? filters = null,
                                            IQueryable<TModel>? query = null );
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
        await _context.SaveChangesAsync();

        return entityToCreate;
    }


    public virtual async Task<bool> ExistsAsync(string id)
    {
        return await _dbSet.AsNoTracking().AnyAsync(b => b.Id == id);
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
                                                        Dictionary<string, string>? filters = null,
                                                        IQueryable<TModel>? customQuery = null) {
        if (pageIndex < 1)
            throw new ArgumentOutOfRangeException(nameof(pageIndex), "PageIndex must be greater than zero.");
        if (pageSize < 1)
            throw new ArgumentOutOfRangeException(nameof(pageSize), "Page size must be greater than zero.");

        var query = customQuery ?? _dbSet.AsNoTracking().AsQueryable();

        if (!filters.IsNullOrEmpty())
        foreach (var filter in filters!)
        {
            string key = filter.Key;
            string value = filter.Value;

            var match = Regex.Match(key, @"^([a-zA-Z]+)(==|>=|<=|>|<|~=)$");
            if (!match.Success)
                throw new FormatException($"Invalid filter key format for '{key}'. Keys must end with a comparison operator (==, >=, <=, >, <, ~=).");

            string propName = match.Groups[1].Value;
            string op = match.Groups[2].Value;

            if (!FilterPropTypes.ContainsKey(propName))
                throw new KeyNotFoundException($"Invalid filter key '{key}'. Allowed keys are: {string.Join(", ", FilterPropTypes.Keys)}.");

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
            throw new KeyNotFoundException($"Invalid sorting parameter '{sortBy}'. Valid options are: {string.Join(", ", FilterPropTypes.Keys)}.");

        var count = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(count / (double)pageSize);


        if (totalPages > 0 && pageIndex > totalPages)
            throw new ArgumentOutOfRangeException(nameof(pageIndex), $"You requested page {pageIndex}, but there are only {totalPages} page(s) available with the given constraints.");

        List<TModel> entities = [];
        if (totalPages > 0)
        {
            entities = await query.Skip((pageIndex - 1) * pageSize)
                                  .Take(pageSize)
                                  .ToListAsync();
        }

        return new Page<TModel>(entities, pageIndex, totalPages);
    }


    public virtual async Task<TModel?> UpdateAsync(TModel entityToUpdate, object updateData)
    {
        _context.ApplyChangesForUpdate(_context, entityToUpdate, updateData);

        await _context.SaveChangesAsync();
        return entityToUpdate;
    }


    public virtual async Task DeleteAsync(TModel entity)
    {
        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
    }

}
