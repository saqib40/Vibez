// We use special attributes from the MongoDB.Bson library to control how our C# class
// maps to a BSON document in the database.

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using System;

namespace Vibez.backend.Data.Models
{
    public class Room
    {
        /// <summary>
        /// The unique identifier for the document in MongoDB.
        /// [BsonId]: Marks this property as the document's primary key.
        /// [BsonRepresentation(BsonType.ObjectId)]: Tells MongoDB to store this as an ObjectId,
        /// which is the standard for MongoDB keys. It allows MongoDB to handle ID generation for us.
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// The short, human-readable, and shareable code for joining a room (e.g., "A4B9K2").
        /// We will create an index on this field in MongoDB to make lookups very fast.
        /// [BsonElement("RoomCode")]: Explicitly names the field in the MongoDB document.
        /// This is good practice as it decouples your C# property name from the database field name.
        /// </summary>
        [BsonElement("RoomCode")]
        public string RoomCode { get; set; } = string.Empty;

        /// <summary>
        /// A list of all users currently in the room. This is a perfect example of
        /// "embedding" documents in MongoDB. Instead of creating a separate table for users
        /// and joining them, we store the user data directly within the room they belong to.
        /// </summary>
        public List<User> Users { get; set; } = new List<User>();

        /// <summary>
        /// The music queue for the room. This is another list of embedded documents.
        /// </summary>
        public List<Track> Queue { get; set; } = new List<Track>();
        
        /// <summary>
        /// The track that is currently playing. This can be null if nothing is playing.
        /// </summary>
        public Track? NowPlaying { get; set; }

        /// <summary>
        /// The host's Spotify Access Token. This is required to make API calls on behalf of the host.
        /// In a production application, this should ALWAYS be encrypted before being stored.
        /// </summary>
        public string? SpotifyAccessToken { get; set; }

        /// <summary>
        /// The host's Spotify Refresh Token. This allows us to get a new Access Token
        /// when the old one expires without requiring the host to log in again.
        /// This should also ALWAYS be encrypted.
        /// </summary>
        public string? SpotifyRefreshToken { get; set; }

        /// <summary>
        /// The date and time the room was created.
        /// [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]: Ensures the date is always
        /// stored in UTC format, which is a critical best practice for server applications
        /// to avoid timezone-related bugs.
        /// </summary>
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
