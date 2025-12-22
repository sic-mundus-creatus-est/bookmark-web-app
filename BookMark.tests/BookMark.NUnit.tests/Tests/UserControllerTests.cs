using System.Security.Claims;
using System.Text.Json;
using BookMark.Controllers;
using BookMark.Data.Repositories;
using BookMark.Models;
using BookMark.Models.Domain;
using BookMark.Models.DTOs;
using BookMark.Models.Relationships;
using BookMark.Models.Roles;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.NUnit.tests;

[TestFixture]
public class UserControllerTests
{
    private IServiceScope _scope;
    private UserController _controller;

    private static UserResponseDTO? _userCreatedFromTest;
    
    [SetUp]
    public void Setup()
    {
        _scope = GlobalTestSetup.Factory.Services.CreateScope();
        _controller = _scope.ServiceProvider.GetRequiredService<UserController>();
    }

    [TearDown]
    public void TearDown()
    {
        _scope.Dispose();
    }

#region CREATE

    [Test, Order(1)]
    public async Task Create_ReturnsCreated_WhenSignUpDataIsUniqueAndValid()
    {
        var signUpData = new UserCreateDTO
        {
            DisplayName = "User 67",
            Username = "user67",
            Email = "user67@example.com",
            Password = "Test67!",
            ConfirmPassword = "Test67!"
        };

        var result = (await _controller.Create(signUpData)).Result as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var createdUser = result.Value as UserResponseDTO;
        Assert.That(createdUser, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(createdUser.DisplayName, Is.EqualTo(signUpData.DisplayName));
            Assert.That(createdUser.Username, Is.EqualTo(signUpData.Username));
            Assert.That(createdUser.Email, Is.EqualTo(signUpData.Email));
            Assert.That(createdUser.AboutMe, Is.Null);
        });

        _userCreatedFromTest = createdUser;
    }

    [Test]
    public async Task Create_ReturnsConflict_WhenUsernameAlreadyExists()
    {
        var signUpData = new UserCreateDTO
        {
            DisplayName = "Test",
            Username = "admin",             // exists in seeded DB
            Email = "another@mail.com",
            Password = "Test123!",
            ConfirmPassword = "Test123!"
        };

        var result = (await _controller.Create(signUpData)).Result as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status409Conflict));
    }

    [Test]
    public async Task Create_ReturnsConflict_WhenEmailAlreadyExists()
    {
        var signUpData = new UserCreateDTO
        {
            DisplayName = "Test",
            Username = "unique_username",
            Email = "admin@example.com",      // exists in seeded DB
            Password = "Test123!",
            ConfirmPassword = "Test123!"
        };

        var result = (await _controller.Create(signUpData)).Result as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status409Conflict));
    }

#endregion

#region SIGN-IN

    [Test, Order(2)]
    public async Task SignIn_ReturnsOk_WhenCredentialsAreValid()
    {
        var credentials = new UserCredentialsDTO
        {
            UsernameOrEmail = "user67",
            Password = "Test67!"
        };

        var result = await _controller.SignIn(credentials) as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var anonymous = result.Value!;
        var type = anonymous.GetType();

        string token = (string)type.GetProperty("token")!.GetValue(anonymous)!;
        DateTime expiration = (DateTime)type.GetProperty("expiration")!.GetValue(anonymous)!;

        Assert.Multiple(() =>
        {
            Assert.That(token, Is.Not.Null.And.Not.Empty);
            Assert.That(expiration, Is.GreaterThan(DateTime.UtcNow));
        });
    }

    [Test]
    public async Task SignIn_ReturnsUnauthorized_WhenPasswordIsInvalid()
    {
        var credentials = new UserCredentialsDTO
        {
            UsernameOrEmail = "admin",      // exists in seeded DB
            Password = "WrongPassword!"     // incorrect
        };

        var result = await _controller.SignIn(credentials) as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status401Unauthorized));
    }

    [Test]
    public async Task SignIn_ReturnsUnauthorized_WhenUserDoesNotExist()
    {
        var credentials = new UserCredentialsDTO
        {
            UsernameOrEmail = "this_user_does_not_exist",
            Password = "CreativePassword67!"
        };

        var result = await _controller.SignIn(credentials) as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status401Unauthorized));
    }

