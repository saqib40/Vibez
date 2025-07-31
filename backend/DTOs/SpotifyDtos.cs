// --- SpotifyDtos.cs ---
// This file contains DTOs for deserializing responses from the official Spotify API.
// Using strongly-typed classes instead of dynamic objects makes the code more robust and easier to debug.

using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Vibez.backend.DTOs
{
    /// <summary>
    /// Represents the successful JSON response from Spotify's token endpoint.
    /// We use [JsonPropertyName] to map the snake_case JSON fields to our PascalCase C# properties.
    /// </summary>
    public class SpotifyTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }

    // --- DTOs for Spotify Search Results ---

    public class SpotifySearchResponse
    {
        [JsonPropertyName("tracks")]
        public TrackSearchResult? Tracks { get; set; }
    }

    public class TrackSearchResult
    {
        [JsonPropertyName("items")]
        public List<TrackItem> Items { get; set; } = new List<TrackItem>();
    }

    public class TrackItem
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("artists")]
        public List<ArtistItem> Artists { get; set; } = new List<ArtistItem>();

        [JsonPropertyName("album")]
        public AlbumItem? Album { get; set; }

        [JsonPropertyName("duration_ms")]
        public int DurationMs { get; set; }
    }

    public class ArtistItem
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    public class AlbumItem
    {
        [JsonPropertyName("images")]
        public List<ImageItem> Images { get; set; } = new List<ImageItem>();
    }

    public class ImageItem
    {
        [JsonPropertyName("url")]
        public string Url { get; set; } = string.Empty;

        [JsonPropertyName("height")]
        public int Height { get; set; }
    }
}
