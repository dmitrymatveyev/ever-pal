using EverPal.WebApi.Middlewares;
using EverPal.WebApi.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "EverPal API", Version = "v1" });

    // Add Anonymous Authentication
    options.AddSecurityDefinition("Anonymous", new OpenApiSecurityScheme
    {
        Description = "Anonymous Authorization header. Enter 'Anonymous {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Anonymous"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Anonymous"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Register the Anonymous Auth Service
builder.Services.AddSingleton<IAnonymousAuthService, AnonymousAuthService>();

// Register the Pet Ownership Service
builder.Services.AddSingleton<IPetOwnershipService, PetOwnershipService>();

// Register the Pet Service
builder.Services.AddSingleton<IPetService, PetService>();

// Register the Note Service
builder.Services.AddSingleton<INoteService, NoteService>();

// Register the Health Log Service
builder.Services.AddSingleton<IHealthLogService, HealthLogService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "https://everpal.app",
            "https://www.everpal.app",
            "http://localhost:5173",
            "https://localhost:5001"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAnonymousAuth();
app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint (unauthenticated)
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.MapControllers();

app.Run();
