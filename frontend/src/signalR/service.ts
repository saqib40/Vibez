// manage the Service R connections here
import * as signalR from "@microsoft/signalr";

// Define the shape of a chat message for type safety
export interface ChatMessage {
    username: string;
    message: string;
    timestamp: string;
}

// Define the shape of a Track for type safety
export interface Track {
    spotifyTrackId: string;
    title: string;
    artist: string;
    albumArtUrl: string;
    durationMs: number;
    addedBy: string;
}

// The URL of your ASP.NET Core backend's RoomHub
const HUB_URL = "http://localhost:5128/roomHub";

class SignalRService {
    private connection: signalR.HubConnection | null = null;

    // --- Connection Management ---

    public startConnection = async (roomCode: string, username: string): Promise<void> => {
        if (this.connection) {
            console.log("Connection already exists.");
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL)
            .withAutomaticReconnect()
            .build();

        try {
            await this.connection.start();
            console.log("SignalR Connected.");
            // After connecting, immediately call the JoinRoom method on the hub
            await this.invoke("JoinRoom", roomCode, username);
        } catch (err) {
            console.error("Error while starting SignalR connection: ", err);
        }
    };

    public closeConnection = (): void => {
        if (this.connection) {
            this.connection.stop().then(() => console.log("SignalR Connection stopped."));
            this.connection = null;
        }
    };

    // --- Invoking Hub Methods (Client-to-Server) ---

    public invoke = async (methodName: string, ...args: any[]): Promise<void> => {
        try {
            await this.connection?.invoke(methodName, ...args);
        } catch (err) {
            console.error(`Error invoking ${methodName}: `, err);
        }
    };

    // --- Listening to Hub Events (Server-to-Client) ---

    public on = (methodName: string, newMethod: (...args: any[]) => void): void => {
        this.connection?.on(methodName, newMethod);
    };

    public off = (methodName: string): void => {
        this.connection?.off(methodName);
    };
}

// Export a singleton instance of the service
const signalRService = new SignalRService();
export default signalRService;
