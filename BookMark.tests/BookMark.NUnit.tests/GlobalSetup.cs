using BookMark.Data;
using BookMark.Models.Domain;
using BookMark.Models.Relationships;
using BookMark.Models.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.NUnit.tests;

[SetUpFixture]
public class GlobalTestSetup
{
    public static WebApplicationFactory<Program> Factory;

    [OneTimeSetUp]
    public async Task RunBeforeAnyTests()
    {
        Factory = new WebApplicationFactory<Program>();

        using var scope = Factory.Services.CreateScope();
        var services = scope.ServiceProvider;
        await EnsureDatabaseCleanAndSeeded(services);
    }

    [OneTimeTearDown]
    public void RunAfterAllTests()
    {
        Factory?.Dispose();
    }

    private static async Task EnsureDatabaseCleanAndSeeded(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();

        db.Database.EnsureDeleted();

        db.Database.EnsureCreated();

        SeedDatabase(db);

        await CreateUserRolesAsync(services);
        await CreateAdminUserAsync(services);
    }

    private static void SeedDatabase(AppDbContext db)
    {
        // ------------------------------
        // BOOK TYPES
        // ------------------------------
        db.BookTypes.AddRange(
            new BookType { Id = "book", Name = "Book" },
            new BookType { Id = "comic", Name = "Comic" },
            new BookType { Id = "manga", Name = "Manga" }
        );

        // ------------------------------
        // GENRES
        // ------------------------------
        db.Genres.AddRange(
            new Genre { Id = "fantasy", Name = "Fantasy" },
            new Genre { Id = "science_fiction", Name = "Science Fiction" },
            new Genre { Id = "dystopian", Name = "Dystopian" },
            new Genre { Id = "psychological", Name = "Psychological" },
            new Genre { Id = "mystery", Name = "Mystery" },
            new Genre { Id = "horror", Name = "Horror" },
            new Genre { Id = "literary_fiction", Name = "Literary Fiction" },
            new Genre { Id = "thriller", Name = "Thriller" }
        );

        // ------------------------------
        // AUTHORS
        // ------------------------------
        db.Authors.AddRange(
            new Author { Id = "tolkien", Name = "J. R. R. Tolkien" },
            new Author { Id = "asimov", Name = "Isaac Asimov" },
            new Author { Id = "strugatsky", Name = "Arkady & Boris Strugatsky" },
            new Author { Id = "murakami", Name = "Haruki Murakami" },
            new Author { Id = "moore", Name = "Alan Moore" },
            new Author { Id = "urasawa", Name = "Naoki Urasawa" },
            new Author { Id = "king", Name = "Stephen King" },
            new Author { Id = "orwell", Name = "George Orwell" },
            new Author { Id = "bradbury", Name = "Ray Bradbury" },
            new Author { Id = "martin", Name = "George R. R. Martin" },
            new Author { Id = "eliot", Name = "George Eliot" }
        );

        // ------------------------------
        // BOOKS
        // ------------------------------
        var books = new List<Book>
        {
            new Book {
                Id = "lotr-fellowship",
                Title = "The Fellowship of the Ring",
                OriginalLanguage = "English",
                PageCount = 423,
                PublicationYear = 1954,
                Description = "The first volume of Tolkien's epic fantasy trilogy.",
                BookTypeId = "book"
            },
            new Book {
                Id = "lotr-return",
                Title = "The Return of the King",
                OriginalLanguage = "English",
                PageCount = 416,
                PublicationYear = 1955,
                Description = "The conclusion of The Lord of the Rings.",
                BookTypeId = "book"
            },
            new Book {
                Id = "foundation",
                Title = "Foundation",
                OriginalLanguage = "English",
                PageCount = 255,
                PublicationYear = 1951,
                Description = "Asimov's seminal science fiction novel.",
                BookTypeId = "book"
            },
            new Book {
                Id = "roadside-picnic",
                Title = "Roadside Picnic",
                OriginalLanguage = "Russian",
                PageCount = 145,
                PublicationYear = 1972,
                Description = "A science fiction classic by the Strugatsky brothers.",
                BookTypeId = "book"
            },
            new Book {
                Id = "1q84",
                Title = "1Q84",
                OriginalLanguage = "Japanese",
                PageCount = 928,
                PublicationYear = 2009,
                Description = "Murakami's surreal alternate-reality epic.",
                BookTypeId = "book"
            },
            new Book {
                Id = "watchmen",
                Title = "Watchmen",
                OriginalLanguage = "English",
                PageCount = 416,
                PublicationYear = 1986,
                Description = "The groundbreaking graphic novel by Alan Moore.",
                BookTypeId = "comic"
            },
            new Book {
                Id = "monster",
                Title = "Monster",
                OriginalLanguage = "Japanese",
                PageCount = 200,
                PublicationYear = 1994,
                Description = "Naoki Urasawa's thriller manga.",
                BookTypeId = "manga"
            },
            new Book {
                Id = "1984",
                Title = "1984",
                OriginalLanguage = "English",
                PageCount = 328,
                PublicationYear = 1949,
                Description = "Orwell's dystopian classic.",
                BookTypeId = "book"
            },
            new Book {
                Id = "fahrenheit-451",
                Title = "Fahrenheit 451",
                OriginalLanguage = "English",
                PageCount = 194,
                PublicationYear = 1953,
                Description = "Ray Bradbury's dystopian masterpiece.",
                BookTypeId = "book"
            },
            new Book {
                Id = "it",
                Title = "IT",
                OriginalLanguage = "English",
                PageCount = 1138,
                PublicationYear = 1986,
                Description = "Stephen King's iconic horror novel.",
                BookTypeId = "book"
            }
        };

        db.Books.AddRange(books);
        db.SaveChanges();

        // ------------------------------
        // BOOK → GENRES
        // ------------------------------
        var bookGenres = new List<BookGenre>
        {
            new BookGenre { BookId = "lotr-fellowship", GenreId = "fantasy" },
            new BookGenre { BookId = "lotr-return", GenreId = "fantasy" },
            new BookGenre { BookId = "foundation", GenreId = "science_fiction" },
            new BookGenre { BookId = "roadside-picnic", GenreId = "science_fiction" },
            new BookGenre { BookId = "1q84", GenreId = "literary_fiction" },
            new BookGenre { BookId = "1q84", GenreId = "psychological" },
            new BookGenre { BookId = "watchmen", GenreId = "thriller" },
            new BookGenre { BookId = "watchmen", GenreId = "science_fiction" },
            new BookGenre { BookId = "monster", GenreId = "thriller" },
            new BookGenre { BookId = "1984", GenreId = "dystopian" },
            new BookGenre { BookId = "fahrenheit-451", GenreId = "dystopian" },
            new BookGenre { BookId = "it", GenreId = "horror" }
        };

        db.BookGenres.AddRange(bookGenres);

        // ------------------------------
        // BOOK → AUTHORS
        // ------------------------------
        var bookAuthors = new List<BookAuthor>
        {
            new BookAuthor { BookId = "lotr-fellowship", AuthorId = "tolkien" },
            new BookAuthor { BookId = "lotr-return", AuthorId = "tolkien" },
            new BookAuthor { BookId = "foundation", AuthorId = "asimov" },
            new BookAuthor { BookId = "roadside-picnic", AuthorId = "strugatsky" },
            new BookAuthor { BookId = "1q84", AuthorId = "murakami" },
            new BookAuthor { BookId = "watchmen", AuthorId = "moore" },
            new BookAuthor { BookId = "monster", AuthorId = "urasawa" },
            new BookAuthor { BookId = "1984", AuthorId = "orwell" },
            new BookAuthor { BookId = "fahrenheit-451", AuthorId = "bradbury" },
            new BookAuthor { BookId = "it", AuthorId = "king" }
        };

        db.BookAuthors.AddRange(bookAuthors);

        db.SaveChanges();
    }

    private static async Task CreateUserRolesAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        string[] roles = [UserRoles.Admin, UserRoles.RegularUser];

        foreach (var role in roles)
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
    }

    private static async Task CreateAdminUserAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<User>>();

        string adminUsername = "admin";
        string adminEmail = "admin@example.com";
        string adminPassword = "Admin123!";

        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new User
            {
                DisplayName = adminUsername,
                UserName = adminUsername,
                Email = adminEmail,
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, UserRoles.Admin);
                await userManager.AddToRoleAsync(adminUser, UserRoles.RegularUser);
            }
            else
                throw new Exception($"Failed to create default admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
    }

}
