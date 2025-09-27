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

namespace BookMark.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : BaseController<User, UserCreateDTO, UserUpdateDTO, UserResponseDTO, UserLinkDTO>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;

    public UserController(  UserManager<User> userManager,
                            RoleManager<IdentityRole> roleManager,
                            IConfiguration configuration,
                            UserRepository repository,
                            IMapper mapper  )  : base(repository, mapper)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
    }


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

        var userToCreate = _mapper.Map<User>(creationData);
        userToCreate.SecurityStamp = Guid.NewGuid().ToString();

        var createdUser = await _userManager.CreateAsync(userToCreate, creationData.Password);
        if (!createdUser.Succeeded)
                return Problem( title: "User Creation Failed",
                                detail: "An error occurred while creating the user. Please try again later.",
                                statusCode: StatusCodes.Status500InternalServerError );


        await _userManager.AddToRoleAsync(userToCreate, UserRoles.RegularUser);
        
        var response = _mapper.Map<UserResponseDTO>(userToCreate);

        return CreatedAtAction(nameof(Get), new { id = userToCreate.Id }, response);
    }


    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] UserCredentialsDTO credentials)
    {

        var user = await _userManager.FindByNameAsync(credentials.UsernameOrEmail) ??
                    await _userManager.FindByEmailAsync(credentials.UsernameOrEmail);

        if (user == null || !await _userManager.CheckPasswordAsync(user, credentials.Password))
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


    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("delete/{id}")]
    public override async Task<ActionResult> Delete(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return Problem( title: "No User to Delete",
                            detail: $"The User with ID '{id}' already does not exist.",
                            statusCode: StatusCodes.Status400BadRequest );

        var userToDelete = await _userManager.DeleteAsync(user);
        if (!userToDelete.Succeeded)
        return Problem( title: "Unable to Delete User",
                        detail: "The system encountered an unexpected issue while trying to delete the user account. Please try again or contact support.",
                        statusCode: StatusCodes.Status500InternalServerError );

        return NoContent();
    }

}
