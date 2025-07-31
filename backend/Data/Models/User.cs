// --- User.cs ---
// This model represents a single user connected to a room.
// It's designed to be a simple, embedded object within the main Room document in MongoDB.
// We don't need a separate collection for Users because a User only exists in the context of a Room.

namespace Vibez.backend.Data.Models
{
    public class User
    {
        /// <summary>
        /// The unique connection ID provided by SignalR when a user connects.
        /// This is the most reliable way to identify a specific, active connection.
        /// We will use this to send messages to specific users if needed.
        /// </summary>
        public string ConnectionId { get; set; } = string.Empty;

        /// <summary>
        /// The display name chosen by the user on the frontend.
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// A flag to identify the room's creator. The host has special
        /// permissions, like controlling playback and managing the room.
        /// </summary>
        public bool IsHost { get; set; } = false;
    }
}