#endregion

#region UPDATE

    [Test, Order(3)]
    public async Task UpdateProfile_ReturnsOk_WhenUserIsAuthenticatedAndDataIsValid()
    {
        var update = new UserUpdateDTO
        {
            AboutMe = "Updated bio."
        };

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                ], "TestAuth"))
            }
        };

        var result = (await _controller.UpdateProfile(_userCreatedFromTest.Id, update)).Result as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var updatedUser = result.Value as UserResponseDTO;
        Assert.That(updatedUser, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(updatedUser.DisplayName, Is.EqualTo("User 67"));
            Assert.That(updatedUser.AboutMe, Is.EqualTo(update.AboutMe));
        });
    }

    [Test]
    public async Task UpdateProfile_ReturnsForbidden_WhenUserIsNotAuthenticated()
    {
        var update = new UserUpdateDTO
        {
            DisplayName = "New Name"
        };

        _controller.ControllerContext = new ControllerContext
        { // No user claims -> user is unauthorized
            HttpContext = new DefaultHttpContext()
        };

        var result = (await _controller.UpdateProfile(id: "does-not-matter-in-this-case", update)).Result as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
    }

    [Test]
    public async Task UpdateProfile_ReturnsBadRequest_WhenUserDoesNotExist()
    {
        var userId = "this-user-does-not-exist";
        var update = new UserUpdateDTO { AboutMe = "Will Fail" };

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, userId),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                ], "TestAuth"))
            }
        };

        var result = (await _controller.UpdateProfile(userId, update)).Result as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

#endregion

#region DELETE

    [Test, Order(12)]
    public async Task Delete_ReturnsForbidden_WhenRegularUserTriesToDeleteAnotherUser()
    {
        var userManager = _scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var userToTryToDelete = await userManager.FindByNameAsync("admin");

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser)
                ], "TestAuth"))
            }
        };

        // attempt to delete another user by a regular user created in a previous test
        var result = await _controller.Delete(userToTryToDelete!.Id) as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
    }

    [Test, Order(13)]
    public async Task Delete_ReturnsNoContent_WhenUserDeletesSelf()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser)
                ], "TestAuth"))
            }
        };

        var result = await _controller.Delete(_userCreatedFromTest.Id);
        Assert.That(((NoContentResult)result).StatusCode, Is.EqualTo(StatusCodes.Status204NoContent));
    }

    [Test]
    public async Task Delete_ReturnsBadRequest_WhenUserDoesNotExist()
    {
        var userToDeleteId = "this-user-does-not-exist";

        var userManager = _scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var admin = await userManager.FindByNameAsync("admin"); // this user will attempt the deletion

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, admin!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                    new Claim(ClaimTypes.Role, UserRoles.Admin)
                ], "TestAuth"))
            }
        };

        var result = await _controller.Delete(userToDeleteId) as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

#endregion

#region CREATE-BOOK-REVIEW

    [Test]
    public async Task CreateBookReview_ReturnsUnauthorized_WhenUserNotSignedIn()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        var reviewDto = new BookReviewCreateDTO { BookId = "does-not-matter-since-user-is-unauthorized", Rating = 5 };

        var result = (await _controller.CreateBookReview(reviewDto)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status401Unauthorized));
    }

    [Test, Order(4)]
    public async Task CreateBookReview_ReturnsCreatedReview_WhenAllDataIsValid()
    {
        var reviewData = new BookReviewCreateDTO
        {
            BookId = "1984",
            Rating = 5,
            Content = "Amazing book!"
        };

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                ], "TestAuth"))
            }
        };

        var result = (await _controller.CreateBookReview(reviewData)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status201Created));

        var savedReview = result.Value as BookReviewResponseDTO;
        Assert.That(savedReview, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(savedReview.User.Id, Is.EqualTo(_userCreatedFromTest.Id));
            Assert.That(savedReview.BookId, Is.EqualTo(reviewData.BookId));
            Assert.That(savedReview.Rating, Is.EqualTo(reviewData.Rating));
            Assert.That(savedReview.Content, Is.EqualTo(reviewData.Content));
        });
    }

    [Test, Order(5)]
    public async Task CreateBookReview_ReturnsConflict_WhenUserAlreadyReviewedTheBook()
    {
        var reviewData = new BookReviewCreateDTO
        {
            BookId = "1984", // already reviewed by the same user in the previous test, above
            Rating = 5,
            Content = "Amazing book!"
        };

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                ], "TestAuth"))
            }
        };

        var result = (await _controller.CreateBookReview(reviewData)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status409Conflict));
    }

    [Test, Order(6)]
    public async Task CreateBookReview_ReturnsBadRequest_WhenRatingAndContentAreMissing()
    {
        var reviewData = new BookReviewCreateDTO
        {
            BookId = "does-not-matter-since-other-data-is-invalid",
            Rating = null,
            Content = "   "
        };

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                ], "TestAuth"))
            }
        };

        var result = (await _controller.CreateBookReview(reviewData)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status400BadRequest));
    }

