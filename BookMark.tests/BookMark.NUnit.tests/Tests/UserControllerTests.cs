using System.Security.Claims;
using System.Text.Json;
using BookMark.Controllers;
using BookMark.Models.Domain;
using BookMark.Models.DTOs;
using BookMark.Models.Roles;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.NUnit.tests;

[TestFixture]
public class UserControllerTests
{
    private IServiceScope _scope;
    private UserController _controller;

    private static string? _createdUserId;
    
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

        _createdUserId = createdUser.Id;
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
                    new Claim(ClaimTypes.NameIdentifier, _createdUserId!),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                ], "TestAuth"))
            }
        };

        var result = (await _controller.UpdateProfile(update)).Result as ObjectResult;

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
    public async Task UpdateProfile_ReturnsUnauthorized_WhenUserIsNotAuthenticated()
    {
        var update = new UserUpdateDTO
        {
            DisplayName = "New Name"
        };

        _controller.ControllerContext = new ControllerContext
        { // No user claims -> user is unauthorized
            HttpContext = new DefaultHttpContext()
        };

        var result = (await _controller.UpdateProfile(update)).Result as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status401Unauthorized));
    }

    [Test]
    public async Task UpdateProfile_ReturnsUnauthorized_WhenUserDoesNotExistAnymore()
    {
        var update = new UserUpdateDTO { AboutMe = "Will Fail" };

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, "this-user-used-to-exist-but-not-anymore"),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser),
                ], "TestAuth"))
            }
        };

        var result = (await _controller.UpdateProfile(update)).Result as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status401Unauthorized));
    }

#endregion

#region DELETE

    [Test, Order(4)]
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
                    new Claim(ClaimTypes.NameIdentifier, _createdUserId!),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser)
                ], "TestAuth"))
            }
        };

        // attempt to delete another user by a regular user created in a previous test
        var result = await _controller.Delete(userToTryToDelete!.Id) as ObjectResult;

        Assert.That(result, Is.Not.Null);
        Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
    }

    [Test, Order(5)]
    public async Task Delete_ReturnsNoContent_WhenUserDeletesSelf()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, _createdUserId!),
                    new Claim(ClaimTypes.Role, UserRoles.RegularUser)
                ], "TestAuth"))
            }
        };

        var result = await _controller.Delete(_createdUserId!);
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

}
