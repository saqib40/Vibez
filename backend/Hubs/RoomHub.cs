// --- RoomHub.cs ---
// This class is our main SignalR Hub. It handles all real-time client-server communication
// over WebSockets, using our updated services to manage state.

using Microsoft.AspNetCore.SignalR;
using Vibez.backend.Data.Models;
using Vibez.backend.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Vibez.backend.Hubs
{
    public class RoomHub : Hub
    {
        private readonly RoomService _roomService;
        private readonly SpotifyService _spotifyService;

        public RoomHub(RoomService roomService, SpotifyService spotifyService)
        {
            _roomService = roomService;
            _spotifyService = spotifyService;
        }

        public async Task JoinRoom(string roomCode, string username)
        {
            var room = await _roomService.GetRoomByCodeAsync(roomCode);
            if (room == null) return;

            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

            var user = new User
            {
                ConnectionId = Context.ConnectionId,
                Username = username,
                IsHost = !room.Users.Any() // The first user to join is the host.
            };
            
            await _roomService.AddUserToRoomAsync(roomCode, user);

            await Clients.Group(roomCode).SendAsync("UserJoined", user.Username);
            await Clients.Client(Context.ConnectionId).SendAsync("QueueUpdated", room.Queue);
        }

        public async Task SendMessage(string roomCode, string username, string message)
        {
            await Clients.Group(roomCode).SendAsync("ReceiveMessage", username, message, DateTime.UtcNow.ToString("h:mm tt"));
        }

        public async Task AddToQueue(string roomCode, string spotifyTrackId, string addedByUsername)
        {
            var track = await _spotifyService.GetTrackByIdAsync(spotifyTrackId, roomCode);
            if (track == null) return;

            track.AddedBy = addedByUsername;

            var updatedQueue = await _roomService.AddTrackToQueueAsync(roomCode, track);

            await Clients.Group(roomCode).SendAsync("QueueUpdated", updatedQueue);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var room = await _roomService.GetRoomByConnectionIdAsync(Context.ConnectionId);
            if (room != null)
            {
                var username = await _roomService.RemoveUserFromRoomAsync(room.RoomCode, Context.ConnectionId);
                if (!string.IsNullOrEmpty(username))
                {
                    await Clients.Group(room.RoomCode).SendAsync("UserLeft", username);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
