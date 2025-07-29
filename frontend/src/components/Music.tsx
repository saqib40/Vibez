import React, { useState } from 'react';
import theme from "../theme";

const initialMockQueue = [
    { id: 'track1', title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
    { id: 'track2', title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02' },
];

const mockNowPlaying = {
    title: 'Africa',
    artist: 'TOTO',
    albumArt: 'https://placehold.co/80x80/2f3136/ffffff?text=TOTO',
    progress: 40, // percentage
};

const mockSearchResults = [
    { id: 'search1', title: 'Don\'t Stop Me Now', artist: 'Queen', duration: '3:29' },
    { id: 'search2', title: 'Somebody to Love', artist: 'Queen', duration: '4:56' },
    { id: 'search3', title: 'Another One Bites the Dust', artist: 'Queen', duration: '3:35' },
];

const SpotifyIcon = () => (
  <svg role="img" width="24" height="24" viewBox="0 0 24 24" className="mr-2" fill="currentColor">
    <path d="M12 2.163c-5.437 0-9.837 4.4-9.837 9.837S6.563 21.837 12 21.837s9.837-4.4 9.837-9.837S17.437 2.163 12 2.163zm4.684 13.41c-.24.356-.7.46-1.055.22l-2.62-1.62c-.356-.24-.46-.7-.22-1.055.24-.356.7-.46 1.055-.22l2.62 1.62c.355.24.46.7.22 1.055zm1.03-2.31c-.29.435-.86.574-1.3.284l-3.22-1.98c-.434-.29-.573-.86-.283-1.3.29-.435.86-.574 1.3-.284l3.22 1.98c.435.29.574.86.283 1.3zm.14-2.51c-.356.528-1.03.7-1.558.356L8.8 11.1c-.528-.356-.7-1.03-.356-1.558.356-.528 1.03-.7 1.558-.356l6.25 4.22c.528.348.7 1.03.356 1.558z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Music: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [queue, setQueue] = useState(initialMockQueue);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockSearchResults>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleAuthorize = () => {
    setIsAuthorized(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setTimeout(() => setSearchResults(mockSearchResults), 500);
  };

  const handleAddToQueue = (track: typeof mockSearchResults[0]) => {
    setQueue(prev => [...prev, track]);
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
        <h2 className="text-2xl font-bold text-white mb-4">Connect your Spotify</h2>
        <p className="text-center mb-8" style={{ color: theme.colors.textMuted }}>
          To control the music, the host needs to log in.
        </p>
        <button
          onClick={handleAuthorize}
          className="flex items-center justify-center px-6 py-3 font-bold text-white rounded-full transition-transform hover:scale-105"
          style={{ backgroundColor: theme.colors.spotifyGreen }}
        >
          <SpotifyIcon />Login with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
      {/* Now Playing */}
      <div className="p-4 border-b" style={{ borderColor: theme.colors.backgroundTertiary }}>
        <h3 className="text-xs uppercase font-bold mb-4" style={{ color: theme.colors.textMuted }}>Now Playing</h3>
        <div className="flex items-center">
          <img src={mockNowPlaying.albumArt} alt={mockNowPlaying.title} className="w-20 h-20 rounded-md mr-4" />
          <div className="flex-1">
            <p className="font-bold text-lg" style={{ color: theme.colors.textNormal }}>{mockNowPlaying.title}</p>
            <p className="text-sm" style={{ color: theme.colors.textMuted }}>{mockNowPlaying.artist}</p>
            <div className="w-full mt-2 rounded-full h-1.5" style={{ backgroundColor: theme.colors.interactive }}>
              <div className="h-1.5 rounded-full" style={{ width: `${mockNowPlaying.progress}%`, backgroundColor: theme.colors.textNormal }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b" style={{ borderColor: theme.colors.backgroundTertiary }}>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for songs..."
            className="w-full bg-transparent border-2 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1"
            style={{ borderColor: theme.colors.interactive, color: theme.colors.textNormal }}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
        </form>
      </div>

      {/* Results / Queue */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isSearching ? (
          <>
            <h3 className="text-xs uppercase font-bold mb-4" style={{ color: theme.colors.textMuted }}>Search Results</h3>
            <ul>
              {searchResults.map(track => (
                <li key={track.id} className="flex items-center p-2 rounded-md hover:bg-white/5 group">
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: theme.colors.textNormal }}>{track.title}</p>
                    <p className="text-xs" style={{ color: theme.colors.textMuted }}>{track.artist}</p>
                  </div>
                  <button onClick={() => handleAddToQueue(track)} className="p-1 rounded-full bg-transparent text-gray-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <PlusIcon />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h3 className="text-xs uppercase font-bold mb-4" style={{ color: theme.colors.textMuted }}>Up Next</h3>
            <ul>
              {queue.map((track, index) => (
                <li key={track.id} className="flex items-center p-2 rounded-md hover:bg-white/5">
                  <span className="mr-4 font-mono text-sm" style={{ color: theme.colors.textMuted }}>{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: theme.colors.textNormal }}>{track.title}</p>
                    <p className="text-xs" style={{ color: theme.colors.textMuted }}>{track.artist}</p>
                  </div>
                  <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>{track.duration}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Music;
