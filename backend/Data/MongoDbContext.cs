// --- MongoDbContext.cs ---
// This class is the bridge between our application and the MongoDB database.
// It's responsible for establishing the connection and providing access to our collections.
// We will use Dependency Injection to provide an instance of this class to our services.

using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using Vibez.backend.Data.Models;

namespace Vibez.backend.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        /// <summary>
        /// The constructor takes IConfiguration, which allows us to read settings
        /// from our appsettings.json file. This is the standard way to handle
        /// configuration in ASP.NET Core.
        /// </summary>
        /// <param name="configuration">The application configuration properties.</param>
        public MongoDbContext(IConfiguration configuration)
        {
            // Read the connection string and database name from appsettings.json
            var connectionString = configuration.GetConnectionString("MongoDb");
            var databaseName = configuration.GetValue<string>("DatabaseSettings:DatabaseName");

            // Create a new MongoDB client and get the database instance.
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }

        /// <summary>
        /// A public property to get the "Rooms" collection from our database.
        /// The generic type <Room> tells the driver that documents in this collection
        /// should be mapped to our Room.cs model.
        /// Services will use this property to perform CRUD (Create, Read, Update, Delete)
        /// operations on rooms.
        /// </summary>
        public IMongoCollection<Room> Rooms => _database.GetCollection<Room>("Rooms");
    }
}