import theme from '../theme';
import Chat from '../components/Chat';
import Music from '../components/Music';

export default function RoomPage() {
    return (
        <div className="min-h-screen flex" style={{ backgroundColor: theme.colors.backgroundTertiary }}>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-0">
                <div className="lg:col-span-2 xl:col-span-3 h-screen">
                    <Chat />
                </div>
                <div className="lg:col-span-1 xl:col-span-1 h-screen border-l" style={{ borderColor: theme.colors.backgroundTertiary }}>
                    <Music />
                </div>
            </div>
        </div>
    );
}
