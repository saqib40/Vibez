import { useState } from 'react';
import theme from '../theme';

// --- Type Definitions ---
type StatusType = 'success' | 'error';

interface ApiRequestBody {
  username: string;
  roomCode?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  roomCode?: string;
}

// --- Helper Icon Component ---
const ArrowRightIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="h-5 w-5 ml-2"
    >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusType | null>(null);

  const isJoining = roomCode.trim() !== '';

  // Mock API call function with proper types
  const mockApiCall = (endpoint: string, body: ApiRequestBody): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`--- MOCK API REQUEST ---`);
        console.log(`Endpoint: ${endpoint}`);
        console.log(`Body:`, body);
        
        if (body.username.trim() === '') {
            reject(new Error("Username cannot be empty."));
            return;
        }

        if (endpoint.includes('join')) {
            // Simulate a successful join
            if (body.roomCode === '123456') {
                 resolve({ success: true, message: `Successfully joined room ${body.roomCode}!`, roomCode: body.roomCode });
            } else {
                 reject(new Error("Invalid room code. Try '123456'."));
            }
        } else {
            // Simulate a successful room creation
            const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            resolve({ success: true, message: `Room created! Your code is: ${newCode}`, roomCode: newCode });
        }
      }, 1000);
    });
  };

  const handleEnterRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // This event is now correctly typed
    setIsLoading(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
        const endpoint: string = isJoining ? '/api/rooms/join' : '/api/rooms/create';
        const body: ApiRequestBody = { username, ...(isJoining && { roomCode }) };
        
        const response = await mockApiCall(endpoint, body);
        
        setStatusMessage(response.message);
        setStatusType('success');
        // In a real app, you would redirect here:
        // history.push(`/room/${response.roomCode}`);

    } catch (error) {
        if (error instanceof Error) {
            setStatusMessage(error.message);
        } else {
            setStatusMessage("An unknown error occurred.");
        }
        setStatusType('error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4" style={{ backgroundColor: theme.colors.backgroundPrimary }}>
      <div 
        className="w-full max-w-md rounded-lg p-8 space-y-6" 
        style={{ 
            backgroundColor: theme.colors.backgroundSecondary,
            boxShadow: theme.shadows.card,
            borderRadius: theme.borderRadius.card,
        }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: theme.colors.textNormal }}>
            Join the Party
          </h1>
          <p className="mt-2 text-sm" style={{ color: theme.colors.textMuted }}>
            Create a room to share music or join an existing one.
          </p>
        </div>

        <form onSubmit={handleEnterRoom} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-xs font-bold uppercase" style={{ color: theme.colors.textMuted }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your display name"
              className="w-full p-3 mt-1 border-0 focus:ring-2 focus:ring-blurple-500 transition-shadow duration-200"
              style={{ 
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.textNormal,
                  borderRadius: theme.borderRadius.input,
                  outline: 'none',
              }}
            />
          </div>

          <div>
            <label htmlFor="roomCode" className="text-xs font-bold uppercase" style={{ color: theme.colors.textMuted }}>
              Room Code (Optional)
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter code to join a room"
              className="w-full p-3 mt-1 border-0 focus:ring-2 focus:ring-blurple-500 transition-shadow duration-200"
              style={{ 
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.textNormal,
                  borderRadius: theme.borderRadius.input,
                  outline: 'none',
              }}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading || !username}
              className="w-full flex items-center justify-center p-3 font-bold text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blurple-600"
              style={{
                backgroundColor: isLoading ? theme.colors.interactive : theme.colors.primary,
                borderRadius: theme.borderRadius.button,
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isJoining ? 'Join Room' : 'Create & Enter Room'}</span>
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </div>
        </form>
        
        {statusMessage && (
            <div 
                className="p-3 mt-4 text-center text-sm rounded-md"
                style={{
                    backgroundColor: statusType === 'success' ? 'rgba(67, 181, 129, 0.1)' : 'rgba(240, 71, 71, 0.1)',
                    color: statusType === 'success' ? theme.colors.success : theme.colors.danger
                }}
            >
                {statusMessage}
            </div>
        )}
      </div>
    </div>
  );
}
