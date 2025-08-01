import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Chat from '../components/Chat';
import Music from '../components/Music';
import signalRService from '../signalR/service';
import type { ChatMessage, Track } from '../signalR/service';
import theme from '../theme';

const RoomPage = () => {
    // Get the room code from the URL (e.g., /room/A4B9K2)
    const { roomCode } = useParams<{ roomCode: string }>();
    // Get the username passed from the HomePage
    const location = useLocation();
    const username = location.state?.username || 'Guest';

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [queue, setQueue] = useState<Track[]>([]);
    const [users, setUsers] = useState<string[]>([]); // To display a user list later

    useEffect(() => {
        if (!roomCode) return;

        // --- Establish Connection ---
        signalRService.startConnection(roomCode, username);

        // --- Register Event Listeners ---
        signalRService.on("ReceiveMessage", (user: string, message: string, timestamp: string) => {
            setMessages(prevMessages => [...prevMessages, { username: user, message, timestamp }]);
        });

        signalRService.on("UserJoined", (joinedUser: string) => {
            console.log(`${joinedUser} has joined.`);
            setUsers(prevUsers => [...prevUsers, joinedUser]);
            setMessages(prevMessages => [...prevMessages, { username: 'system', message: `${joinedUser} has joined the room.`, timestamp: '' }]);
        });

        signalRService.on("UserLeft", (leftUser: string) => {
            console.log(`${leftUser} has left.`);
            setUsers(prevUsers => prevUsers.filter(u => u !== leftUser));
            setMessages(prevMessages => [...prevMessages, { username: 'system', message: `${leftUser} has left the room.`, timestamp: '' }]);
        });

        signalRService.on("QueueUpdated", (newQueue: Track[]) => {
            console.log("Queue updated:", newQueue);
            setQueue(newQueue);
        });

        // --- Cleanup on component unmount ---
        return () => {
            signalRService.closeConnection();
            // Unregister listeners to prevent memory leaks
            signalRService.off("ReceiveMessage");
            signalRService.off("UserJoined");
            signalRService.off("UserLeft");
            signalRService.off("QueueUpdated");
        };
    }, [roomCode, username]); // Re-run effect if roomCode or username changes

    // --- Functions to pass down to child components ---

    const sendMessage = (message: string) => {
        if (roomCode && message.trim()) {
            signalRService.invoke("SendMessage", roomCode, username, message);
        }
    };

    const addToQueue = (spotifyTrackId: string) => {
        if (roomCode) {
            signalRService.invoke("AddToQueue", roomCode, spotifyTrackId, username);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: theme.colors.backgroundTertiary }}>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-0">
                <div className="lg:col-span-2 xl:col-span-3 h-screen">
                    <Chat 
                        messages={messages} 
                        sendMessage={sendMessage} 
                        roomCode={roomCode ?? 'N/A'} 
                    />
                </div>
                <div className="lg:col-span-1 xl:col-span-1 h-screen border-l" style={{ borderColor: theme.colors.backgroundTertiary }}>
                    <Music 
                        queue={queue} 
                        addToQueue={addToQueue} 
                        roomCode={roomCode ?? 'N/A'}
                    />
                </div>
            </div>
        </div>
    );
};

export default RoomPage;
