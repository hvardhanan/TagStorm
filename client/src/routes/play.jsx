import { PhaserGame } from '../PhaserGame';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { Lobby } from '../components/lobby/Lobby';
import { MapSelection } from '../components/mapSelection/mapSelection';

export const Play = () => {
    const phaserRef = useRef();
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

    const handleLeave = () => {
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
            <Lobby
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

    return (
        <div>
            <PhaserGame ref={phaserRef} sceneKey={selectedMap} roomId={roomId} />
        </div>
    );
};
