using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

using BookMark.Models.Roles;
using BookMark.Models;
using BookMark.DTOs;
using BookMark.Services.Repositories;

namespace BookMark.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : BaseController<User, UserCreateDTO, UserUpdateDTO, UserResponseDTO>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;

    public UserController(  UserManager<User> userManager,
                            RoleManager<IdentityRole> roleManager,
                            IConfiguration configuration,
                            UserRepository repository  )  : base(repository)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
    }


    [AllowAnonymous]
    [HttpPost("create")]
    public override async Task<ActionResult<UserResponseDTO>> Create([FromBody] UserCreateDTO creationData)
    {
        if (!await _roleManager.RoleExistsAsync(UserRoles.Admin))
                await _roleManager.CreateAsync(new IdentityRole(UserRoles.Admin));
        if (!await _roleManager.RoleExistsAsync(UserRoles.RegularUser))
                await _roleManager.CreateAsync(new IdentityRole(UserRoles.RegularUser));

        var userExists = await _userManager.FindByNameAsync(creationData.Username);
            if (userExists != null)
                return Problem( title: "Conflict",
                                detail: "The username is already taken. Please choose a different one.",
                                statusCode: StatusCodes.Status409Conflict );

        var userToCreate = new User();
        userToCreate.MapFrom(creationData);

        var createdUser = await _userManager.CreateAsync(userToCreate, creationData.Password);
        if (!createdUser.Succeeded)
                return Problem( title: "User Creation Failed",
                                detail: "An error occurred while creating the user. Please try again later.",
                                statusCode: StatusCodes.Status500InternalServerError );


        await _userManager.AddToRoleAsync(userToCreate, UserRoles.RegularUser);
        
        var response = new UserResponseDTO();
        userToCreate.MapTo(response);

        return CreatedAtAction(nameof(Get), new { id = userToCreate.Id }, response);
    }


    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDTO loginData)
    {

        var user = await _userManager.FindByNameAsync(loginData.UsernameOrEmail) ??
                    await _userManager.FindByEmailAsync(loginData.UsernameOrEmail);

        if (user == null || !await _userManager.CheckPasswordAsync(user, loginData.Password))
            return Problem( title: "Unauthorized",
                            detail: "Invalid username or password. Please check your credentials and try again.",
                            statusCode: StatusCodes.Status401Unauthorized );

        var userRoles = await _userManager.GetRolesAsync(user);
        var authClaims = new List<Claim>
        {
            new Claim("username", user.UserName!),
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

        var token = new JwtSecurityToken (
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddHours(4),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256) );

        return token;
    }

    [HttpDelete("delete/{id}")]
    public override async Task<ActionResult> Delete(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return Problem( title: "Not Found",
                            detail: $"No User with ID '{id}' was found. It may have been previously deleted or never existed.",
                            statusCode: StatusCodes.Status404NotFound );

        var userToDelete = await _userManager.DeleteAsync(user);
        if (!userToDelete.Succeeded)
        return Problem( title: "Unable to Delete User",
                        detail: "The system encountered an unexpected issue while trying to delete the user. Please try again or contact support.",
                        statusCode: StatusCodes.Status500InternalServerError );

        return NoContent();
    }

}
