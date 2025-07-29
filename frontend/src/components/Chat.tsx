import theme from "../theme";

const mockChatMessages = [
    { id: 1, user: 'system', text: 'You have joined the room. Alice is the host.', timestamp: '10:30 PM' },
    { id: 2, user: 'Alice', text: 'Hey everyone! Welcome!', avatar: 'https://placehold.co/40x40/7289da/ffffff?text=A', timestamp: '10:31 PM' },
    { id: 3, user: 'Bob', text: 'Hey! What are we listening to first?', avatar: 'https://placehold.co/40x40/43b581/ffffff?text=B', timestamp: '10:31 PM' },
    { id: 4, user: 'Alice', text: 'Not sure yet, taking suggestions!', avatar: 'https://placehold.co/40x40/7289da/ffffff?text=A', timestamp: '10:32 PM' },
];

const SendIcon = () => (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
    </svg>
);

const Chat = () => {
    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
            {/* Header */}
            <div className="p-4 border-b" style={{ borderColor: theme.colors.backgroundTertiary }}>
                <h2 className="text-lg font-semibold text-white"># general-chat</h2>
                <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                    Room Code: <span className="font-mono bg-black/20 p-1 rounded">A4B9K2</span>
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {mockChatMessages.map(msg => (
                    <div key={msg.id} className="flex items-start">
                        {msg.user === 'system' ? (
                            <div className="text-sm italic w-full py-2 border-l-2 pl-4" style={{ color: theme.colors.textMuted, borderColor: theme.colors.interactive }}>
                                {msg.text}
                            </div>
                        ) : (
                            <>
                                <img src={msg.avatar} alt={msg.user} className="w-10 h-10 rounded-full mr-4" />
                                <div>
                                    <p className="font-semibold" style={{ color: theme.colors.primary }}>
                                        {msg.user}
                                        <span className="text-xs ml-2 font-normal" style={{ color: theme.colors.textMuted }}>{msg.timestamp}</span>
                                    </p>
                                    <p className="text-white">{msg.text}</p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4">
                <div className="flex items-center p-2 rounded-lg" style={{ backgroundColor: theme.colors.inputBackground }}>
                    <input
                        type="text"
                        placeholder="Message #general-chat"
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                    />
                    <button className="ml-2 text-gray-300 hover:text-white">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
