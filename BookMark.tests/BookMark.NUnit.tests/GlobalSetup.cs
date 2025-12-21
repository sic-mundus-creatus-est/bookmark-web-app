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
        await CreateRegularUsersAsync(services);
        await CreateBookReviewsAsync(services);
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
            new Genre {
                Id = "fantasy",
                Name = "Fantasy",
                Description = "Fantasy explores imaginary worlds filled with magic, myths, and epic struggles. It often focuses on quests and legendary heroes."
            },
            new Genre {
                Id = "science_fiction",
                Name = "Science Fiction",
                Description = "Science fiction speculates about future technologies and societies. It frequently explores ethical and philosophical consequences."
            },
            new Genre {
                Id = "dystopian",
                Name = "Dystopian",
                Description = "Dystopian fiction depicts oppressive or decaying societies. These stories often warn against authoritarianism and loss of freedom."
            },
            new Genre {
                Id = "psychological",
                Name = "Psychological",
                Description = "Psychological fiction explores the inner workings of the human mind. It often emphasizes perception, trauma, and moral ambiguity."
            },
            new Genre {
                Id = "mystery",
                Name = "Mystery",
                Description = "Mystery stories revolve around investigations and hidden truths. They challenge readers to uncover secrets."
            },
            new Genre {
                Id = "horror",
                Name = "Horror",
                Description = "Horror fiction aims to evoke fear and unease. It may involve the supernatural, violence, or existential dread."
            },
            new Genre {
                Id = "literary_fiction",
                Name = "Literary Fiction",
                Description = "Literary fiction emphasizes character depth and thematic exploration. Style and meaning take priority over plot."
            },
            new Genre {
                Id = "thriller",
                Name = "Thriller",
                Description = "Thrillers are suspense-driven stories with high stakes. They focus on danger, urgency, and tension."
            },
            new Genre {
                Id = "philosophical",
                Name = "Philosophical",
                Description = "Philosophical fiction explores questions of existence, morality, and meaning. It often challenges the reader intellectually."
            },
            new Genre {
                Id = "political",
                Name = "Political",
                Description = "Political fiction examines power, ideology, and governance. It often critiques real-world systems."
            },
            new Genre {
                Id = "adventure",
                Name = "Adventure",
                Description = "Adventure fiction focuses on exploration, danger, and discovery. Stories emphasize journeys and excitement."
            }
        );

        // ------------------------------
        // AUTHORS
        // ------------------------------
        db.Authors.AddRange(
            new Author { Id="tolkien", Name="J. R. R. Tolkien", BirthYear=1892, DeathYear=1973,
                Biography="An English writer who defined modern fantasy. His Middle-earth legendarium is foundational to the genre." },

            new Author { Id="asimov", Name="Isaac Asimov", BirthYear=1920, DeathYear=1992,
                Biography="A prolific science fiction author and scientist. He popularized hard science fiction and grand future histories." },

            new Author { Id="strugatsky", Name="Arkady & Boris Strugatsky", BirthYear=1925, DeathYear=2012,
                Biography="Soviet science fiction writers known for philosophical and socially critical works." },

            new Author { Id="murakami", Name="Haruki Murakami", BirthYear=1949,
                Biography="A Japanese novelist known for surreal narratives and introspective themes." },

            new Author { Id="king", Name="Stephen King", BirthYear=1947,
                Biography="One of the most influential horror writers of all time. His work blends fear with deep human emotion." },

            new Author { Id="orwell", Name="George Orwell", BirthYear=1903, DeathYear=1950,
                Biography="An English writer whose work critiques authoritarianism, propaganda, and political control." },

            new Author { Id="bradbury", Name="Ray Bradbury", BirthYear=1920, DeathYear=2012,
                Biography="An American author known for poetic science fiction and cautionary tales." },

            new Author { Id="herbert", Name="Frank Herbert", BirthYear=1920, DeathYear=1986,
                Biography="A science fiction author best known for the Dune series, blending ecology and politics." },

            new Author { Id="gibson", Name="William Gibson", BirthYear=1948,
                Biography="A pioneer of cyberpunk fiction who envisioned cyberspace before the internet era." },

            // Comics
            new Author { Id="moore", Name="Alan Moore", BirthYear=1953,
                Biography="A British writer who transformed comics into serious literature." },

            new Author { Id="gibbons", Name="Dave Gibbons", BirthYear=1949,
                Biography="A British comic artist best known for his work on Watchmen." },

            new Author { Id="miller", Name="Frank Miller", BirthYear=1957,
                Biography="An American comic creator known for gritty, noir-inspired storytelling." },

            new Author { Id="snyder", Name="Scott Snyder", BirthYear=1976,
                Biography="A modern comic writer known for horror and superhero reinventions." },

            // Manga
            new Author { Id="urasawa", Name="Naoki Urasawa", BirthYear=1960,
                Biography="A Japanese manga artist celebrated for psychological thrillers." },

            new Author { Id="miura", Name="Kentaro Miura", BirthYear=1966, DeathYear=2021,
                Biography="A legendary manga artist known for dark fantasy epics." },

            new Author { Id="oda", Name="Eiichiro Oda", BirthYear=1975,
                Biography="The creator of one of the best-selling manga series in history." },

            new Author { Id="isayama", Name="Hajime Isayama", BirthYear=1986,
                Biography="A manga creator known for morally complex, dystopian storytelling." },
            
            new Author { Id = "eliot", Name = "George Eliot" }
        );

        // ------------------------------
        // BOOKS
        // ------------------------------
        db.Books.AddRange(
            // Tolkien
            new Book { Id="lotr-fellowship", Title="The Fellowship of the Ring", OriginalLanguage="English", PageCount=423, PublicationYear=1954, BookTypeId="book",
                Description="The first part of an epic fantasy journey. A small fellowship sets out to destroy a powerful ring." },
            new Book { Id="lotr-two-towers", Title="The Two Towers", OriginalLanguage="English", PageCount=352, PublicationYear=1954, BookTypeId="book",
                Description="The fellowship is scattered as war spreads across Middle-earth." },
            new Book { Id="lotr-return", Title="The Return of the King", OriginalLanguage="English", PageCount=416, PublicationYear=1955, BookTypeId="book",
                Description="The final confrontation decides the fate of Middle-earth." },
            new Book { Id="hobbit", Title="The Hobbit", OriginalLanguage="English", PageCount=310, PublicationYear=1937, BookTypeId="book",
                Description="Bilbo Baggins is drawn into an unexpected adventure." },

            // Sci-Fi
            new Book { Id="foundation", Title="Foundation", OriginalLanguage="English", PageCount=255, PublicationYear=1951, BookTypeId="book",
                Description="A mathematician predicts the fall of a galactic empire." },
            new Book { Id="foundation-empire", Title="Foundation and Empire", OriginalLanguage="English", PageCount=247, PublicationYear=1952, BookTypeId="book",
                Description="The Foundation faces powerful enemies." },
            new Book { Id="roadside-picnic", Title="Roadside Picnic", OriginalLanguage="Russian", PageCount=145, PublicationYear=1972, BookTypeId="book",
                Description="Alien visitation leaves dangerous zones behind." },
            new Book { Id="dune", Title="Dune", OriginalLanguage="English", PageCount=412, PublicationYear=1965, BookTypeId="book",
                Description="Politics, religion, and ecology collide on a desert planet." },
            new Book { Id="neuromancer", Title="Neuromancer", OriginalLanguage="English", PageCount=271, PublicationYear=1984, BookTypeId="book",
                Description="A hacker is pulled into a dangerous digital conspiracy." },

            // Dystopian / Lit
            new Book { Id="1984", Title="1984", OriginalLanguage="English", PageCount=328, PublicationYear=1949, BookTypeId="book",
                Description="A totalitarian regime controls truth and thought." },
            new Book { Id="animal-farm", Title="Animal Farm", OriginalLanguage="English", PageCount=112, PublicationYear=1945, BookTypeId="book",
                Description="A political allegory about power and corruption." },
            new Book { Id="fahrenheit-451", Title="Fahrenheit 451", OriginalLanguage="English", PageCount=194, PublicationYear=1953, BookTypeId="book",
                Description="Books are banned and burned in a controlled society." },
            new Book { Id="1q84", Title="1Q84", OriginalLanguage="Japanese", PageCount=928, PublicationYear=2009, BookTypeId="book",
                Description="Parallel realities slowly intertwine." },
            new Book { Id="it", Title="IT", OriginalLanguage="English", PageCount=1138, PublicationYear=1986, BookTypeId="book",
                Description="An ancient evil terrorizes a small town." },

            // COMICS
            new Book { Id="watchmen", Title="Watchmen", OriginalLanguage="English", PageCount=416, PublicationYear=1986, BookTypeId="comic",
                Description="A dark deconstruction of superheroes and power." },
            new Book { Id="v-for-vendetta", Title="V for Vendetta", OriginalLanguage="English", PageCount=296, PublicationYear=1988, BookTypeId="comic",
                Description="A masked revolutionary fights a fascist state." },
            new Book { Id="dark-knight", Title="The Dark Knight Returns", OriginalLanguage="English", PageCount=224, PublicationYear=1986, BookTypeId="comic",
                Description="An aging Batman returns in a grim Gotham." },
            new Book { Id="court-owls", Title="Batman: The Court of Owls", OriginalLanguage="English", PageCount=176, PublicationYear=2012, BookTypeId="comic",
                Description="Batman uncovers a secret society ruling Gotham." },

            // MANGA
            new Book { Id="monster", Title="Monster", OriginalLanguage="Japanese", PageCount=200, PublicationYear=1994, BookTypeId="manga",
                Description="A doctor hunts a former patient turned killer." },
            new Book { Id="pluto", Title="Pluto", OriginalLanguage="Japanese", PageCount=220, PublicationYear=2003, BookTypeId="manga",
                Description="A dark sci-fi reinterpretation of Astro Boy." },
            new Book { Id="berserk", Title="Berserk", OriginalLanguage="Japanese", PageCount=240, PublicationYear=1989, BookTypeId="manga",
                Description="A brutal dark fantasy of fate and revenge." },
            new Book { Id="one-piece", Title="One Piece", OriginalLanguage="Japanese", PageCount=220, PublicationYear=1997, BookTypeId="manga",
                Description="Pirates search for the ultimate treasure." },
            new Book { Id="attack-titan", Title="Attack on Titan", OriginalLanguage="Japanese", PageCount=200, PublicationYear=2009, BookTypeId="manga",
                Description="Humanity fights extinction behind massive walls." }
        );

        db.SaveChanges();

        // ------------------------------
        // BOOK -> GENRES
        // ------------------------------
        db.BookGenres.AddRange(
            new BookGenre { BookId="lotr-fellowship", GenreId="fantasy" },
            new BookGenre { BookId="lotr-fellowship", GenreId="adventure" },

            new BookGenre { BookId="lotr-two-towers", GenreId="fantasy" },
            new BookGenre { BookId="lotr-two-towers", GenreId="adventure" },

            new BookGenre { BookId="lotr-return", GenreId="fantasy" },
            new BookGenre { BookId="lotr-return", GenreId="adventure" },

            new BookGenre { BookId="hobbit", GenreId="fantasy" },
            new BookGenre { BookId="hobbit", GenreId="adventure" },

            new BookGenre { BookId="foundation", GenreId="science_fiction" },
            new BookGenre { BookId="foundation", GenreId="philosophical" },

            new BookGenre { BookId="foundation-empire", GenreId="science_fiction" },
            new BookGenre { BookId="foundation-empire", GenreId="political" },

            new BookGenre { BookId="roadside-picnic", GenreId="science_fiction" },
            new BookGenre { BookId="roadside-picnic", GenreId="philosophical" },

            new BookGenre { BookId="dune", GenreId="science_fiction" },
            new BookGenre { BookId="dune", GenreId="political" },
            new BookGenre { BookId="dune", GenreId="philosophical" },

            new BookGenre { BookId="neuromancer", GenreId="science_fiction" },
            new BookGenre { BookId="neuromancer", GenreId="thriller" },

            new BookGenre { BookId="1984", GenreId="dystopian" },
            new BookGenre { BookId="1984", GenreId="political" },

            new BookGenre { BookId="animal-farm", GenreId="dystopian" },
            new BookGenre { BookId="animal-farm", GenreId="political" },

            new BookGenre { BookId="fahrenheit-451", GenreId="dystopian" },
            new BookGenre { BookId="fahrenheit-451", GenreId="science_fiction" },

            new BookGenre { BookId="1q84", GenreId="literary_fiction" },
            new BookGenre { BookId="1q84", GenreId="psychological" },

            new BookGenre { BookId="it", GenreId="horror" },
            new BookGenre { BookId="it", GenreId="thriller" },

            new BookGenre { BookId="watchmen", GenreId="science_fiction" },
            new BookGenre { BookId="watchmen", GenreId="thriller" },
            new BookGenre { BookId="watchmen", GenreId="political" },

            new BookGenre { BookId="v-for-vendetta", GenreId="dystopian" },
            new BookGenre { BookId="v-for-vendetta", GenreId="political" },

            new BookGenre { BookId="dark-knight", GenreId="thriller" },
            new BookGenre { BookId="dark-knight", GenreId="psychological" },

            new BookGenre { BookId="court-owls", GenreId="thriller" },
            new BookGenre { BookId="court-owls", GenreId="mystery" },

            new BookGenre { BookId="monster", GenreId="thriller" },
            new BookGenre { BookId="monster", GenreId="psychological" },

            new BookGenre { BookId="pluto", GenreId="science_fiction" },
            new BookGenre { BookId="pluto", GenreId="psychological" },

            new BookGenre { BookId="berserk", GenreId="fantasy" },
            new BookGenre { BookId="berserk", GenreId="horror" },

            new BookGenre { BookId="one-piece", GenreId="fantasy" },
            new BookGenre { BookId="one-piece", GenreId="adventure" },

            new BookGenre { BookId="attack-titan", GenreId="dystopian" },
            new BookGenre { BookId="attack-titan", GenreId="horror" },
            new BookGenre { BookId="attack-titan", GenreId="political" }
        );

        // ------------------------------
        // BOOK -> AUTHORS
        // ------------------------------
        db.BookAuthors.AddRange(
            new BookAuthor { BookId="lotr-fellowship", AuthorId="tolkien" },
            new BookAuthor { BookId="lotr-two-towers", AuthorId="tolkien" },
            new BookAuthor { BookId="lotr-return", AuthorId="tolkien" },
            new BookAuthor { BookId="hobbit", AuthorId="tolkien" },

            new BookAuthor { BookId="foundation", AuthorId="asimov" },
            new BookAuthor { BookId="foundation-empire", AuthorId="asimov" },

            new BookAuthor { BookId="roadside-picnic", AuthorId="strugatsky" },
            new BookAuthor { BookId="dune", AuthorId="herbert" },
            new BookAuthor { BookId="neuromancer", AuthorId="gibson" },

            new BookAuthor { BookId="1984", AuthorId="orwell" },
            new BookAuthor { BookId="animal-farm", AuthorId="orwell" },
            new BookAuthor { BookId="fahrenheit-451", AuthorId="bradbury" },
            new BookAuthor { BookId="1q84", AuthorId="murakami" },
            new BookAuthor { BookId="it", AuthorId="king" },

            new BookAuthor { BookId="watchmen", AuthorId="moore" },
            new BookAuthor { BookId="watchmen", AuthorId="gibbons" },
            new BookAuthor { BookId="v-for-vendetta", AuthorId="moore" },
            new BookAuthor { BookId="dark-knight", AuthorId="miller" },
            new BookAuthor { BookId="court-owls", AuthorId="snyder" },

            new BookAuthor { BookId="monster", AuthorId="urasawa" },
            new BookAuthor { BookId="pluto", AuthorId="urasawa" },
            new BookAuthor { BookId="berserk", AuthorId="miura" },
            new BookAuthor { BookId="one-piece", AuthorId="oda" },
            new BookAuthor { BookId="attack-titan", AuthorId="isayama" }
        );

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

    private static async Task CreateRegularUsersAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<User>>();

        var users = new[]
        {
            new { Username = "alice", Email = "alice@example.com" },
            new { Username = "bob", Email = "bob@example.com" },
            new { Username = "charlie", Email = "charlie@example.com" }
        };

        const string defaultPassword = "User123!";

        foreach (var u in users)
        {
            if (await userManager.FindByEmailAsync(u.Email) != null)
                continue;

            var user = new User
            {
                UserName = u.Username,
                DisplayName = u.Username,
                Email = u.Email,
            };

            var result = await userManager.CreateAsync(user, defaultPassword);

            if (!result.Succeeded)
            {
                throw new Exception(
                    $"Failed to create user {u.Username}: " +
                    string.Join(", ", result.Errors.Select(e => e.Description))
                );
            }

            await userManager.AddToRoleAsync(user, UserRoles.RegularUser);
        }
    }

    private static async Task CreateBookReviewsAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        var alice = await userManager.FindByNameAsync("alice");
        var bob = await userManager.FindByNameAsync("bob");
        var charlie = await userManager.FindByNameAsync("charlie");

        if (alice == null || bob == null || charlie == null)
            throw new Exception("Regular users must exist before creating reviews.");

        if (db.BookReviews.Any())
            return;

        var reviews = new List<BookReview>
        {
            // -------------------------------
            // LOTR - all users
            // -------------------------------
            new BookReview {
                UserId = alice.Id, BookId = "lotr-fellowship", Rating = 4,
                Content = "Tolkien’s world-building is immersive and rich, with cultures and languages that feel real. Some parts drag a bit, but the sense of adventure keeps me hooked.",
                CreatedAt = DateTime.Now.AddDays(-20)
            },
            new BookReview {
                UserId = bob.Id, BookId = "lotr-fellowship", Rating = 3,
                Content = "The story is epic, but I found the pacing slow and some chapters overly detailed. Still, the friendships and heroism are compelling.",
                CreatedAt = DateTime.Now.AddDays(-19)
            },
            new BookReview {
                UserId = charlie.Id, BookId = "lotr-fellowship", Rating = 5,
                Content = "Every time I read it, I discover something new. The landscapes, the cultures, and the characters are beautifully crafted. Truly a classic.",
                CreatedAt = DateTime.Now.AddDays(-18)
            },

            // -------------------------------
            // Dune - all users
            // -------------------------------
            new BookReview {
                UserId = alice.Id, BookId = "dune", Rating = 3,
                Content = "The political and ecological themes are fascinating, but the narrative is dense and hard to follow at times.",
                CreatedAt = DateTime.Now.AddDays(-17)
            },
            new BookReview {
                UserId = bob.Id, BookId = "dune", Rating = 4,
                Content = "I enjoyed the complexity and scope of the universe, though some characters felt underdeveloped. The story is intellectually engaging.",
                CreatedAt = DateTime.Now.AddDays(-16)
            },
            new BookReview {
                UserId = charlie.Id, BookId = "dune", Rating = 2,
                Content = "I struggled with the massive exposition and political scheming. It has moments of brilliance but can feel inaccessible.",
                CreatedAt = DateTime.Now.AddDays(-15)
            },

            // -------------------------------
            // Watchmen - all users
            // -------------------------------
            new BookReview {
                UserId = alice.Id, BookId = "watchmen", Rating = 4,
                Content = "A dark and thought-provoking story that deconstructs the superhero mythos. The narrative is clever and multilayered.",
                CreatedAt = DateTime.Now.AddDays(-14)
            },
            new BookReview {
                UserId = bob.Id, BookId = "watchmen", Rating = 5,
                Content = "One of the most important graphic novels ever written. The characters are morally complex, and the story unfolds brilliantly.",
                CreatedAt = DateTime.Now.AddDays(-13)
            },
            new BookReview {
                UserId = charlie.Id, BookId = "watchmen", Rating = 3,
                Content = "Technically impressive with striking visuals, but I found it emotionally distant at times.",
                CreatedAt = DateTime.Now.AddDays(-12)
            },

            // -------------------------------
            // Monster - all users
            // -------------------------------
            new BookReview {
                UserId = alice.Id, BookId = "monster", Rating = 4,
                Content = "A gripping psychological thriller. The suspense builds gradually, and the moral questions make it compelling.",
                CreatedAt = DateTime.Now.AddDays(-11)
            },
            new BookReview {
                UserId = bob.Id, BookId = "monster", Rating = 5,
                Content = "Every chapter increases the tension and the stakes. Urasawa’s storytelling is phenomenal, and the characters are well-rounded.",
                CreatedAt = DateTime.Now.AddDays(-10)
            },
            new BookReview {
                UserId = charlie.Id, BookId = "monster", Rating = 3,
                Content = "Interesting concept and plot twists, but some parts felt repetitive. Still worth reading for the suspense.",
                CreatedAt = DateTime.Now.AddDays(-9)
            },

            // -------------------------------
            // 1984 - all users
            // -------------------------------
            new BookReview {
                UserId = alice.Id, BookId = "1984", Rating = 5,
                Content = "Orwell’s vision is chilling and profoundly relevant. I felt a strong sense of dread reading it, which is a testament to its power.",
                CreatedAt = DateTime.Now.AddDays(-8)
            },
            new BookReview {
                UserId = bob.Id, BookId = "1984", Rating = 4,
                Content = "A disturbing story about control and surveillance. The writing is clear, but some passages are dense and heavy.",
                CreatedAt = DateTime.Now.AddDays(-7)
            },
            new BookReview {
                UserId = charlie.Id, BookId = "1984", Rating = 3,
                Content = "The concept is brilliant, yet I found the emotional impact uneven. Still a book everyone should read.",
                CreatedAt = DateTime.Now.AddDays(-6)
            },

            // -------------------------------
            // Fahrenheit 451 - some shared
            // -------------------------------
            new BookReview {
                UserId = alice.Id, BookId = "fahrenheit-451", Rating = 3,
                Content = "Interesting take on censorship, though I wanted more character depth and world details.",
                CreatedAt = DateTime.Now.AddDays(-5)
            },
            new BookReview {
                UserId = bob.Id, BookId = "fahrenheit-451", Rating = 4,
                Content = "Short but impactful. The themes resonate strongly even today.",
                CreatedAt = DateTime.Now.AddDays(-4)
            },

            // -------------------------------
            // One Piece - some shared
            // -------------------------------
            new BookReview {
                UserId = bob.Id, BookId = "one-piece", Rating = 3,
                Content = "Fun adventure with charming characters, but the story is very long and slow at times.",
                CreatedAt = DateTime.Now.AddDays(-3)
            },
            new BookReview {
                UserId = charlie.Id, BookId = "one-piece", Rating = 4,
                Content = "A delightful and creative world. Some arcs drag, but overall very enjoyable.",
                CreatedAt = DateTime.Now.AddDays(-2)
            },

            // -------------------------------
            // Unique
            // -------------------------------
            new BookReview {
                UserId = alice.Id, BookId = "1q84", Rating = 3,
                Content = "Murakami creates a strange and surreal atmosphere, which I appreciated, but the pacing and length made it harder to stay focused.",
                CreatedAt = DateTime.Now.AddDays(-1)
            },

            new BookReview {
                UserId = bob.Id, BookId = "animal-farm", Rating = 4,
                Content = "Simple and concise allegory with a powerful message. Easy to read but thought-provoking.",
                CreatedAt = DateTime.Now
            },

            new BookReview {
                UserId = charlie.Id, BookId = "berserk", Rating = 4,
                Content = "Visually stunning and emotionally intense. Not for the faint-hearted, but a masterpiece in dark fantasy manga.",
                CreatedAt = DateTime.Now
            }
        };

        db.BookReviews.AddRange(reviews);
        await db.SaveChangesAsync();
    }



}
