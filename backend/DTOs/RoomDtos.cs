// --- RoomDtos.cs ---
// This file contains DTOs for room-related actions.

using System.ComponentModel.DataAnnotations;

namespace Vibez.backend.DTOs
{
    /// <summary>
    /// This DTO is used when a user wants to create a new room.
    /// It only requires a username, as the server will generate the room code.
    /// </summary>
    public class CreateRoomDto
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(20, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 20 characters.")]
        public string Username { get; set; } = string.Empty;
    }

    /// <summary>
    /// This DTO is the response we send back to the client after a room is successfully created.
    /// It only contains the essential information the client needs to proceed (the new room code),
    /// not the entire database object.
    /// </summary>
    public class RoomCreatedDto
    {
        public string Message { get; set; } = string.Empty;
        public string RoomCode { get; set; } = string.Empty;
    }
}