#endregion

#region GET-CURRENT-USER-BOOK-REVIEW

    [Test, Order(7)]
    public async Task GetCurrentUserBookReview_ReturnsOkAndReview_WhenUserReviewedBook()
    {
        var bookId = "1984";

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                ], "TestAuth"))
            }
        };

        var result = (await _controller.GetCurrentUserBookReview(bookId)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var review = result.Value as BookReviewResponseDTO;
        Assert.That(review, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(review.User.Id, Is.EqualTo(_userCreatedFromTest.Id));
            Assert.That(review.BookId, Is.EqualTo(bookId));
            Assert.That(review.Rating, Is.EqualTo(5));
            Assert.That(review.Content, Is.EqualTo("Amazing book!"));
        });
    }

    [Test]
    public async Task GetCurrentUserBookReview_ReturnsUnauthorized_WhenUserNotSignedIn()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        var bookId = "does-not-matter-since-user-is-unauthorized";

        var result = (await _controller.GetCurrentUserBookReview(bookId)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status401Unauthorized));
    }

    [Test]
    public async Task GetCurrentUserBookReview_ReturnsOkAndNull_WhenReviewOrBookDoesNotExist()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(
                    new ClaimsIdentity(
                    [
                        new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                        new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                    ], "TestAuth"))
            }
        };

        var result = (await _controller.GetCurrentUserBookReview(bookId: "this-book-does-not-exist")).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));
            Assert.That(result.Value, Is.Null);
        });
    }

#endregion

#region GET-LATEST-BOOK-REVIEWS

    [Test, Order(8)]
    public async Task GetLatestBookReviews_ReturnsLatestReviews_WhenBookExists()
    {
         var latestReview = new BookReviewCreateDTO
        {
            BookId = "watchmen",
            Content = "Latest Review!"
        };

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(
                    new ClaimsIdentity(
                    [
                        new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                        new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                    ], "TestAuth"))
            }
        };

        await _controller.CreateBookReview(latestReview);

        var result = (await _controller.GetLatestBookReviews(latestReview.BookId, pageIndex: 1, pageSize: 10)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = result.Value as Page<BookReviewResponseDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.That(page.Items, Is.Not.Null);
        Assert.That(page.Items, Has.Count.GreaterThanOrEqualTo(1));
        Assert.Multiple(() =>
        {
            Assert.That(page.Items[0].BookId, Is.EqualTo(latestReview.BookId));
            Assert.That(page.Items[0].Content, Is.EqualTo(latestReview.Content));
        });
    }

    [Test]
    public async Task GetLatestBookReviews_ReturnsEmptyPage_WhenNoReviewsExist()
    {
        var result = (await _controller.GetLatestBookReviews(bookId: "foundation", pageIndex: 1, pageSize: 10)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = result.Value as Page<BookReviewResponseDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(page.Items, Is.Empty);
            Assert.That(page.TotalPages, Is.EqualTo(0));
        });
    }

    [Test]
    public async Task GetLatestBookReviews_ReturnsEmptyPage_WhenPageIndexTooHigh()
    {
        var result = (await _controller.GetLatestBookReviews(bookId: "1984", pageIndex: 67, pageSize: 67)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status200OK));

        var page = result.Value as Page<BookReviewResponseDTO>;
        Assert.That(page!.Items!, Is.Empty);
    }

