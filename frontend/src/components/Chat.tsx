import { useState, useEffect, useRef } from 'react';
import theme from '../theme';
import type { ChatMessage } from '../signalR/service';

// FIX: Define the props the component will receive
interface ChatProps {
    messages: ChatMessage[];
    sendMessage: (message: string) => void;
    roomCode: string;
}

const SendIcon = () => (<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>);

// FIX: Use React.FC<ChatProps> to apply the types
const Chat: React.FC<ChatProps> = ({ messages, sendMessage, roomCode }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
            <div className="p-4 border-b" style={{ borderColor: theme.colors.backgroundTertiary }}>
                <h2 className="text-lg font-semibold text-white"># general-chat</h2>
                <p className="text-sm" style={{ color: theme.colors.textMuted }}>Room Code: <span className="font-mono bg-black/20 p-1 rounded">{roomCode}</span></p>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className="flex items-start">
                        {msg.username === 'system' ? (
                            <div className="text-sm italic w-full py-2 border-l-2 pl-4" style={{ color: theme.colors.textMuted, borderColor: theme.colors.interactive }}>{msg.message}</div>
                        ) : (
                            <>
                                <img src={`https://placehold.co/40x40/${theme.colors.primary.substring(1)}/ffffff?text=${msg.username.charAt(0).toUpperCase()}`} alt={msg.username} className="w-10 h-10 rounded-full mr-4" />
                                <div>
                                    <p className="font-semibold" style={{ color: theme.colors.primary }}>{msg.username}<span className="text-xs ml-2 font-normal" style={{ color: theme.colors.textMuted }}>{msg.timestamp}</span></p>
                                    <p className="text-white">{msg.message}</p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4">
                <div className="flex items-center p-2 rounded-lg" style={{ backgroundColor: theme.colors.inputBackground }}>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Message #general-chat" className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none" />
                    <button type="submit" className="ml-2 text-gray-300 hover:text-white"><SendIcon /></button>
                </div>
            </form>
        </div>
    );
};

export default Chat;