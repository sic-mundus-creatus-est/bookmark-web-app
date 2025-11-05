using NUnit.Framework;

namespace BookMark.tests;

public class Tests
{
    [SetUp]
    public void Setup()
    {
        TestContext.WriteLine("Preparing for the launch...");
    }

    [Test]
    public void Test1()
    {
        TestContext.WriteLine("HELLO WORLD!");
        Assert.Pass();
    }
}
