using Vibez.backend.Data;
using Vibez.backend.Hubs;
using Vibez.backend.Services;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Add services to the dependency injection (DI) container ---
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<RoomService>();
builder.Services.AddScoped<SpotifyService>();
// This is required for IHttpClientFactory, which SpotifyService uses.
builder.Services.AddHttpClient();
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


// --- 2. Build the application ---
var app = builder.Build();


// --- 3. Configure the HTTP request pipeline (Middleware) ---
app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthorization(); // not configured
// Map controller endpoints. This connects the routes defined in our controller
// attributes (e.g., [HttpGet], [HttpPost]) to the routing system.
app.MapControllers();
app.MapHub<RoomHub>("/roomHub");


// --- 4. Run the application ---
app.Run();
