import React, { useState } from 'react';
import theme from '../theme';
import type { Track } from '../signalR/service';

// FIX: Define the props the component will receive
interface MusicProps {
    queue: Track[];
    addToQueue: (spotifyTrackId: string) => void;
    roomCode: string;
}

// (Icons would be here: SpotifyIcon, SearchIcon, PlusIcon)
const SpotifyIcon = () => (<svg role="img" width="24" height="24" viewBox="0 0 24 24" className="mr-2" fill="currentColor"><path d="M12 2.163c-5.437 0-9.837 4.4-9.837 9.837S6.563 21.837 12 21.837s9.837-4.4 9.837-9.837S17.437 2.163 12 2.163zm4.684 13.41c-.24.356-.7.46-1.055.22l-2.62-1.62c-.356-.24-.46-.7-.22-1.055.24-.356.7-.46 1.055-.22l2.62 1.62c.355.24.46.7.22 1.055zm1.03-2.31c-.29.435-.86.574-1.3.284l-3.22-1.98c-.434-.29-.573-.86-.283-1.3.29-.435.86-.574 1.3-.284l3.22 1.98c.435.29.574.86.283 1.3zm.14-2.51c-.356.528-1.03.7-1.558.356L8.8 11.1c-.528-.356-.7-1.03-.356-1.558.356-.528 1.03-.7 1.558-.356l6.25 4.22c.528.348.7 1.03.356 1.558z"></path></svg>);
const SearchIcon = () => (<svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const PlusIcon = () => (<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>);

// FIX: Use React.FC<MusicProps> to apply the types
const Music: React.FC<MusicProps> = ({ queue, addToQueue, roomCode }) => {
    // We keep the local state for UI interactions like authorization and search
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Mock API call to Spotify search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setIsSearching(false);
            return;
        }
        // In a real app, this would call your backend:
        // const results = await fetch(`/api/spotify/search?query=${searchQuery}&roomCode=${roomCode}`);
        // For now, we mock it.
        setIsSearching(true);
        console.log("Mock searching for:", searchQuery);
        setSearchResults([
            { spotifyTrackId: 'mock1', title: `Result for ${searchQuery}`, artist: 'Mock Artist', albumArtUrl: '', durationMs: 200000, addedBy: '' }
        ]);
    };

    const handleSelectTrack = (track: Track) => {
        addToQueue(track.spotifyTrackId);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    // The rest of the Music component logic remains largely the same,
    // but it uses the `queue` prop instead of its own mock data.
    // ...
    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
            {/* ... Authorization and Player UI ... */}
            <div className="p-4 border-b" style={{ borderColor: theme.colors.backgroundTertiary }}>
                <form onSubmit={handleSearch}>
                    {/* ... Search Input ... */}
                </form>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                {isSearching ? (
                    <ul>
                        {searchResults.map(track => (
                            <li key={track.spotifyTrackId} className="flex items-center p-2 rounded-md hover:bg-white/5 group">
                                <p className="flex-1 text-white">{track.title}</p>
                                <button onClick={() => handleSelectTrack(track)}><PlusIcon /></button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul>
                        {queue.map((track, index) => (
                            <li key={track.spotifyTrackId} className="flex items-center p-2 rounded-md">
                                <span className="mr-4 text-gray-400">{index + 1}</span>
                                <p className="flex-1 text-white">{track.title} - <span className="text-gray-400">{track.artist}</span></p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Music;
