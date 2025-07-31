// --- SpotifyController.cs ---
// This controller manages all interactions with the Spotify API,
// including the OAuth 2.0 authentication flow and music searching.

using Microsoft.AspNetCore.Mvc;
using Vibez.backend.Services;
using System;
using System.Threading.Tasks;

namespace Vibez.backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpotifyController : ControllerBase
    {
        private readonly SpotifyService _spotifyService;

        public SpotifyController(SpotifyService spotifyService)
        {
            _spotifyService = spotifyService;
        }

        [HttpGet("login/{roomCode}")]
        public IActionResult Login(string roomCode)
        {
            var spotifyAuthUrl = _spotifyService.GetAuthorizationUrl(roomCode);
            // This response tells the user's browser to navigate to the Spotify login page.
            return Redirect(spotifyAuthUrl);
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
        {
            // 'state' is the roomCode we passed in the login step.
            var roomCode = state;
            
            await _spotifyService.ExchangeCodeForTokensAsync(code, roomCode);
            
            // After successful authorization, redirect the user back to their room on the frontend.
            // The frontend should handle this redirect and update its UI.
            return Redirect($"http://localhost:5173/room/{roomCode}");
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] string roomCode)
        {
            if (string.IsNullOrWhiteSpace(query) || string.IsNullOrWhiteSpace(roomCode))
            {
                return BadRequest(new { Message = "Search query and room code are required." });
            }

            try
            {
                var searchResults = await _spotifyService.SearchTracksAsync(query, roomCode);
                return Ok(searchResults);
            }
            catch (InvalidOperationException ex)
            {
                // This could happen if the room doesn't exist or the host isn't authorized.
                return Unauthorized(new { Message = ex.Message });
            }
            catch (HttpRequestException)
            {
                // This could happen if the Spotify token is expired.
                // Here you would implement logic to use the refresh token.
                return StatusCode(401, new { Message = "Spotify token may be expired. Please have the host re-authenticate." });
            }
        }
    }
}
