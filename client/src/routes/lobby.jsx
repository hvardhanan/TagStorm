import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useRoom, roomStateCache } from '../hooks/useRoom';
import { Lobby as LobbyComponent } from '../components/lobby/Lobby';
import { MapSelection } from '../components/mapSelection/mapSelection';

export const Lobby = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const location = useLocation();

    const playerId = window.localStorage.getItem('playerId');

    useEffect(() => {
        if (!playerId) {
            navigate('/');
        }
    }, [playerId, navigate]);

    const isFromRematch = location.state?.fromRematch;
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
        resetRoomState, // Add this
    } = useRoom(roomId, playerId);

    // Reset game state when coming from rematch
    useEffect(() => {
        if (isFromRematch && roomId) {
            // Call resetRoomState to also update useRoom state!
            if (resetRoomState) {
                resetRoomState();
            }
            // Clear the location state to allow future game starts
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [isFromRematch, roomId, navigate, location.pathname, resetRoomState]);

    // navigate to the actual game route once the server tells us the
    // session has started. Without this the lobby route simply renders
    // nothing (the component returns undefined) and the user appears to
    // be stuck on a blank page.
    useEffect(() => {
        if (gameStarted && !isFromRematch) {
            navigate(`/room/${roomId}`, { state: { fromLobby: true } });
        }
    }, [gameStarted, navigate, roomId, isFromRematch]);

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

    const readyPlayers = players.filter(p => p.isReady !== false);

    if (!gameStarted) {
        return (
            <LobbyComponent
                roomId={roomId}
                players={readyPlayers}
                isAdmin={isAdmin}
                isConnected={isConnected}
                error={error}
                onStart={startGame}
                onLeave={handleLeave}
            />
        );
    }
    return null;
};
