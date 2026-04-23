using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

var app = builder.Build();

app.MapGet("/", async () =>
{
    await Task.Delay(50);

    var students = Enumerable.Range(1, 1000).Select(i => new Student(
        i,
        $"Student Number {i}",
        "Software Engineering",
        Random.Shared.Next(50, 100)
    ));

    var response = new ApiResponse(
        "success",
        "ASP.NET Core Minimal API (Native AOT Beast)",
        1000,
        students
    );

    return Results.Ok(response);
});

app.Run();

public record Student(int Id, string Name, string Department, int Grade);
public record ApiResponse(string Status, string Framework, int Count, IEnumerable<Student> Data);

[JsonSerializable(typeof(ApiResponse))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}