#endregion

#region GET-LATEST-BOOK-REVIEWS-BY-USER
    [Test, Order(9)]
    public async Task GetLatestBookReviewsByUser_ReturnsPagedReviews_WhenTheyExist()
    {
        var repo = _scope.ServiceProvider.GetRequiredService<IBookReviewRepository>();

        await repo.CreateBookReviewAsync(new BookReview { UserId = _userCreatedFromTest!.Id, BookId = "lotr-fellowship", Content = "Old", CreatedAt = DateTime.UtcNow.AddHours(1) });
        await repo.CreateBookReviewAsync(new BookReview { UserId = _userCreatedFromTest.Id, BookId = "lotr-return", Content = "Middle", CreatedAt = DateTime.UtcNow.AddHours(2) });
        await repo.CreateBookReviewAsync(new BookReview { UserId = _userCreatedFromTest.Id, BookId = "monster", Content = "New", CreatedAt = DateTime.UtcNow.AddHours(3) });

        var result = (await _controller.GetLatestBookReviewsByUser(_userCreatedFromTest.Id, pageIndex: 1, pageSize: 3)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);

        var page = result.Value as Page<BookReviewResponseDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.That(page.Items, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(page.Items, Has.Count.EqualTo(3));
            Assert.That(page.Items[0].Content, Is.EqualTo("New"));
            Assert.That(page.Items[1].Content, Is.EqualTo("Middle"));
            Assert.That(page.Items[2].Content, Is.EqualTo("Old"));
        });
    }

    [Test]
    public async Task GetLatestBookReviewsByUser_ReturnsEmptyPage_WhenUserHasNoReviews()
    {
        var userManager = _scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var userWithoutReviews = await userManager.FindByNameAsync("admin");

        var result = (await _controller.GetLatestBookReviewsByUser(userWithoutReviews!.Id, pageIndex: 1, pageSize: 10)).Result as ObjectResult;
        Assert.That(result, Is.Not.Null);

        var page = result.Value as Page<BookReviewResponseDTO>;
        Assert.That(page, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(page.Items, Has.Count.EqualTo(0));
            Assert.That(page.PageIndex, Is.EqualTo(1));
            Assert.That(page.TotalPages, Is.EqualTo(0));
        });
    }

    [Test]
    public async Task GetLatestBookReviewsByUser_ThrowsSqlException_WhenPageIndexTooLow()
    {
        var userManager = _scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var userWithoutReviews = await userManager.FindByNameAsync("admin");

        Assert.ThrowsAsync<SqlException>(async () =>
        {
            await _controller.GetLatestBookReviewsByUser(userWithoutReviews!.Id, pageIndex: -67, pageSize: 67);
        });
    }

#endregion

#region DELETE-BOOK-REVIEW

    [Test, Order(10)]
    public async Task DeleteBookReview_DeletesReview_WhenUserIsOwner()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser)
                ], "TestAuth"))
            }
        };

        var result = await _controller.DeleteBookReview(_userCreatedFromTest.Id, bookId: "monster");
        Assert.That(result, Is.InstanceOf<NoContentResult>());
    }

    [Test, Order(11)]
    public async Task DeleteBookReview_DeletesAnotherUserReview_WhenUserIsAdmin()
    {
        var userManager = _scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var adminUser = await userManager.FindByNameAsync("admin");

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, adminUser!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                    new Claim(ClaimTypes.Role, UserRoles.Admin)
                ], "TestAuth"))
            }
        };

        var result = await _controller.DeleteBookReview(_userCreatedFromTest!.Id, bookId: "1984");
        Assert.That(result, Is.InstanceOf<NoContentResult>());
    }

    [Test]
    public async Task DeleteBookReview_ReturnsForbidden_WhenUserIsNotOwnerOrAdmin()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _userCreatedFromTest!.Id),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser)
                ], "TestAuth"))
            }
        };

        // both user and book id do not matter since the user attempting the deletion is neither the target user nor admin
        var result = await _controller.DeleteBookReview(userId: "target-user-id", bookId: "target-book-id") as ObjectResult;
        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
    }

#endregion

}
