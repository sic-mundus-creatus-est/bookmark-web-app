using System.Reflection;
using System.Linq.Dynamic.Core;
using System.Text.RegularExpressions;

using Microsoft.EntityFrameworkCore;

using BookMark.Models;
using BookMark.Models.Domain;
using System.Data;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using System.Collections;
using System.Linq.Expressions;

namespace BookMark.Data.Repositories;

public interface IBaseRepository<TModel>
{
    Task CreateAsync(TModel entityToCreate);
    Task<bool> ExistsAsync(string id);
    Task<TResponseDTO?> GetByIdAsync<TResponseDTO>(string id, bool changeTracking = false);
    Task<List<TLinkDTO>> GetAllAsync<TLinkDTO>();
    Task<Page<TLinkDTO>> GetConstrainedAsync<TLinkDTO>( int pageIndex,
                                                        int pageSize,
                                                        bool sortDescending = false,
                                                        string? sortBy = null,
                                                        Dictionary<string, string>? filters = null );
    Task UpdateAsync<TUpdateDTO>(string id, TUpdateDTO updateData);
    Task DeleteAsync(string id);
}

public abstract class BaseRepository<TModel> : IBaseRepository<TModel> where TModel : class, IModel, new()
{
    protected readonly AppDbContext _context;
    protected readonly IMapper _mapper;
    protected DbSet<TModel> _dbSet { get; set; }

    protected abstract IReadOnlySet<string> AllowedFilterProps { get; }

    private static readonly IReadOnlyDictionary<string, Type> _allTModelProps = GetAllProps(typeof(TModel));

    protected IReadOnlyDictionary<string, Type> FilterPropTypes => _allTModelProps.Where(kv => AllowedFilterProps.Contains(kv.Key))
                                                                                  .ToDictionary(kv => kv.Key, kv => kv.Value);



    public BaseRepository(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
        _dbSet = context.Set<TModel>();
    }


    public virtual async Task CreateAsync(TModel entityToCreate)
    {
        await _dbSet.AddAsync(entityToCreate);
        await _context.SaveChangesAsync();
    }


    public virtual async Task<bool> ExistsAsync(string id)
    {
        return await _dbSet.AnyAsync(b => b.Id == id);
    }


    public virtual async Task<TResponseDTO?> GetByIdAsync<TResponseDTO>(string id, bool changeTracking = false)
    {
        IQueryable<TModel> query = _dbSet;

        if (!changeTracking)
            query = query.AsNoTracking();

        return await query.Where(b => b.Id == id)
                            .ProjectTo<TResponseDTO>(_mapper.ConfigurationProvider)
                            .FirstOrDefaultAsync();
    }


    public virtual async Task<List<TLinkDTO>> GetAllAsync<TLinkDTO>()
    {
        return await _dbSet.AsNoTracking()
                            .ProjectTo<TLinkDTO>(_mapper.ConfigurationProvider)
                            .ToListAsync();
    }


    public virtual async Task UpdateAsync<TUpdateDTO>(string id, TUpdateDTO updateData)
    {
        TModel entityToUpdate = new TModel { Id = id };

        _context.ApplyChanges(_context, entityToUpdate, updateData!);
        await _context.SaveChangesAsync();
    }


    public virtual async Task DeleteAsync(string id)
    {
        TModel entityToDelete = new TModel { Id = id };
        _dbSet.Attach(entityToDelete);
        _dbSet.Remove(entityToDelete);
        await _context.SaveChangesAsync();
    }


