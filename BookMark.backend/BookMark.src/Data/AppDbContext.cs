using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

using BookMark.Models.Domain;
using BookMark.Models.Relationships;

namespace BookMark.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BookAuthor>()
            .HasKey(ba => new { ba.BookId, ba.AuthorId });
        modelBuilder.Entity<BookAuthor>()
            .HasOne(ba => ba.Book)
            .WithMany(b => b.BookAuthors) // Navigation Property in Book
            .HasForeignKey(ba => ba.BookId) //Foreign Key
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<BookAuthor>()
            .HasOne(ba => ba.Author)
            .WithMany(a => a.BookAuthors) // Navigation Property in Author
            .HasForeignKey(ba => ba.AuthorId) //Foreign Key
            .OnDelete(DeleteBehavior.Cascade);
        // Explicit configuration of the join table name
        modelBuilder.Entity<BookAuthor>().ToTable("BookAuthors");

        modelBuilder.Entity<Book>()
        .Navigation(b => b.BookAuthors)
        .AutoInclude();

        modelBuilder.Entity<BookAuthor>()
            .Navigation(ba => ba.Author)
            .AutoInclude();
    }

    public override int SaveChanges()
    {
        foreach (var entry in ChangeTracker.Entries<IModel>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.Now;
            }
        }

        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<IModel>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.Now;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }


    public DbSet<Book> Books { get; set; }
    public DbSet<Author> Authors { get; set; }
    public DbSet<BookAuthor> BookAuthors { get; set; }

}
