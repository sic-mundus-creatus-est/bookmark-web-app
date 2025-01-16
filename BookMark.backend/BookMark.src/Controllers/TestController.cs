using Microsoft.AspNetCore.Mvc;
using BookMark.backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using BookMark.backend.Models.Roles;

namespace BookMark.backend.Controllers;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    private readonly IWeatherService _weatherService;

    public TestController(IWeatherService weatherService)
    {
        _weatherService = weatherService;
    }

    [Authorize(Roles = UserRoles.RegularUser)]
    [HttpGet("hello-world")]
    public IActionResult Get()
    {
        return Ok(new { Message = "Hello World!" });
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet("weather-forecast")]
    public IActionResult GetWeatherForecast()
    {
        var forecast = _weatherService.GetWeatherForecast();
        return Ok(forecast);
    }
}

