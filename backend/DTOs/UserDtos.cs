// --- UserDtos.cs ---
// This file contains Data Transfer Objects (DTOs) related to user actions.
// A DTO is an object that defines how data will be sent over the network.
// We use DTOs to separate our internal database models from the models exposed to the outside world.
// This is crucial for security, validation, and API versioning.

using System.ComponentModel.DataAnnotations;

namespace Vibez.backend.DTOs
{
    /// <summary>
    /// This DTO is used when a user wants to join an existing room.
    /// It captures the data sent from the frontend form.
    /// We use DataAnnotations ([Required], [StringLength], etc.) to automatically
    /// validate the incoming request. If the request doesn't meet these criteria,
    // ASP.NET Core will automatically return a 400 Bad Request response.
    /// </summary>
    public class JoinRoomDto
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(20, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 20 characters.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Room code is required.")]
        [RegularExpression("^[A-Z0-9]{6}$", ErrorMessage = "Room code must be 6 uppercase letters and numbers.")]
        public string RoomCode { get; set; } = string.Empty;
    }

    /// <summary>
    /// This DTO represents the data we send back to the client for a user object.
    /// Notice it doesn't contain sensitive information like the SignalR ConnectionId.
    /// </summary>
    public class UserViewDto
    {
        public string Username { get; set; } = string.Empty;
        public bool IsHost { get; set; }
    }
}
