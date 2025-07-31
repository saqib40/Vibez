// --- SpotifyService.cs ---
// This service encapsulates all communication with the official Spotify Web API.
// It handles building authorization URLs, exchanging codes for tokens, and making API calls like searching.

using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using Vibez.backend.Data;
using Vibez.backend.Data.Models;
using Vibez.backend.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Vibez.backend.Services
{
    public class SpotifyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMongoCollection<Room> _rooms;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _redirectUri;

        public SpotifyService(IConfiguration configuration, IHttpClientFactory httpClientFactory, MongoDbContext context)
        {
            _httpClientFactory = httpClientFactory;
            _rooms = context.Rooms;

            // Fetch Spotify credentials from appsettings.json.
            // This is a secure way to manage secrets without hard-coding them.
            _clientId = configuration["Spotify:ClientId"];
            _clientSecret = configuration["Spotify:ClientSecret"];
            _redirectUri = configuration["Spotify:RedirectUri"];
        }

        /// <summary>
        /// Constructs the URL where we will send the user to grant our application permission.
        /// </summary>
        /// <param name="roomCode">The unique code for our room, which we pass in the 'state' parameter.</param>
        /// <returns>A fully-formed Spotify authorization URL.</returns>
        public string GetAuthorizationUrl(string roomCode)
        {
            // "Scopes" are the specific permissions we are requesting from the user.
            // For example, 'streaming' lets us control playback, and 'user-read-playback-state' lets us see what's playing.
            var scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming";
            
            // We build the URL with several required query parameters:
            // - client_id: Identifies our application to Spotify.
            // - response_type=code: Specifies that we want an authorization code back.
            // - redirect_uri: The URL Spotify should send the user back to after they log in.
            // - state: A random string used to prevent Cross-Site Request Forgery (CSRF) attacks. We cleverly use our roomCode here to identify the request when it comes back.
            // - scope: The list of permissions we are requesting.
            var authUrl = "https://accounts.spotify.com/authorize?" +
                          $"client_id={_clientId}&" +
                          "response_type=code&" +
                          $"redirect_uri={_redirectUri}&" +
                          $"state={roomCode}&" +
                          $"scope={scopes}";
            return authUrl;
        }

        /// <summary>
        /// This method is called from our /callback endpoint. It takes the temporary code from Spotify
        /// and exchanges it for a permanent Access Token and Refresh Token.
        /// </summary>
        /// <param name="code">The temporary authorization code from Spotify.</param>
        /// <param name="roomCode">The room code we passed as 'state' to identify which room to update.</param>
        public async Task ExchangeCodeForTokensAsync(string code, string roomCode)
        {
            var client = _httpClientFactory.CreateClient();

            // We prepare the body of our POST request as required by the OAuth 2.0 standard.
            var requestBody = new Dictionary<string, string>
            {
                // This tells Spotify's server that we are providing an "authorization_code" to be exchanged.
                { "grant_type", "authorization_code" },
                // This is the actual temporary code we received.
                { "code", code },
                // The redirect_uri must exactly match the one we used in the initial authorization request.
                { "redirect_uri", _redirectUri }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token")
            {
                // The request body is sent as "form URL encoded" data.
                Content = new FormUrlEncodedContent(requestBody)
            };

            // For this specific API call, Spotify requires "Basic" authentication.
            // This is our Client ID and Client Secret, combined with a colon, and then Base64 encoded.
            // This proves to Spotify that the request is coming from our legitimate backend server.
            var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_clientId}:{_clientSecret}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authHeader);

            var response = await client.SendAsync(request);
            // This will throw an exception if the response status code is not successful (e.g., 400, 500).
            response.EnsureSuccessStatusCode();

            // We read the JSON response from Spotify and deserialize it into our SpotifyTokenResponse DTO.
            var responseStream = await response.Content.ReadAsStreamAsync();
            var tokenResponse = await JsonSerializer.DeserializeAsync<SpotifyTokenResponse>(responseStream);

            if (tokenResponse != null)
            {
                // Now that we have the tokens, we update the correct room document in our database.
                // In a real production app, you would ENCRYPT these tokens before saving them for security.
                var filter = Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode);
                var update = Builders<Room>.Update
                    .Set(r => r.SpotifyAccessToken, tokenResponse.AccessToken)
                    .Set(r => r.SpotifyRefreshToken, tokenResponse.RefreshToken);

                await _rooms.UpdateOneAsync(filter, update);
            }
        }

        /// <summary>
        /// Searches for tracks on Spotify using the host's access token.
        /// </summary>
        /// <param name="query">The user's search term.</param>
        /// <param name="roomCode">The room the user is in.</param>
        /// <returns>A simplified list of Track objects.</returns>
        public async Task<IEnumerable<Track>> SearchTracksAsync(string query, string roomCode)
        {
            var room = await GetRoomByCode(roomCode);
            if (room?.SpotifyAccessToken == null)
            {
                // If the room doesn't exist or the host hasn't authorized yet, we can't search.
                // In a more advanced implementation, we would check if the token is expired and use the
                // refresh token to get a new one here.
                throw new InvalidOperationException("Host is not authorized or token is missing.");
            }

            var client = _httpClientFactory.CreateClient();
            // For this API call, Spotify requires "Bearer" authentication.
            // We add the host's access token to the request header.
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", room.SpotifyAccessToken);

            // We must properly encode the user's query to handle special characters like spaces, ampersands, etc.
            var encodedQuery = Uri.EscapeDataString(query);
            var response = await client.GetAsync($"https://api.spotify.com/v1/search?q={encodedQuery}&type=track&limit=10");
            response.EnsureSuccessStatusCode();

            var responseStream = await response.Content.ReadAsStreamAsync();
            var searchResponse = await JsonSerializer.DeserializeAsync<SpotifySearchResponse>(responseStream);

            // The response from Spotify is very detailed. We use LINQ's .Select() to map the complex
            // Spotify objects into our simpler, cleaner Track model that the frontend needs.
            return searchResponse?.Tracks?.Items.Select(item => new Track
            {
                SpotifyTrackId = item.Id,
                Title = item.Name,
                Artist = string.Join(", ", item.Artists.Select(a => a.Name)),
                AlbumArtUrl = item.Album?.Images.FirstOrDefault()?.Url ?? "",
                DurationMs = item.DurationMs
            }) ?? Enumerable.Empty<Track>(); // Return an empty list if the search yields no results.
        }
        
        /// <summary>
        /// Gets the full details for a single track by its Spotify ID.
        /// </summary>
        public async Task<Track?> GetTrackByIdAsync(string spotifyTrackId, string roomCode)
        {
            var room = await GetRoomByCode(roomCode);
            if (room?.SpotifyAccessToken == null) throw new InvalidOperationException("Host is not authorized or token is missing.");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", room.SpotifyAccessToken);

            var response = await client.GetAsync($"https://api.spotify.com/v1/tracks/{spotifyTrackId}");
            if (!response.IsSuccessStatusCode) return null;

            var responseStream = await response.Content.ReadAsStreamAsync();
            var item = await JsonSerializer.DeserializeAsync<TrackItem>(responseStream);

            if (item == null) return null;

            return new Track
            {
                SpotifyTrackId = item.Id,
                Title = item.Name,
                Artist = string.Join(", ", item.Artists.Select(a => a.Name)),
                AlbumArtUrl = item.Album?.Images.FirstOrDefault()?.Url ?? "",
                DurationMs = item.DurationMs
            };
        }
        /// <summary>
        /// A private helper method to fetch a room document from the database by its code.
        /// </summary>
        private async Task<Room?> GetRoomByCode(string roomCode)
        {
            return await _rooms.Find(Builders<Room>.Filter.Eq(r => r.RoomCode, roomCode)).FirstOrDefaultAsync();
        }
    }
}
