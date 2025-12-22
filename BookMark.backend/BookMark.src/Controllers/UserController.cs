using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;

using BookMark.Models.DTOs;
using BookMark.Models.Roles;
using BookMark.Models.Domain;
using BookMark.Data.Repositories;
using BookMark.Models.Relationships;
using BookMark.Models;
using Microsoft.EntityFrameworkCore;

namespace BookMark.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : BaseController<User, UserCreateDTO, UserUpdateDTO, UserResponseDTO, UserLinkDTO>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;

    protected readonly IBookReviewRepository _bookReviewRepository;

    public UserController(UserManager<User> userManager,
                            RoleManager<IdentityRole> roleManager,
                            IConfiguration configuration,
                            IBaseRepository<User> repository,
                            IBookReviewRepository bookReviewRepository,
                            IMapper mapper) : base(repository, mapper)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _bookReviewRepository = bookReviewRepository;
    }


    [HttpPost("create")]
    public override async Task<ActionResult<UserResponseDTO>> Create([FromBody] UserCreateDTO creationData)
    {
        var usernameExists = await _userManager.Users.AnyAsync(u => u.UserName == creationData.Username);
        var emailExists = await _userManager.Users.AnyAsync(u => u.Email == creationData.Email);

        if (usernameExists)
            return Problem(title: "Conflict", detail: "Try using a different username.", statusCode: StatusCodes.Status409Conflict);

        if (emailExists)
            return Problem(title: "Conflict", detail: "Try using a different e-mail.", statusCode: StatusCodes.Status409Conflict);

        var userToCreate = _mapper.Map<User>(creationData);
        userToCreate.SecurityStamp = Guid.NewGuid().ToString();

        var creation = await _userManager.CreateAsync(userToCreate, creationData.Password);
        if (!creation.Succeeded)
            return Problem(title: "User Creation Failed",
                            detail: "An error occurred while creating the user. Please try again later.",
                            statusCode: StatusCodes.Status500InternalServerError);

        await _userManager.AddToRoleAsync(userToCreate, UserRoles.RegularUser);

        var createdUser = await _repository.GetByIdAsync<UserResponseDTO>(userToCreate.Id);
        return CreatedAtAction(nameof(Get), new { id = userToCreate.Id }, createdUser);
    }


    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] UserCredentialsDTO credentials)
    {
        var user = await _userManager.FindByNameAsync(credentials.UsernameOrEmail) ??
                    await _userManager.FindByEmailAsync(credentials.UsernameOrEmail);

        if (user == null || !await _userManager.CheckPasswordAsync(user, credentials.Password))
            return Problem(title: "Unauthorized",
                            detail: "Invalid username or password. Please check your credentials and try again.",
                            statusCode: StatusCodes.Status401Unauthorized);

        var userRoles = await _userManager.GetRolesAsync(user);
        var authClaims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        foreach (var userRole in userRoles)
            authClaims.Add(new Claim("role", userRole));

        var token = GetToken(authClaims);

        var jwt = new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            expiration = token.ValidTo
        };

        return Ok(jwt);
    }


    [NonAction]
    private JwtSecurityToken GetToken(List<Claim> authClaims)
    {
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!));

        var token = new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddMinutes(60),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256));

        return token;
    }


    [Authorize(Roles = UserRoles.RegularUser)]
    [HttpPut("update-profile/{id}")]
    public async Task<ActionResult<UserResponseDTO>> UpdateProfile([FromRoute] string id, [FromBody] UserUpdateDTO update)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole(UserRoles.Admin);
        if (currentUserId != id && !isAdmin)
            return Problem(title: "Forbidden",
                            detail: "You are not authorized to update this user account.",
                            statusCode: StatusCodes.Status403Forbidden);
        
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return Problem(title: "Bad Request",
                            detail: $"The User with ID '{id}' does not exist.",
                            statusCode: StatusCodes.Status400BadRequest);

        if (update.DisplayName != null)
            user.DisplayName = update.DisplayName;
        if (update.AboutMe != null)
            user.AboutMe = update.AboutMe;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return Problem( title: "Update Failed",
                            detail: "Update failed. Try again later.",
                            statusCode: StatusCodes.Status500InternalServerError );
        
        var response = _mapper.Map<UserResponseDTO>(user);

        return Ok(response);
    }


    [Authorize(Roles = UserRoles.RegularUser)]
    [HttpDelete("delete/{id}")]
    public override async Task<ActionResult> Delete([FromRoute] string id)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole(UserRoles.Admin);

        if (currentUserId != id && !isAdmin)
            return Problem(title: "Forbidden",
                            detail: "You are not authorized to delete this user account.",
                            statusCode: StatusCodes.Status403Forbidden);

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return Problem(title: "Bad Request",
                            detail: $"The User with ID '{id}' already does not exist.",
                            statusCode: StatusCodes.Status400BadRequest);

        var userToDelete = await _userManager.DeleteAsync(user);
        if (!userToDelete.Succeeded)
            return Problem(title: "Unable to Delete User",
                            detail: "The system encountered an unexpected issue while trying to delete the user. Please try again or contact support.",
                            statusCode: StatusCodes.Status500InternalServerError);

        return NoContent();
    }


    [Authorize(Roles = UserRoles.RegularUser)]
    [HttpPost("create-book-review")]
    public async Task<ActionResult<BookReviewResponseDTO>> CreateBookReview([FromBody] BookReviewCreateDTO review)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null)
            return Problem(title: "Unauthorized",
                            detail: "Invalid session.",
                            statusCode: StatusCodes.Status401Unauthorized);
        
        var existingReview = await _bookReviewRepository.GetCurrentUserBookReviewAsync(currentUserId, review.BookId);

        if (existingReview != null)
            return Problem(title: "Conflict",
                            detail: "You have already submitted a review for this book!",
                            statusCode: StatusCodes.Status409Conflict);

        if (review.Rating == null && string.IsNullOrWhiteSpace(review.Content))
            return Problem(title: "Bad Request",
                            detail: "Either Rating or Review Content must be provided to log a review.",
                            statusCode: StatusCodes.Status400BadRequest);

        var reviewToCreate = _mapper.Map<BookReview>(review);
        reviewToCreate.UserId = currentUserId;
        await _bookReviewRepository.CreateBookReviewAsync(reviewToCreate);

        var createdReview = await _bookReviewRepository.GetCurrentUserBookReviewAsync(currentUserId, review.BookId);
        return CreatedAtAction(nameof(GetCurrentUserBookReview), new { userId = currentUserId, bookId = review.BookId }, createdReview);
    }


    [Authorize(Roles = UserRoles.RegularUser)]
    [HttpGet("get-current-user-book-review/{bookId}")]
    public async Task<ActionResult<BookReviewResponseDTO?>> GetCurrentUserBookReview([FromRoute] string bookId)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null)
            return Problem(title: "Unauthorized",
                            detail: "Invalid session.",
                            statusCode: StatusCodes.Status401Unauthorized);

        var review = await _bookReviewRepository.GetCurrentUserBookReviewAsync(currentUserId, bookId);

        return Ok(review);
    }


    [HttpGet("get-latest-book-reviews/{bookId}")]
    public async Task<ActionResult<Page<BookReviewResponseDTO>>> GetLatestBookReviews([FromRoute] string bookId, [FromQuery] int pageIndex, [FromQuery] int pageSize)
    {
        var page = await _bookReviewRepository.GetLatestBookReviewsAsync(bookId, pageIndex, pageSize);

        return Ok(page);
    }

    [HttpGet("get-latest-book-reviews-by-user/{userId}")]
    public async Task<ActionResult<Page<BookReviewResponseDTO>>> GetLatestBookReviewsByUser([FromRoute] string userId, [FromQuery] int pageIndex, [FromQuery] int pageSize)
    {
        var page = await _bookReviewRepository.GetLatestBookReviewsByUserAsync(userId, pageIndex, pageSize);

        return Ok(page);
    }


    [Authorize(Roles = UserRoles.RegularUser)]
    [HttpDelete("delete-book-review/{userId}/{bookId}")]
    public async Task<ActionResult> DeleteBookReview([FromRoute] string userId, [FromRoute] string bookId)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole(UserRoles.Admin);

        if (currentUserId != userId && !isAdmin)
            return Problem(title: "Forbidden",
                            detail: "You are not authorized to delete this book review.",
                            statusCode: StatusCodes.Status403Forbidden);

        await _bookReviewRepository.DeleteBookReviewAsync(userId, bookId);

        return NoContent();
    }

}
