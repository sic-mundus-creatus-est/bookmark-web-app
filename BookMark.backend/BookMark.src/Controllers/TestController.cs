using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookMark.Models.Roles;

namespace BookMark.Controllers;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    [HttpGet("guest-user-test")]
    public IActionResult GuestUserTest()
    {
        return Ok(new { Message = "You are a guest/anonymous user!" });
    }

    [Authorize(Roles = UserRoles.RegularUser)]
    [HttpGet("regular-user-test")]
    public IActionResult RegularUserTest()
    {
        return Ok(new { Message = "You are an regular user!" });
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet("admin-test")]
    public IActionResult AdminTest()
    {
        return Ok(new { Message = "You are an admin!" });
    }
}
