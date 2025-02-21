using BookMark.backend.Data;
using BookMark.backend.DTOs;
using BookMark.backend.Models;

namespace BookMark.backend.Services.Repositories;

public class BookRepository : BaseRepository<Book, BookDTO>
{
    public BookRepository(DataContext context) : base(context) { }
}
