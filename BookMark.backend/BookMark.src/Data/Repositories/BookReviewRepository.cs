using AutoMapper;
using AutoMapper.QueryableExtensions;
using BookMark.Models;
using BookMark.Models.DTOs;
using BookMark.Models.Relationships;
using Microsoft.EntityFrameworkCore;

namespace BookMark.Data.Repositories;

public interface IBookReviewRepository
{
    Task CreateBookReviewAsync(BookReview review);

    Task<BookReviewResponseDTO?> GetCurrentUserBookReviewAsync(string userId, string bookId);

    Task<Page<BookReviewResponseDTO>> GetLatestBookReviewsAsync(string bookId, int pageIndex = 1, int pageSize = 5);

    Task<Page<BookReviewResponseDTO>> GetLatestBookReviewsByUserAsync(string userId, int pageIndex = 1, int pageSize = 5);

    Task DeleteBookReviewAsync(string userId, string bookId);
}


public class BookReviewRepository : IBookReviewRepository
{
    protected readonly AppDbContext _context;
    protected readonly IMapper _mapper;
    protected DbSet<BookReview> _dbSet { get; set; }

    public BookReviewRepository(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
        _dbSet = context.Set<BookReview>();
    }

    public async Task CreateBookReviewAsync(BookReview review)
    {
        await _dbSet.AddAsync(review);
        await _context.SaveChangesAsync();
    }

    public async Task<BookReviewResponseDTO?> GetCurrentUserBookReviewAsync(string userId, string bookId)
    {
        return await _dbSet.AsNoTracking()
                            .Where(br => br.UserId == userId && br.BookId == bookId)
                            .ProjectTo<BookReviewResponseDTO>(_mapper.ConfigurationProvider)
                            .FirstOrDefaultAsync();
    }

    public async Task<Page<BookReviewResponseDTO>> GetLatestBookReviewsAsync(string bookId, int pageIndex = 1, int pageSize = 5)
    {
        var query = _dbSet.AsNoTracking()
                            .Where(br => br.BookId == bookId)
                            .OrderByDescending(br => br.CreatedAt);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query.Skip((pageIndex - 1) * pageSize)
                                .Take(pageSize)
                                .ProjectTo<BookReviewResponseDTO>(_mapper.ConfigurationProvider)
                                .ToListAsync();

        return new Page<BookReviewResponseDTO>(items, pageIndex, totalPages);
    }

    public async Task<Page<BookReviewResponseDTO>> GetLatestBookReviewsByUserAsync(string userId, int pageIndex = 1, int pageSize = 5)
    {
        var query = _dbSet.AsNoTracking()
                            .Where(br => br.UserId == userId)
                            .OrderByDescending(br => br.CreatedAt);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query.Skip((pageIndex - 1) * pageSize)
                                .Take(pageSize)
                                .ProjectTo<BookReviewResponseDTO>(_mapper.ConfigurationProvider)
                                .ToListAsync();

        return new Page<BookReviewResponseDTO>(items, pageIndex, totalPages);
    }

    public async Task DeleteBookReviewAsync(string userId, string bookId)
    {
        _dbSet.Remove(new BookReview { UserId = userId, BookId = bookId });
        await _context.SaveChangesAsync();
    }

}
