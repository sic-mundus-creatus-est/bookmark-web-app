using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace BookMark.tests;

[SetUpFixture]
public class GlobalTestSetup
{
    public static WebApplicationFactory<Program> Factory;
    public static IServiceProvider Services;
    private static IServiceScope _scope;

    [OneTimeSetUp]
    public void RunBeforeAnyTests()
    {
        Factory = new WebApplicationFactory<Program>();
        _scope = Factory.Services.CreateScope();
        Services = _scope.ServiceProvider;
    }

    [OneTimeTearDown]
    public void RunAfterAllTests()
    {
        _scope?.Dispose();
        Factory?.Dispose();
    }
    
}
