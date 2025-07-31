// Handles creating and joining rooms (HTTP)

// --- RoomsController.cs ---
// This controller handles all HTTP requests related to creating and joining rooms.
// It uses the DTOs we defined to validate incoming data and shape the outgoing responses.

using Microsoft.AspNetCore.Mvc;
using Vibez.backend.DTOs;
using Vibez.backend.Services;

namespace Vibez.backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Sets the base route to "api/rooms"
    public class RoomsController : ControllerBase
    {
        private readonly RoomService _roomService;
        public RoomsController(RoomService roomService)
        {
            _roomService = roomService;
        }

        /// <summary>
        /// Handles the creation of a new room.
        /// POST: /api/rooms/create
        /// </summary>
        /// <param name="createRoomDto">The DTO containing the host's username.</param>
        /// <returns>An HTTP response with the new room's code.</returns>
        [HttpPost("create")]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto createRoomDto)
        {
            // The [ApiController] attribute automatically handles model validation.
            // If createRoomDto is invalid (e.g., username is missing),
            // it will automatically return a 400 Bad Request.

            var newRoomCode = await _roomService.CreateRoomAsync(createRoomDto.Username);

            if (string.IsNullOrEmpty(newRoomCode))
            {
                return BadRequest(new { Message = "Failed to create room." });
            }

            var response = new RoomCreatedDto
            {
                Message = "Room created successfully!",
                RoomCode = newRoomCode
            };

            return Ok(response);
        }

        /// <summary>
        /// Handles a user's request to join an existing room.
        /// This endpoint simply validates if the room exists before the user
        /// attempts a WebSocket connection.
        /// POST: /api/rooms/join
        /// </summary>
        /// <param name="joinRoomDto">The DTO containing the username and room code.</param>
        /// <returns>An HTTP 200 OK if the room exists, otherwise 404 Not Found.</returns>
        [HttpPost("join")]
        public async Task<IActionResult> JoinRoom([FromBody] JoinRoomDto joinRoomDto)
        {
            var roomExists = await _roomService.DoesRoomExistAsync(joinRoomDto.RoomCode);

            if (!roomExists)
            {
                return NotFound(new { Message = "Room not found. Please check the code and try again." });
            }

            return Ok(new { Message = "Room found. You can now connect." });
        }
    }
}
