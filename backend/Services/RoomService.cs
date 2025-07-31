// --- RoomService.cs ---
// This service contains all the business logic for managing rooms.
// It interacts directly with the database via MongoDbContext.

using MongoDB.Driver;
using Vibez.backend.Data;
using Vibez.backend.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vibez.backend.Services
{
    public class RoomService
    {
        private readonly IMongoCollection<Room> _rooms;

        public RoomService(MongoDbContext context)
        {
            _rooms = context.Rooms;
        }

        public async Task<string> CreateRoomAsync(string hostUsername)
        {
            string roomCode;
            do {
                roomCode = GenerateRandomCode();
            } while (await DoesRoomExistAsync(roomCode));

            var host = new User { Username = hostUsername, IsHost = true };
            var newRoom = new Room { RoomCode = roomCode, Users = { host } };

            await _rooms.InsertOneAsync(newRoom);
            return newRoom.RoomCode;
        }

        public async Task<bool> DoesRoomExistAsync(string roomCode)
        {
            var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
            return await _rooms.Find(filter).AnyAsync();
        }

        // --- NEW METHODS REQUIRED BY THE HUB ---

        /// <summary>
        /// Retrieves a full room object from the database using its code.
        /// </summary>
        public async Task<Room?> GetRoomByCodeAsync(string roomCode)
        {
            var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
            return await _rooms.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Finds a room based on the SignalR connection ID of a user inside it.
        /// </summary>
        public async Task<Room?> GetRoomByConnectionIdAsync(string connectionId)
        {
            var filter = Builders<Room>.Filter.ElemMatch(r => r.Users, u => u.ConnectionId == connectionId);
            return await _rooms.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Adds a user to a room's user list in the database.
        /// </summary>
        public async Task AddUserToRoomAsync(string roomCode, User user)
        {
            var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
            var update = Builders<Room>.Update.Push(r => r.Users, user);
            await _rooms.UpdateOneAsync(filter, update);
        }

        /// <summary>
        /// Removes a user from a room's user list using their connection ID.
        /// </summary>
        /// <returns>The username of the removed user.</returns>
        public async Task<string?> RemoveUserFromRoomAsync(string roomCode, string connectionId)
        {
            var room = await GetRoomByCodeAsync(roomCode);
            var userToRemove = room?.Users.FirstOrDefault(u => u.ConnectionId == connectionId);

            if (userToRemove != null)
            {
                var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
                var update = Builders<Room>.Update.PullFilter(r => r.Users, u => u.ConnectionId == connectionId);
                await _rooms.UpdateOneAsync(filter, update);
                return userToRemove.Username;
            }
            return null;
        }

        /// <summary>
        /// Adds a track to a room's queue and returns the updated queue.
        /// </summary>
        public async Task<List<Track>> AddTrackToQueueAsync(string roomCode, Track track)
        {
            var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
            var update = Builders<Room>.Update.Push(r => r.Queue, track);
            
            var options = new FindOneAndUpdateOptions<Room>
            {
                ReturnDocument = ReturnDocument.After // This ensures we get the updated document back
            };

            var updatedRoom = await _rooms.FindOneAndUpdateAsync(filter, update, options);
            return updatedRoom?.Queue ?? new List<Track>();
        }

        private string GenerateRandomCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var randomString = new char[6];
            for (int i = 0; i < randomString.Length; i++)
            {
                randomString[i] = chars[random.Next(chars.Length)];
            }
            return new string(randomString);
        }
    }
}
