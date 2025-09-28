using System.Text;
using System.Diagnostics;

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
using BookMark.Data.Repositories;
using AutoMapper.Internal;

var builder = WebApplication.CreateBuilder(args);
ConfigurationManager configuration = builder.Configuration;

#region SERVICES

//APP-DB-CONTEXT_______________________________________________________________________________________________
builder.Services.AddDbContext<AppDbContext>( options => {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
        options.EnableSensitiveDataLogging(); } );
//_____________________________________________________________________________________________________________

//AUTO-MAPPER__________________________________________________________________________________________________
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<MapperConfig>();

    cfg.Internal().ForAllPropertyMaps(
        pm => pm.DestinationName == "CreatedAt" || pm.DestinationName == "UpdatedAt",
        (propertyMap, options) => options.Ignore()
    );
});
//_____________________________________________________________________________________________________________

//BOOKMARK-SERVICES____________________________________________________________________________________________
builder.Services.AddTransient<IFileService, FileService>();

builder.Services.AddScoped<BookService>();

builder.Services.AddScoped<BookRepository>();
builder.Services.AddScoped<BookTypeRepository>();
builder.Services.AddScoped<AuthorRepository>();
builder.Services.AddScoped<GenreRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<BookReviewRepository>();
//_____________________________________________________________________________________________________________

//CORS_________________________________________________________________________________________________________
var corsPolicy = "CorsPolicy";

builder.Services.AddCors( options => {
    options.AddPolicy(name: corsPolicy,
    builder =>
    {
        builder
        .WithOrigins("http://localhost:5173")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    }); } );
//_____________________________________________________________________________________________________________

//CONTROLLERS__________________________________________________________________________________________________
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.MaxDepth = 64;
});
//_____________________________________________________________________________________________________________

//CUSTOM-EXCEPTION-HANDLING____________________________________________________________________________________
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
//_____________________________________________________________________________________________________________

//IDENTITY-CORE________________________________________________________________________________________________
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
//_____________________________________________________________________________________________________________



//SWAGGER______________________________________________________________________________________________________
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
//_____________________________________________________________________________________________________________

#endregion


#region APP

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();

//FILE-UPLOADING_______________________________________________________________________________________________
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
//_____________________________________________________________________________________________________________


//CORS_________________________________________________________________________________________________________
app.UseRouting();
app.UseCors(corsPolicy);
//_____________________________________________________________________________________________________________

//SWAGGER______________________________________________________________________________________________________
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//_____________________________________________________________________________________________________________

app.UseAuthorization();
app.MapControllers();

app.Run();

#endregion
