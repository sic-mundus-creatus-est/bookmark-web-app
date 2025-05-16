using System.Text;
using System.Diagnostics;
using System.Text.Json.Serialization;

using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Authentication.JwtBearer;

using BookMark.Data;
using BookMark.Services.Core;
using BookMark.Models.Domain;
using BookMark.Services.Domain;
using BookMark.Services.Repositories;

var builder = WebApplication.CreateBuilder(args);
ConfigurationManager configuration = builder.Configuration;

#region SERVICES

//APP-DB-CONTEXT------------------------------------------
builder.Services.AddDbContext<AppDbContext>( options => {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
        options.EnableSensitiveDataLogging(); } );
//APP-DB-CONTEXT------------------------------------------

//CONTROLLERS-----------------------------------------------
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.MaxDepth = 64;
});
//CONTROLLERS-----------------------------------------------

//CORS-----------------------------
var specificOrgins = "AppOrigins";

builder.Services.AddCors( options => {
    options.AddPolicy(name: specificOrgins,
    policy =>
    {
        policy.WithOrigins("http://localhost:5173")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    }); } );
//CORS-----------------------------

//BOOKMARK-SERVICES--------------------------------------
builder.Services.AddTransient<IFileService, FileService>();

builder.Services.AddScoped<BookService>();

builder.Services.AddScoped<BookRepository>();
builder.Services.AddScoped<AuthorRepository>();
builder.Services.AddScoped<UserRepository>();
//BOOKMARK-SERVICES--------------------------------------

//CUSTOM-EXCEPTION-HANDLING-------------------------------------
builder.Services.AddExceptionHandler<CustomExceptionHandler>();
builder.Services.AddProblemDetails(options => {
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance =
            $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";

        context.ProblemDetails.Extensions.TryAdd("requestId", context.HttpContext.TraceIdentifier);

        Activity? activity = context.HttpContext.Features.Get<IHttpActivityFeature>()?.Activity;
        context.ProblemDetails.Extensions.TryAdd("traceId", activity?.Id);
    }; } );
//CUSTOM-EXCEPTION-HANDLING-------------------------------------

//IDENTITY-CORE--------------------------------------------
builder.Services.AddAuthorization();

builder.Services.AddIdentity<User, IdentityRole>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>( options =>
{
    options.User.AllowedUserNameCharacters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true;

    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;
} );

builder.Services.AddAuthentication( options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
} ).AddJwtBearer( options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidAudience = configuration["JWT:ValidAudience"],
            ValidIssuer = configuration["JWT:ValidIssuer"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"]!))
        };
    } );
//IDENTITY-CORE--------------------------------------------



//SWAGGER---------------------------------------------------------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BookMark API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
    c.EnableAnnotations();
});
//SWAGGER---------------------------------------------------------------------------

#endregion


#region APP

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();

//FILE-UPLOADING-------------------------------------------------------------------
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "Uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
// mapping Uploads folder to Resources folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/Resources"
});
//FILE-UPLOADING-------------------------------------------------------------------


//CORS-----------------------------
app.UseCors(specificOrgins);
//CORS-----------------------------

//SWAGGER----------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//SWAGGER----------------------------

app.UseAuthorization();
app.MapControllers();

app.Run();

#endregion
