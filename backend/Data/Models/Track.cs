// --- Track.cs ---
// This model represents a single song. It will be used in two places:
// 1. As an object in a list for the music queue.
// 2. As a single object for the "Now Playing" track.
// Like the User model, it's embedded within the Room document.

namespace Vibez.backend.Data.Models
{
    public class Track
    {
        /// <summary>
        /// The unique identifier for the track from Spotify's API.
        /// This is essential for fetching playback details or re-querying the track.
        /// </summary>
        public string SpotifyTrackId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// The primary artist of the song.
        /// </summary>
        public string Artist { get; set; } = string.Empty;
        public string AlbumArtUrl { get; set; } = string.Empty;

        /// <summary>
        /// The duration of the song in milliseconds.
        /// This is useful for the frontend to render a progress bar.
        /// </summary>
        public int DurationMs { get; set; }

        /// <summary>
        /// The username of the person who added this track to the queue.
        /// </summary>
        public string AddedBy { get; set; } = string.Empty;
    }
}
