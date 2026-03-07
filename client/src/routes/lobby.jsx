import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { Lobby as LobbyComponent } from '../components/lobby/Lobby';
import { MapSelection } from '../components/mapSelection/mapSelection';

export const Lobby = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();

    const playerId = window.localStorage.getItem('playerId');

    useEffect(() => {
        if (!playerId) {
            navigate('/');
        }
    }, [playerId, navigate]);

    const [selectedMap, setSelectedMap] = useState(() => {
        const stored = window.localStorage.getItem('selectedMap');
        return stored || null;
    });

    const handleMapSelect = (map) => {
        window.localStorage.setItem('selectedMap', map.sceneKey);
        setSelectedMap(map.sceneKey);
    };

    const {
        players,
        isConnected,
        isAdmin,
        error,
        gameStarted,
        startGame,
        leaveRoom,
    } = useRoom(roomId, playerId);

    // navigate to the actual game route once the server tells us the
    // session has started. Without this the lobby route simply renders
    // nothing (the component returns undefined) and the user appears to
    // be stuck on a blank page.
    useEffect(() => {
        if (gameStarted) {
            // include a flag so the play route knows the redirect was
            // intentional and doesn't immediately bounce us back
            navigate(`/room/${roomId}`, { state: { fromLobby: true } });
        }
    }, [gameStarted, navigate, roomId]);

    const handleLeave = () => {
        window.localStorage.removeItem('selectedMap');
        leaveRoom();
        navigate('/');
    };

    if (!selectedMap) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-black">
                <MapSelection onMapSelect={handleMapSelect} />
            </div>
        );
    }

    if (!gameStarted) {
        return (
            <LobbyComponent
                roomId={roomId}
                players={players}
                isAdmin={isAdmin}
                isConnected={isConnected}
                error={error}
                onStart={startGame}
                onLeave={handleLeave}
            />
        );
    }

    // in the extremely unlikely case the effect above didn't fire we
    // still return null rather than leaving the component undefined.
    return null;
};