    protected static Dictionary<string, Type> GetAllProps(Type type, string prefix = "", HashSet<Type>? visited = null)
    {
        visited ??= [];
        var dict = new Dictionary<string, Type>();

        if (visited.Contains(type))
            return dict; // Already visited this type, stop recursion

        visited.Add(type);

        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            string propName = string.IsNullOrEmpty(prefix) ? prop.Name : $"{prefix}.{prop.Name}";
            dict[propName] = prop.PropertyType;

            if (prop.PropertyType == typeof(string) || prop.PropertyType.IsValueType)
                continue;

            Type subType = prop.PropertyType;

            // For collections, get the element type
            if (typeof(IEnumerable).IsAssignableFrom(prop.PropertyType) && prop.PropertyType.IsGenericType)
                subType = prop.PropertyType.GetGenericArguments().First();

            // Recurse into sub-properties
            foreach (var subProp in GetAllProps(subType, propName, visited))
                dict[subProp.Key] = subProp.Value;
        }

        return dict;
    }


    public virtual async Task<Page<TLinkDTO>> GetConstrainedAsync<TLinkDTO>(int pageIndex, int pageSize,
                                                                            bool sortDescending = false,
                                                                            string? sortBy = null,
                                                                            Dictionary<string, string>? filters = null) {
        if (pageIndex < 1 || pageSize < 1)
            throw new ArgumentOutOfRangeException(pageIndex < 1 ? nameof(pageIndex) : nameof(pageSize), "Must be greater than zero.");

        var query = _dbSet.AsNoTracking().AsQueryable();

        if (filters?.Count > 0)
        {
            var (combinedPredicate, values, filterTuples) = BuildFilters(filters);
            query = query.Where(combinedPredicate, [.. values]);
            query = ApplySorting(query, sortBy, sortDescending, filterTuples);
        }
        else query = ApplySorting(query, sortBy, sortDescending);

        var count = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(count / (double)pageSize);

        if (totalPages > 0 && pageIndex > totalPages)
            throw new ArgumentOutOfRangeException(nameof(pageIndex), $"Page {pageIndex} requested, only {totalPages} available.");

        var entities = (totalPages > 0) ? await query.Skip((pageIndex - 1) * pageSize).Take(pageSize)
                                                     .ProjectTo<TLinkDTO>(_mapper.ConfigurationProvider).ToListAsync()
                                        : [];

        return new Page<TLinkDTO>(entities, pageIndex, totalPages);
    }


    private (string combinedPredicate, List<object> values, List<(string, string, object)> tuples) BuildFilters(Dictionary<string, string> filters)
    {
        var orPredicates = new List<string>();    // OR for ~= operator
        var andPredicates = new List<string>();   // AND for other operators  
        var values = new List<object>();
        var tuples = new List<(string, string, object)>();

        foreach (var filter in filters)
        {
            var match = Regex.Match(filter.Key, @"([\w\.]+)(==|>=|<=|>|<|~=)");
            if (!match.Success) throw new FormatException($"Invalid filter: '{filter.Key}'");

            var prop = match.Groups[1].Value;
            var op = match.Groups[2].Value;

            if (!FilterPropTypes.ContainsKey(prop))
                throw new KeyNotFoundException($"Invalid filter key '{filter.Key}'. Allowed: {string.Join(", ", FilterPropTypes.Keys)}");

            var value = Convert.ChangeType(filter.Value, FilterPropTypes[prop]);
            var predicate = BuildPredicate(typeof(TModel), prop, op, values.Count);

            values.Add(value);
            tuples.Add((prop, op, value));

            if (op == "~=")
                orPredicates.Add(predicate);
            else
                andPredicates.Add(predicate);
        }

        // Combined: (OR_predicates) && (AND_predicates)
        string combinedPredicate = "";

        if (orPredicates.Count > 0 && andPredicates.Count > 0)
            combinedPredicate = $"({string.Join(" || ", orPredicates)}) && {string.Join(" && ", andPredicates)}";
        else if (orPredicates.Count > 0)
            combinedPredicate = string.Join(" || ", orPredicates);
        else if (andPredicates.Count > 0)
            combinedPredicate = string.Join(" && ", andPredicates);

        return (combinedPredicate, values, tuples);
    }


    private IQueryable<TModel> ApplySorting(IQueryable<TModel> query, string? sortBy, bool sortDescending, List<(string Prop, string Op, object Value)>? filterTuples = null)
    {
        if (string.IsNullOrEmpty(sortBy))
        {
            // default sorting: by the order of filters (relevance sort)
            if (filterTuples?.Count > 0)
            {
                IOrderedQueryable<TModel>? ordered = null;

                foreach (var (prop, op, val) in filterTuples)
                {
                    if (op == "~=" && FilterPropTypes[prop] == typeof(string))
                    {
                        // relevance sorting (contains first)
                        var containsLambda = BaseRepository<TModel>.BuildContainsLambda(prop, val);
                        ordered = (ordered == null) ? query.OrderByDescending(containsLambda)
                                                    : ordered.ThenByDescending(containsLambda);
                    }
                    else
                    {
                        // Regular sorting
                        var selector = BaseRepository<TModel>.GetPropertySelector(prop);
                        ordered = ordered == null
                            ? (sortDescending ? query.OrderByDescending(selector) : query.OrderBy(selector))
                            : (sortDescending ? ordered.ThenByDescending(selector) : ordered.ThenBy(selector));
                    }
                }

                // Add stable secondary ordering
                return ordered?.ThenBy(GetPropertySelector("Id")) ?? query.OrderBy(GetPropertySelector("Id"));
            }
            return sortDescending ? query.OrderByDescending(GetPropertySelector("Id"))
                                  : query.OrderBy(GetPropertySelector("Id"));
        }

        if (!FilterPropTypes.ContainsKey(sortBy))
            throw new KeyNotFoundException($"Invalid sort parameter '{sortBy}'.");

        return sortDescending ? query.OrderByDescending(GetPropertySelector(sortBy))
                              : query.OrderBy(GetPropertySelector(sortBy));
    }


    private static Expression<Func<TModel, object>> GetPropertySelector(string propertyPath)
    {
        var param = Expression.Parameter(typeof(TModel), "x");
        Expression prop = param;

        foreach (var part in propertyPath.Split('.'))
        {
            var propInfo = prop.Type.GetProperty(part);
            if (propInfo == null)
                return GetPropertySelector("Id"); // Fallback to Id if property not found
            prop = Expression.Property(prop, propInfo);
        }

        return Expression.Lambda<Func<TModel, object>>(Expression.Convert(prop, typeof(object)), param);
    }


    private static Expression<Func<TModel, bool>> BuildContainsLambda(string propertyPath, object value)
    {
        var param = Expression.Parameter(typeof(TModel), "x");
        Expression prop = param;

        foreach (var part in propertyPath.Split('.'))
        {
            var propInfo = prop.Type.GetProperty(part);
            if (propInfo == null)
                return x => false; // Fallback if property not found
            prop = Expression.Property(prop, propInfo);
        }

        var containsCall = Expression.Call(prop, typeof(string).GetMethod("Contains", [typeof(string)])!, Expression.Constant(value));
        return Expression.Lambda<Func<TModel, bool>>(containsCall, param);
    }


    private static string BuildPredicate(Type rootType, string propPath, string op, int valueIndex)
    {
        string[] parts = propPath.Split('.');
        Type currentType = rootType;

        for (int i = 0; i < parts.Length; i++)
        {
            var prop = currentType.GetProperty(parts[i]);
            if (prop == null) throw new InvalidOperationException($"Property '{parts[i]}' not found on {currentType.Name}");
            currentType = prop.PropertyType;

            if (currentType != typeof(string) && typeof(IEnumerable).IsAssignableFrom(currentType))
            {
                string innerPath = string.Join(".", parts.Skip(i + 1));
                string innerPredicate = op == "~=" ? $"{innerPath}.Contains(@{valueIndex})" : $"{innerPath} {op} @{valueIndex}";
                return $"{parts[i]}.Any(x => {innerPredicate})";
            }
        }

        return op == "~=" ? $"{propPath}.Contains(@{valueIndex})" : $"{propPath} {op} @{valueIndex}";
    }

}
